import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const outputRoot = path.join(process.cwd(), ".migration", "supabase-assets");
const manifestPath = path.join(outputRoot, "manifest.json");
const reportPath = path.join(process.cwd(), ".migration", "upload-report.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const bucket = process.env.SUPABASE_STORAGE_BUCKET || manifest.bucket;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Faltan credenciales de Supabase en .env.local");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function mapConcurrent(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

const uploadResults = await mapConcurrent(manifest.images, 5, async (item) => {
  const filePath = path.join(outputRoot, ...item.storagePath.split("/"));
  const body = await fs.readFile(filePath);
  const { error } = await supabase.storage.from(bucket).upload(item.storagePath, body, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });

  if (!error) return { path: item.storagePath, status: "uploaded" };

  const duplicate =
    error.statusCode === "409" ||
    /already exists|duplicate/i.test(error.message || "");
  if (duplicate) return { path: item.storagePath, status: "already-existed" };

  throw new Error(`${item.storagePath}: ${error.message}`);
});

const verification = await mapConcurrent(manifest.images, 5, async (item) => {
  const { data, error } = await supabase.storage.from(bucket).download(item.storagePath);
  if (error) throw new Error(`No se pudo verificar ${item.storagePath}: ${error.message}`);

  const remoteBuffer = Buffer.from(await data.arrayBuffer());
  const remoteHash = createHash("sha256").update(remoteBuffer).digest("hex");
  if (remoteHash !== item.sha256) {
    throw new Error(`Checksum distinto para ${item.storagePath}`);
  }

  return { path: item.storagePath, bytes: remoteBuffer.length, sha256: remoteHash };
});

const report = {
  completedAt: new Date().toISOString(),
  bucket,
  images: manifest.images.length,
  videosExcluded: manifest.excludedVideos.length,
  uploaded: uploadResults.filter((item) => item.status === "uploaded").length,
  alreadyExisted: uploadResults.filter((item) => item.status === "already-existed").length,
  checksumsVerified: verification.length,
  uploadResults,
};

await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  bucket: report.bucket,
  images: report.images,
  uploaded: report.uploaded,
  alreadyExisted: report.alreadyExisted,
  checksumsVerified: report.checksumsVerified,
  videosExcluded: report.videosExcluded,
}));

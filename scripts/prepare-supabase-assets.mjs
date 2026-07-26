import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const workspace = process.cwd();
const sourceRoot = path.join(workspace, "public");
const outputRoot = path.join(workspace, ".migration", "supabase-assets");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg"]);
const videoExtensions = new Set([".mov", ".mp4", ".webm"]);

function safeSegment(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "asset";
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolutePath)));
    if (entry.isFile()) files.push(absolutePath);
  }

  return files;
}

const files = await walk(sourceRoot);
const images = files.filter((file) =>
  imageExtensions.has(path.extname(file).toLowerCase()),
);
const excludedVideos = files.filter((file) =>
  videoExtensions.has(path.extname(file).toLowerCase()),
);

await fs.rm(outputRoot, { recursive: true, force: true });
await fs.mkdir(outputRoot, { recursive: true });

const reservedTargets = new Map();
const manifest = [];

for (const sourcePath of images) {
  const relativeSource = path.relative(sourceRoot, sourcePath);
  const parsed = path.parse(relativeSource);
  const safeDirectory = parsed.dir
    .split(path.sep)
    .filter(Boolean)
    .map(safeSegment);
  const safeName = safeSegment(parsed.name);
  let relativeTarget = path.join(...safeDirectory, `${safeName}.webp`);
  const targetKey = relativeTarget.toLowerCase();

  if (reservedTargets.has(targetKey)) {
    const suffix = parsed.ext.slice(1).toLowerCase();
    relativeTarget = path.join(...safeDirectory, `${safeName}-${suffix}.webp`);
  }
  reservedTargets.set(relativeTarget.toLowerCase(), relativeSource);

  const targetPath = path.join(outputRoot, relativeTarget);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  if (path.extname(sourcePath).toLowerCase() === ".webp") {
    await fs.copyFile(sourcePath, targetPath);
  } else {
    await sharp(sourcePath, { animated: true })
      .rotate()
      .webp({ quality: 82, effort: 5, alphaQuality: 90 })
      .toFile(targetPath);
  }

  const [sourceStat, targetStat, targetBuffer] = await Promise.all([
    fs.stat(sourcePath),
    fs.stat(targetPath),
    fs.readFile(targetPath),
  ]);

  manifest.push({
    source: relativeSource.replaceAll(path.sep, "/"),
    storagePath: relativeTarget.replaceAll(path.sep, "/"),
    originalBytes: sourceStat.size,
    webpBytes: targetStat.size,
    sha256: createHash("sha256").update(targetBuffer).digest("hex"),
    contentType: "image/webp",
  });
}

const manifestPath = path.join(outputRoot, "manifest.json");
await fs.writeFile(
  manifestPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      sourceRoot: "public",
      bucket: process.env.SUPABASE_STORAGE_BUCKET || "portfolio-assets",
      images: manifest,
      excludedVideos: excludedVideos.map((file) =>
        path.relative(sourceRoot, file).replaceAll(path.sep, "/"),
      ),
    },
    null,
    2,
  )}\n`,
  "utf8",
);

const originalBytes = manifest.reduce((total, item) => total + item.originalBytes, 0);
const webpBytes = manifest.reduce((total, item) => total + item.webpBytes, 0);

console.log(
  JSON.stringify({
    imagesPrepared: manifest.length,
    videosExcluded: excludedVideos.length,
    originalMB: Number((originalBytes / 1024 / 1024).toFixed(2)),
    webpMB: Number((webpBytes / 1024 / 1024).toFixed(2)),
    reductionPercent: Number((100 - (webpBytes / originalBytes) * 100).toFixed(2)),
    output: path.relative(workspace, outputRoot),
  }),
);

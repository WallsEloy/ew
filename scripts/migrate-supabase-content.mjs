import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const { profiles } = await import(
  pathToFileURL(path.join(process.cwd(), "lib", "galeriaData.js"))
);
const { disenoProfiles } = await import(
  pathToFileURL(path.join(process.cwd(), "lib", "disenoData.js"))
);

const manifest = JSON.parse(
  await fs.readFile(
    path.join(process.cwd(), ".migration", "supabase-assets", "manifest.json"),
    "utf8",
  ),
);
const bucket = process.env.SUPABASE_STORAGE_BUCKET;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function normalizeSource(value) {
  if (!value || /^https?:\/\//i.test(value)) return null;
  return decodeURIComponent(value)
    .replace(/^\/+/, "")
    .replaceAll("\\", "/")
    .toLowerCase();
}

function slugify(value) {
  return String(value || "proyecto")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "proyecto";
}

const storageBySource = new Map(
  manifest.images.map((item) => [normalizeSource(item.source), item.storagePath]),
);

function storagePathFor(value) {
  const normalized = normalizeSource(value);
  return normalized ? storageBySource.get(normalized) || null : null;
}

function publicAssetUrl(storagePath) {
  if (!storagePath) return null;
  return supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}

async function upsertCollection(profile, section, position) {
  const slug = slugify(profile.name);
  const row = {
    section,
    slug,
    name: profile.name,
    logo_path: storagePathFor(profile.logo),
    avatar_path: storagePathFor(profile.avatar),
    bio: profile.bio || "",
    position,
    published: true,
    metadata: { stats: profile.stats || {}, legacyId: profile.id },
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("portfolio_collections")
    .upsert(row, { onConflict: "section,slug" })
    .select("id")
    .single();
  if (error) throw new Error(`Colección ${section}/${slug}: ${error.message}`);
  return data.id;
}

async function migrateProfile(profile, section, position) {
  const collectionId = await upsertCollection(profile, section, position);
  let mediaCount = 0;

  for (const [projectPosition, post] of (profile.posts || []).entries()) {
    const title = (post.caption || `${profile.name} ${projectPosition + 1}`)
      .split("#")[0]
      .trim();
    const projectSlug = `${post.id ?? projectPosition}-${slugify(title)}`;
    const storagePath = storagePathFor(post.image);
    const coverPath = storagePath || post.image || null;

    const { data: project, error: projectError } = await supabase
      .from("portfolio_projects")
      .upsert(
        {
          collection_id: collectionId,
          legacy_id: Number.isInteger(post.id) ? post.id : projectPosition,
          slug: projectSlug,
          title,
          caption: post.caption || "",
          cover_path: coverPath,
          position: projectPosition,
          published: true,
          metadata: {
            likes: post.likes || 0,
            isHorizontal: Boolean(post.isHorizontal),
            comments: post.comments || [],
            sourceImage: post.image || null,
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "collection_id,slug" },
      )
      .select("id")
      .single();
    if (projectError) throw new Error(`Proyecto ${projectSlug}: ${projectError.message}`);

    if (storagePath) {
      const { error: mediaError } = await supabase
        .from("portfolio_media")
        .upsert(
          {
            project_id: project.id,
            storage_path: storagePath,
            media_type: "image",
            alt_text: title,
            position: 0,
          },
          { onConflict: "project_id,storage_path" },
        );
      if (mediaError) throw new Error(`Media ${storagePath}: ${mediaError.message}`);
      mediaCount += 1;
    }
  }

  const { error: clearHighlightsError } = await supabase
    .from("portfolio_highlights")
    .delete()
    .eq("collection_id", collectionId);
  if (clearHighlightsError) throw clearHighlightsError;

  const highlights = (profile.highlights || []).map((highlight, index) => ({
    collection_id: collectionId,
    title: highlight.title || `Destacado ${index + 1}`,
    image_path: storagePathFor(highlight.image) || highlight.image || null,
    position: index,
    published: true,
  }));
  if (highlights.length) {
    const { error } = await supabase.from("portfolio_highlights").insert(highlights);
    if (error) throw error;
  }

  return { projects: profile.posts?.length || 0, media: mediaCount, highlights: highlights.length };
}

const totals = { collections: 0, projects: 0, media: 0, highlights: 0 };
for (const [section, sectionProfiles] of [
  ["galeria", profiles],
  ["diseno", disenoProfiles],
]) {
  for (const [position, profile] of sectionProfiles.entries()) {
    const result = await migrateProfile(profile, section, position);
    totals.collections += 1;
    totals.projects += result.projects;
    totals.media += result.media;
    totals.highlights += result.highlights;
  }
}

const { data: slides, error: slidesError } = await supabase
  .from("home_slides")
  .select("id,image");
if (slidesError && slidesError.code !== "PGRST205") throw slidesError;

let slidesUpdated = 0;
for (const slide of slides || []) {
  const storagePath = storagePathFor(slide.image);
  if (!storagePath) continue;
  const { error } = await supabase
    .from("home_slides")
    .update({ image: publicAssetUrl(storagePath), updated_at: new Date().toISOString() })
    .eq("id", slide.id);
  if (error) throw error;
  slidesUpdated += 1;
}

console.log(JSON.stringify({ ...totals, slidesUpdated }));

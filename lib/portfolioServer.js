// Lectura/escritura del contenido de portafolio (Diseño/Galería) en Supabase.
// SOLO servidor (usa service_role). Mapea portfolio_collections/projects a la
// misma forma que lib/disenoData.js y lib/galeriaData.js, con fallback local.
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabaseServer";
import { disenoProfiles } from "./disenoData";
import { profiles as galeriaProfiles } from "./galeriaData";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "portfolio-assets";

function localProfiles(section) {
  return section === "galeria" ? galeriaProfiles : disenoProfiles;
}

// Resuelve un asset: URL absoluta o ruta que empieza por "/" se usan tal cual;
// una ruta relativa se interpreta como objeto del bucket público.
function resolveAsset(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
  const supabase = getSupabaseAdmin();
  if (!supabase) return value;
  return supabase.storage.from(BUCKET).getPublicUrl(value).data.publicUrl;
}

function mapProject(project) {
  const meta = project.metadata || {};
  return {
    id: project.position, // numérico, igual que el esquema local
    image: resolveAsset(project.cover_path),
    caption: project.caption || "",
    likes: meta.likes ?? 0,
    isLiked: false,
    isHorizontal: Boolean(meta.isHorizontal),
    comments: meta.comments ?? [],
  };
}

function mapCollection(collection, projects, highlights) {
  const meta = collection.metadata || {};
  const stats = meta.stats || {};
  const posts = (projects || [])
    .filter((p) => p.collection_id === collection.id)
    .map(mapProject);
  const hls = (highlights || [])
    .filter((h) => h.collection_id === collection.id)
    .map((h) => ({ id: h.id, title: h.title, image: resolveAsset(h.image_path) }));
  return {
    id: meta.legacyId ?? collection.position ?? 0,
    name: collection.name,
    logo: resolveAsset(collection.logo_path),
    avatar: resolveAsset(collection.avatar_path),
    bio: collection.bio || "",
    stats: {
      posts: posts.length,
      followers: stats.followers ?? "0",
      following: stats.following ?? "0",
    },
    highlights: hls,
    posts,
  };
}

// --- Lectura pública (solo published) con fallback local ---------------------
export async function getProfiles(section) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { profiles: localProfiles(section), source: "local" };

  try {
    const { data: collections, error } = await supabase
      .from("portfolio_collections")
      .select("*")
      .eq("section", section)
      .eq("published", true)
      .order("position", { ascending: true });
    if (error) throw error;
    if (!collections || collections.length === 0) {
      return { profiles: localProfiles(section), source: "local" };
    }

    const ids = collections.map((c) => c.id);
    const [{ data: projects }, { data: highlights }] = await Promise.all([
      supabase
        .from("portfolio_projects")
        .select("*")
        .in("collection_id", ids)
        .eq("published", true)
        .order("position", { ascending: true }),
      supabase
        .from("portfolio_highlights")
        .select("*")
        .in("collection_id", ids)
        .eq("published", true)
        .order("position", { ascending: true }),
    ]);

    const profiles = collections.map((c) => mapCollection(c, projects, highlights));
    return { profiles, source: "db" };
  } catch (err) {
    console.error("[portfolioServer] getProfiles falló, usando local:", err.message);
    return { profiles: localProfiles(section), source: "local" };
  }
}

// Un proyecto concreto para la página de detalle (reutiliza getProfiles).
export async function getProfileProject(section, profileId, projectId) {
  const { profiles } = await getProfiles(section);
  const profile = profiles.find((p) => String(p.id) === String(profileId));
  const post = profile?.posts.find((p) => String(p.id) === String(projectId));
  if (!profile || !post) return null;
  return {
    profileName: profile.name,
    profileBio: profile.bio,
    caption: post.caption,
    image: post.image,
    gallery: [post, ...profile.posts.filter((item) => item.id !== post.id)]
      .filter((item) => item.image)
      .slice(0, 7)
      .map((item) => ({
        id: item.id,
        image: item.image,
        caption: item.caption,
      })),
  };
}

// --- Editor (todas las colecciones, campos editables) ------------------------
export async function getCollectionsForEditor(section) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data: cols, error } = await supabase
    .from("portfolio_collections")
    .select("*")
    .eq("section", section)
    .order("position", { ascending: true });
  if (error) throw error;

  const ids = (cols || []).map((c) => c.id);
  const counts = {};
  if (ids.length) {
    const { data: projs } = await supabase
      .from("portfolio_projects")
      .select("id,collection_id")
      .in("collection_id", ids);
    for (const p of projs || []) counts[p.collection_id] = (counts[p.collection_id] || 0) + 1;
  }

  return (cols || []).map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    bio: c.bio || "",
    avatarPath: c.avatar_path || "",
    avatarUrl: resolveAsset(c.avatar_path),
    logoPath: c.logo_path || "",
    logoUrl: resolveAsset(c.logo_path),
    followers: c.metadata?.stats?.followers ?? "",
    following: c.metadata?.stats?.following ?? "",
    postsCount: counts[c.id] || 0,
    published: Boolean(c.published),
    position: c.position ?? 0,
  }));
}

// Actualiza una colección preservando metadata (legacyId, etc.).
export async function updateCollection(id, patch = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado (.env.local)");

  const { data: existing, error: e0 } = await supabase
    .from("portfolio_collections")
    .select("metadata")
    .eq("id", id)
    .single();
  if (e0) throw e0;

  const metadata = { ...(existing.metadata || {}) };
  if (patch.stats) metadata.stats = { ...(metadata.stats || {}), ...patch.stats };

  const row = { metadata, updated_at: new Date().toISOString() };
  for (const key of ["name", "bio", "avatar_path", "logo_path", "published", "position"]) {
    if (patch[key] !== undefined) row[key] = patch[key];
  }

  const { data, error } = await supabase
    .from("portfolio_collections")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

// --- Posts (portfolio_projects) para el editor -------------------------------
function mapProjectEditor(p) {
  return {
    id: p.id,
    caption: p.caption || "",
    coverPath: p.cover_path || "",
    coverUrl: resolveAsset(p.cover_path),
    position: p.position ?? 0,
    published: Boolean(p.published),
  };
}

export async function getProjectsForEditor(collectionId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { collection: null, projects: [] };

  const { data: col } = await supabase
    .from("portfolio_collections")
    .select("id,name,section")
    .eq("id", collectionId)
    .maybeSingle();

  const { data: projs, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("collection_id", collectionId)
    .order("position", { ascending: true });
  if (error) throw error;

  return {
    collection: col ? { id: col.id, name: col.name, section: col.section } : null,
    projects: (projs || []).map(mapProjectEditor),
  };
}

// Crea un post en blanco al final (published=false hasta que tenga contenido).
export async function createProject(collectionId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado (.env.local)");

  const { data: last } = await supabase
    .from("portfolio_projects")
    .select("position")
    .eq("collection_id", collectionId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("portfolio_projects")
    .insert({
      collection_id: collectionId,
      slug: `post-${Date.now()}`,
      title: "Nuevo post",
      caption: "",
      cover_path: null,
      position,
      published: false,
      metadata: {},
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapProjectEditor(data);
}

export async function updateProject(id, patch = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado (.env.local)");

  const row = { updated_at: new Date().toISOString() };
  for (const key of ["caption", "cover_path", "published", "position"]) {
    if (patch[key] !== undefined) row[key] = patch[key];
  }

  const { data, error } = await supabase
    .from("portfolio_projects")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapProjectEditor(data);
}

// Borra un post (y por cascada su media asociada).
export async function deleteProject(id) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado (.env.local)");
  const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export { isSupabaseConfigured };

// Lectura/escritura del contenido de portafolio (Diseño/Galería) en Supabase.
// SOLO servidor (usa service_role). Mapea portfolio_collections/projects a la
// misma forma que lib/disenoData.js y lib/galeriaData.js, con fallback local.
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabaseServer";
import { disenoProfiles } from "./disenoData";
import { profiles as galeriaProfiles } from "./galeriaData";
import { FICHA_CAMPOS } from "./fichaCampos";
import { normalizarLogoReverso } from "./logosReverso";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "portfolio-assets";

function databaseSection(section) {
  return section === "coding" ? "diseno" : section;
}

function belongsToSection(collection, section) {
  const contentType = collection.metadata?.contentType;
  return section === "coding" ? contentType === "coding" : section !== "diseno" || contentType !== "coding";
}

function localProfiles(section) {
  if (section === "galeria") return galeriaProfiles;
  if (section === "coding") return [];
  return disenoProfiles;
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

/*
 * Portadas de una colección. La clave buena es metadata.portadas (lista); se
 * acepta la antigua metadata.portada (una sola) para las filas guardadas antes
 * de que existiera el carrusel.
 */
function listaPortadas(meta = {}) {
  const lista = Array.isArray(meta.portadas) ? meta.portadas.filter(Boolean) : [];
  if (lista.length) return lista;
  return meta.portada ? [meta.portada] : [];
}

/*
 * Bloque de presentación de la cabecera (logo + descripción + cuenta atrás).
 * Uno por colección. `hasta` se guarda como ISO en UTC para que la cuenta atrás
 * termine en el mismo instante para todo el mundo.
 */
function mapPresentacion(meta = {}) {
  const p = meta.presentacion || {};
  const c = p.contador || {};
  return {
    logo: resolveAsset(p.logo) || null,
    descripcion: p.descripcion || "",
    contador: {
      activo: Boolean(c.activo),
      hasta: c.hasta || "",
      etiqueta: c.etiqueta || "",
    },
  };
}

function mapProject(project) {
  const meta = project.metadata || {};
  return {
    id: project.position, // numérico, igual que el esquema local
    title: project.title || "",
    image: resolveAsset(project.cover_path),
    caption: project.caption || "",
    likes: meta.likes ?? 0,
    isLiked: false,
    isHorizontal: Boolean(meta.isHorizontal),
    // Sesión de fotos a la que pertenece (Fotografía las agrupa por sesión)
    sesion: meta.sesion || "",
    comments: meta.comments ?? [],
    // Ficha técnica del reverso de la tarjeta (FeedModal lee post.meta.<clave>)
    meta: meta.ficha || {},
    holograma: meta.holograma || null,
    // Cuál de los dos logotipos va arriba en el reverso
    logoReverso: normalizarLogoReverso(meta.logoReverso),
    web: {
      author: meta.web?.author || "EW Studio",
      views: meta.web?.views || "0",
      badge: meta.web?.badge || "PRO",
      type: meta.web?.type || "UI / UX",
      video: Boolean(meta.web?.video),
    },
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
    // Portadas del carrusel de la cabecera (sólo escritorio). Si no hay ninguna,
    // el carrusel no se pinta.
    portadas: listaPortadas(meta).map(resolveAsset).filter(Boolean),
    presentacion: mapPresentacion(meta),
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
      .eq("section", databaseSection(section))
      .eq("published", true)
      .order("position", { ascending: true });
    if (error) throw error;
    const sectionCollections = (collections || []).filter((collection) => belongsToSection(collection, section));
    if (sectionCollections.length === 0) {
      return { profiles: localProfiles(section), source: "local" };
    }

    const ids = sectionCollections.map((c) => c.id);
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

    const profiles = sectionCollections.map((c) => mapCollection(c, projects, highlights));
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
    title: post.title,
    caption: post.caption,
    image: post.image,
    meta: post.meta,
    web: post.web,
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
    .eq("section", databaseSection(section))
    .order("position", { ascending: true });
  if (error) throw error;

  const sectionCols = (cols || []).filter((collection) => belongsToSection(collection, section));
  const ids = sectionCols.map((c) => c.id);
  const counts = {};
  if (ids.length) {
    const { data: projs } = await supabase
      .from("portfolio_projects")
      .select("id,collection_id")
      .in("collection_id", ids);
    for (const p of projs || []) counts[p.collection_id] = (counts[p.collection_id] || 0) + 1;
  }

  return sectionCols.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    bio: c.bio || "",
    avatarPath: c.avatar_path || "",
    avatarUrl: resolveAsset(c.avatar_path),
    logoPath: c.logo_path || "",
    logoUrl: resolveAsset(c.logo_path),
    // Lista de portadas en pares ruta/url, para pintar la vista previa
    portadas: listaPortadas(c.metadata).map((p) => ({
      path: p,
      url: resolveAsset(p),
    })),
    // Bloque de presentación, en campos planos para el formulario
    presentacionLogoPath: c.metadata?.presentacion?.logo || "",
    presentacionLogoUrl: resolveAsset(c.metadata?.presentacion?.logo),
    presentacionDescripcion: c.metadata?.presentacion?.descripcion || "",
    contadorActivo: Boolean(c.metadata?.presentacion?.contador?.activo),
    contadorHasta: c.metadata?.presentacion?.contador?.hasta || "",
    contadorEtiqueta: c.metadata?.presentacion?.contador?.etiqueta || "",
    followers: c.metadata?.stats?.followers ?? "",
    following: c.metadata?.stats?.following ?? "",
    postsCount: counts[c.id] || 0,
    published: Boolean(c.published),
    position: c.position ?? 0,
  }));
}

export async function createCollection(section, values = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado (.env.local)");

  const { data: last } = await supabase
    .from("portfolio_collections")
    .select("position")
    .eq("section", databaseSection(section))
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("portfolio_collections")
    .insert({
      section: databaseSection(section),
      slug: values.slug || `${section}-${Date.now()}`,
      name: values.name || "Nueva colección",
      bio: values.bio || "",
      position: (last?.position ?? -1) + 1,
      published: values.published ?? true,
      metadata: {
        ...(values.metadata || {}),
        ...(section === "coding" ? { contentType: "coding" } : {}),
      },
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
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
  // Las portadas no tienen columna propia: viven en metadata, como stats. Al
  // guardar la lista se borra la clave antigua para no dejar dos verdades.
  if (patch.portadas !== undefined) {
    metadata.portadas = (patch.portadas || []).filter(Boolean);
    delete metadata.portada;
  }
  if (patch.presentacion !== undefined) {
    const p = patch.presentacion || {};
    metadata.presentacion = {
      logo: p.logo || "",
      descripcion: p.descripcion || "",
      contador: {
        activo: Boolean(p.contador?.activo),
        hasta: p.contador?.hasta || "",
        etiqueta: p.contador?.etiqueta || "",
      },
    };
  }

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
  const meta = p.metadata || {};
  const ficha = meta.ficha || {};
  return {
    id: p.id,
    title: p.title || "",
    caption: p.caption || "",
    coverPath: p.cover_path || "",
    coverUrl: resolveAsset(p.cover_path),
    position: p.position ?? 0,
    published: Boolean(p.published),
    isHorizontal: Boolean(meta.isHorizontal),
    likes: meta.likes ?? 0,
    holograma: meta.holograma || "",
    logoReverso: normalizarLogoReverso(meta.logoReverso),
    webAuthor: meta.web?.author || "EW Studio",
    webViews: meta.web?.views || "0",
    webBadge: meta.web?.badge || "PRO",
    webType: meta.web?.type || "UI / UX",
    webVideo: Boolean(meta.web?.video),
    // Cada campo de la ficha como texto; etiquetas se edita como lista separada por comas
    ficha: FICHA_CAMPOS.reduce(
      (acc, campo) => ({ ...acc, [campo.key]: ficha[campo.key] ?? "" }),
      {},
    ),
    etiquetas: Array.isArray(ficha.etiquetas) ? ficha.etiquetas.join(", ") : "",
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
  for (const key of ["title", "caption", "cover_path", "published", "position"]) {
    if (patch[key] !== undefined) row[key] = patch[key];
  }

  // metadata se fusiona: lo que no manda el editor (comments, likes de antes…)
  // se conserva tal cual.
  if (patch.metadata) {
    const { data: existing, error: e0 } = await supabase
      .from("portfolio_projects")
      .select("metadata")
      .eq("id", id)
      .single();
    if (e0) throw e0;

    const previo = existing?.metadata || {};
    row.metadata = {
      ...previo,
      ...patch.metadata,
      ficha: { ...(previo.ficha || {}), ...(patch.metadata.ficha || {}) },
      web: { ...(previo.web || {}), ...(patch.metadata.web || {}) },
    };
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

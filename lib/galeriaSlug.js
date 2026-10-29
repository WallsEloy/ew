// Dirección propia de cada galería: "Fotografía" -> "fotografia",
// "Ice Cream" -> "icecream". Se deriva del nombre para no depender de un
// campo extra en Supabase.
export function slugGaleria(name = "") {
  return String(name)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export const rutaGaleria = (name) => `/galeria/${slugGaleria(name)}`;

// Subcategorías de Galerías: agrupan varias galerías bajo un mismo botón. El
// orden de `galerias` es el orden en que se muestran dentro del grupo.
export const GRUPOS_GALERIA = [
  { slug: "exposiciones", nombre: "Exposiciones", galerias: ["humans", "anacronismo", "icecream"] },
  // Sketch, Concept Art y Fotografía comparten fila de botones entre ellas
  { slug: "estudio", nombre: "Estudio", galerias: ["sketch", "conceptart", "fotografia"] },
];

export const grupoDeGaleria = (slug) =>
  GRUPOS_GALERIA.find((grupo) => grupo.galerias.includes(slug)) || null;

/*
 * Botones de primer nivel: cada galería suelta y, en el lugar de la primera de
 * sus miembros, el botón de su grupo. Cada grupo trae sus galerías ya en orden
 * (solo las que existen).
 */
export function menuGalerias(profiles = []) {
  const menu = [];
  for (const profile of profiles) {
    const slug = slugGaleria(profile.name);
    const grupo = grupoDeGaleria(slug);
    if (!grupo) {
      menu.push({ tipo: "galeria", slug, nombre: profile.name, href: rutaGaleria(profile.name) });
      continue;
    }
    if (menu.some((item) => item.slug === grupo.slug)) continue;
    const miembros = grupo.galerias
      .map((s) => profiles.find((p) => slugGaleria(p.name) === s))
      .filter(Boolean)
      .map((p) => ({ slug: slugGaleria(p.name), nombre: p.name, href: rutaGaleria(p.name) }));
    menu.push({ tipo: "grupo", slug: grupo.slug, nombre: grupo.nombre, href: miembros[0]?.href, miembros });
  }
  return menu;
}

// Dirección de una serie dentro de una galería (Concept Art agrupa por el
// campo «Colección» de la ficha): "Serie A · Androide" -> "serie-a-androide".
export function slugSerie(nombre = "") {
  return String(nombre)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Series de una galería en orden de aparición: [{ nombre, slug, posts }]
export function seriesDeGaleria(posts = []) {
  const series = [];
  for (const post of posts) {
    const nombre = post.meta?.coleccion || "";
    let serie = series.find((s) => s.nombre === nombre);
    if (!serie) {
      serie = { nombre, slug: slugSerie(nombre) || "sin-serie", posts: [] };
      series.push(serie);
    }
    serie.posts.push(post);
  }
  return series;
}

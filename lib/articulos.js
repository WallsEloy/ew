// Artículos de Grow y de Diseño. Cada uno indica su sección y tiene su página
// en /<seccion>/articulos/<slug>; cada sección lista solo los suyos.
// El cuerpo es una lista de bloques: { h2 } para subtítulos, { p } para
// párrafos y { lista } para viñetas. Los **textos** van en negritas. Un
// artículo con `experiencia` muestra en su lugar una página interactiva.
export const ARTICULOS = [
  {
    seccion: "grow",
    slug: "big-data",
    titulo: "Big Data",
    bajada: "Cómo los datos convierten cada campaña en una conversación que mejora sola.",
    categoria: "Marketing y datos",
    fecha: "2026-10-09",
    lectura: "experiencia interactiva",
    // Página interactiva: hero Saturno + experiencia de partículas (sin texto)
    experiencia: "big-data",
  },
];

export const SECCIONES_ARTICULOS = {
  grow: { nombre: "Grow", ruta: "/grow/articulos" },
  diseno: { nombre: "Diseño", ruta: "/diseno/articulos" },
};

export const getArticulos = (seccion) => ARTICULOS.filter((a) => a.seccion === seccion);

export const getArticulo = (seccion, slug) =>
  ARTICULOS.find((a) => a.seccion === seccion && a.slug === slug) || null;

/*
 * Campos de la ficha técnica de una pieza.
 * Vive aparte (sin dependencias de servidor) porque lo usan las dos orillas:
 * el editor del dashboard para pintar el formulario y portfolioServer para
 * normalizar lo que se guarda en portfolio_projects.metadata.ficha.
 *
 * El reverso de la tarjeta (components/galeria/FeedModal.jsx) lee estas mismas
 * claves en post.meta, así que si añades una aquí, añádela también allí.
 */
export const FICHA_CAMPOS = [
  { key: "coleccion", label: "Colección", placeholder: "Serie urbana · Vol. 03" },
  { key: "anio", label: "Año", placeholder: "2025" },
  { key: "ubicacion", label: "Ubicación", placeholder: "Ciudad de México, MX" },
  { key: "tecnica", label: "Técnica", placeholder: "Fotografía digital · Luz natural" },
  { key: "equipo", label: "Equipo", placeholder: "Nikon D750 · 50 mm f/1.8" },
  { key: "exposicion", label: "Exposición", placeholder: "f/2.8 · 1/250 s · ISO 400" },
  { key: "formato", label: "Formato", placeholder: "3000 × 4000 px · sRGB" },
  { key: "licencia", label: "Licencia", placeholder: "© Eloy Walls — uso con permiso" },
  { key: "referencia", label: "Referencia", placeholder: "EW-001" },
];

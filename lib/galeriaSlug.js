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

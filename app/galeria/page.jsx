import { redirect } from "next/navigation";
import { getProfiles } from "../../lib/portfolioServer";
import { rutaGaleria } from "../../lib/galeriaSlug";

// Página en caché: el dashboard la regenera al guardar (revalidatePath) y,
// como red de seguridad, se vuelve a generar como máximo cada 5 minutos.
export const revalidate = 300;

// Cada galería vive en su propia página (/galeria/humans, /galeria/sketch...).
// /galeria a secas lleva a la primera.
export default async function GaleriaPage() {
  const { profiles } = await getProfiles("galeria");
  if (!profiles.length) {
    return <div className="md:pt-[120px] px-6 text-white/70">Sin contenido.</div>;
  }
  redirect(rutaGaleria(profiles[0].name));
}

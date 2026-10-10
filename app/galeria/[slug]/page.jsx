import { notFound, redirect } from "next/navigation";
import GaleriaProfiles from "../GaleriaProfiles";
import { getProfiles } from "../../../lib/portfolioServer";
import { GRUPOS_GALERIA, menuGalerias, slugGaleria } from "../../../lib/galeriaSlug";

// Página en caché: el dashboard la regenera al guardar (revalidatePath) y,
// como red de seguridad, se vuelve a generar como máximo cada 5 minutos.
export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { profiles } = await getProfiles("galeria");
  const profile = profiles.find((p) => slugGaleria(p.name) === params.slug);
  const grupo = GRUPOS_GALERIA.find((g) => g.slug === params.slug);
  if (grupo) return { title: grupo.nombre };
  if (!profile) return { title: "Galería" };
  return {
    title: profile.name,
    description: `${profile.name}: galería de fotografía y arte de Eloy Walls.`,
  };
}

export default async function GaleriaSlugPage({ params }) {
  // Lee de Supabase (fallback local si no hay datos/credenciales).
  const { profiles } = await getProfiles("galeria");
  // /galeria/exposiciones (un grupo) lleva a su primera galería
  const grupo = menuGalerias(profiles).find((item) => item.tipo === "grupo" && item.slug === params.slug);
  if (grupo?.href) redirect(grupo.href);
  if (!profiles.some((p) => slugGaleria(p.name) === params.slug)) notFound();
  return <GaleriaProfiles profiles={profiles} activeSlug={params.slug} />;
}

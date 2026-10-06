import { notFound } from "next/navigation";
import GaleriaProfiles from "../GaleriaProfiles";
import { getProfiles } from "../../../lib/portfolioServer";
import { slugGaleria } from "../../../lib/galeriaSlug";

// Página en caché: el dashboard la regenera al guardar (revalidatePath) y,
// como red de seguridad, se vuelve a generar como máximo cada 5 minutos.
export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { profiles } = await getProfiles("galeria");
  const profile = profiles.find((p) => slugGaleria(p.name) === params.slug);
  if (!profile) return { title: "Galería" };
  return {
    title: profile.name,
    description: `${profile.name}: galería de fotografía y arte de Eloy Walls.`,
  };
}

export default async function GaleriaSlugPage({ params }) {
  // Lee de Supabase (fallback local si no hay datos/credenciales).
  const { profiles } = await getProfiles("galeria");
  if (!profiles.some((p) => slugGaleria(p.name) === params.slug)) notFound();
  return <GaleriaProfiles profiles={profiles} activeSlug={params.slug} />;
}

import { notFound } from "next/navigation";
import SerieGaleria from "../../SerieGaleria";
import { getProfiles } from "../../../../lib/portfolioServer";
import { seriesDeGaleria, slugGaleria } from "../../../../lib/galeriaSlug";

// Igual que /galeria/<slug>: en caché y regenerada al guardar en el dashboard
export const revalidate = 300;

// Subpágina de una serie (p. ej. /galeria/conceptart/serie-a-androide):
// todas las imágenes que comparten el campo «Colección» de la ficha.
async function buscarSerie(params) {
  const { profiles } = await getProfiles("galeria");
  const profile = profiles.find((p) => slugGaleria(p.name) === params.slug);
  if (!profile) return null;
  const serie = seriesDeGaleria(profile.posts).find((s) => s.slug === params.serie);
  return serie ? { profile, serie } : null;
}

export async function generateMetadata({ params }) {
  const encontrado = await buscarSerie(params);
  if (!encontrado) return { title: "Galería" };
  const { profile, serie } = encontrado;
  const nombre = serie.nombre || profile.name;
  return {
    title: `${nombre} · ${profile.name}`,
    description: `${nombre}: serie de ${profile.name} de Eloy Walls.`,
    openGraph: { images: serie.posts[0]?.image ? [serie.posts[0].image] : [] },
  };
}

export default async function SeriePage({ params }) {
  const encontrado = await buscarSerie(params);
  if (!encontrado) notFound();
  const { profile, serie } = encontrado;
  return (
    <SerieGaleria
      galeria={{ nombre: profile.name, href: `/galeria/${params.slug}` }}
      serie={{ nombre: serie.nombre, posts: serie.posts }}
    />
  );
}

import GaleriaProfiles from "./GaleriaProfiles";
import { getProfiles } from "../../lib/portfolioServer";

// Página en caché: el dashboard la regenera al guardar (revalidatePath) y,
// como red de seguridad, se vuelve a generar como máximo cada 5 minutos.
export const revalidate = 300;

export const metadata = {
  title: "Galería",
  description: "Fotografía y arte de Eloy Walls.",
};

export default async function GaleriaPage() {
  // Lee de Supabase (fallback local si no hay datos/credenciales).
  const { profiles } = await getProfiles("galeria");
  return <GaleriaProfiles profiles={profiles} />;
}

import GaleriaProfiles from "./GaleriaProfiles";
import { getProfiles } from "../../lib/portfolioServer";

export const dynamic = "force-dynamic";

export default async function GaleriaPage() {
  // Lee de Supabase (fallback local si no hay datos/credenciales).
  const { profiles } = await getProfiles("galeria");
  return <GaleriaProfiles profiles={profiles} />;
}

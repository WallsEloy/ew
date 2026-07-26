import DisenoProfiles from "./DisenoProfiles";
import { getProfiles } from "../../lib/portfolioServer";

export const dynamic = "force-dynamic";

export default async function DisenoPage() {
  // Lee de Supabase (fallback local si no hay datos/credenciales).
  const { profiles } = await getProfiles("diseno");
  return <DisenoProfiles profiles={profiles} />;
}

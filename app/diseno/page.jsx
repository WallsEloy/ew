import DisenoProfiles from "./DisenoProfiles";
import { getProfiles } from "../../lib/portfolioServer";

export const dynamic = "force-dynamic";

export default async function DisenoPage({ searchParams }) {
  // Lee de Supabase (fallback local si no hay datos/credenciales).
  const { profiles } = await getProfiles("diseno");
  const query = await searchParams;
  const webIndex = profiles.findIndex((profile) => String(profile.id) === "2" || /web/i.test(`${profile.name} ${profile.bio}`));
  const initialProfile = query?.vista === "web" && webIndex >= 0 ? webIndex : 0;
  return <DisenoProfiles profiles={profiles} initialProfile={initialProfile} />;
}

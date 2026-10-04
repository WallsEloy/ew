import DisenoProfiles from "./DisenoProfiles";
import { getProfiles } from "../../lib/portfolioServer";

export const dynamic = "force-dynamic";

export default async function DisenoPage({ searchParams }) {
  // Lee de Supabase (fallback local si no hay datos/credenciales).
  const { profiles } = await getProfiles("diseno");
  const query = await searchParams;
  const webIndex = profiles.findIndex((profile) => String(profile.id) === "2" || /web/i.test(`${profile.name} ${profile.bio}`));
  // ?vista=isotipos (o el nombre de otra colección) abre esa área directamente
  const vistaIndex = query?.vista ? profiles.findIndex((profile) => profile.name?.toLowerCase() === String(query.vista).toLowerCase()) : -1;
  const initialProfile = query?.vista === "web" && webIndex >= 0 ? webIndex : vistaIndex >= 0 ? vistaIndex : 0;
  return <DisenoProfiles profiles={profiles} initialProfile={initialProfile} />;
}

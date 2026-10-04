import ProfileHeader from "../../components/galeria/ProfileHeader";
import Highlights from "../../components/galeria/Highlights";
import WebShowcase from "../diseno/WebShowcase";
import { getProfiles } from "../../lib/portfolioServer";

export const metadata = { title: "Coding" };
// Página en caché: el dashboard la regenera al guardar (revalidatePath) y,
// como red de seguridad, se vuelve a generar como máximo cada 5 minutos.
export const revalidate = 300;

export default async function CodingPage() {
  const { profiles } = await getProfiles("coding");
  const profile = profiles[0];

  if (!profile) {
    // Sin colección todavía: muestra el grid con cuadros de referencia.
    return (
      <main className="min-h-screen bg-black pt-[120px]">
        <WebShowcase profile={{ id: "coding", posts: [] }} variant="coding" basePath="/coding" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pt-[120px]">
      <ProfileHeader profile={profile} />
      <Highlights highlights={profile.highlights} />
      <WebShowcase profile={profile} variant="coding" basePath="/coding" />
    </main>
  );
}

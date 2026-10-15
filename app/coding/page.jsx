import HeroCodigo from "../../components/HeroCodigo";
import Highlights from "../../components/galeria/Highlights";
import WebShowcase from "../diseno/WebShowcase";
import Link from "next/link";
import { getProfiles } from "../../lib/portfolioServer";
import areas from "../diseno/page.module.css";

export const metadata = { title: "Coding" };
// Página en caché: el dashboard la regenera al guardar (revalidatePath) y,
// como red de seguridad, se vuelve a generar como máximo cada 5 minutos.
export const revalidate = 300;

// Misma fila de áreas que en Diseño (Branding · Isotipos · Carteles · Web · Coding);
// aquí las de Diseño son enlaces a su vista
const AREAS = [
  ["Branding", "/diseno?vista=branding"],
  ["Isotipos", "/diseno?vista=isotipos"],
  ["Carteles", "/diseno?vista=carteles"],
  ["Web", "/diseno?vista=web"],
];

function BotonesAreas() {
  return (
    <div className={areas.buttonsContainer}>
      {AREAS.map(([nombre, href]) => (
        <Link key={nombre} href={href} className={areas.profileButton}>{nombre}</Link>
      ))}
      <span className={`${areas.profileButton} ${areas.profileButtonActive}`} aria-current="page">Coding</span>
    </div>
  );
}

export default async function CodingPage() {
  const { profiles } = await getProfiles("coding");
  const profile = profiles[0];

  if (!profile) {
    // Sin colección todavía: muestra el grid con cuadros de referencia.
    return (
      <main className="min-h-screen bg-black md:pt-[120px]">
        <BotonesAreas />
        <HeroCodigo titulo="Coding" variante="software" />
        <WebShowcase profile={{ id: "coding", posts: [] }} variant="coding" basePath="/coding" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black md:pt-[120px]">
      <BotonesAreas />
      {/* Hero con código que se escribe solo (mismo de Web, con datos de software) */}
      <HeroCodigo titulo="Coding" proyectos={profile.posts.length} variante="software" />
      <Highlights highlights={profile.highlights} />
      <WebShowcase profile={profile} variant="coding" basePath="/coding" />
    </main>
  );
}

import HomeCarousel from "../components/HomeCarousel";
import LogosCarrusel from "../components/LogosCarrusel";
import ProcesoScroll from "../components/ProcesoScroll";
import VideoModulo from "../components/VideoModulo";
import VisualGraphs from "../components/VisualGraphs";
import { getSlides } from "../lib/supabaseServer";

// Render dinámico para reflejar al instante las ediciones del dashboard.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { slides } = await getSlides();

  // El home es inmersivo: el nav overlaya el carrusel a propósito. El margen
  // negativo cancela el espaciador global solo aquí en móvil.
  return (
    // Columna flex para poder reordenar por CSS: en escritorio el módulo de
    // vídeo se coloca ANTES del carrusel (order: -1 en VideoModulo.module.css),
    // mientras que en móvil se queda en el orden del marcado, debajo.
    <main className="min-h-screen bg-black w-full overflow-x-clip -mt-[94px] md:mt-0 flex flex-col">
      <HomeCarousel slides={slides} />
      {/* Módulo de vídeo: contenido en data/moduloVideo.js */}
      <VideoModulo />
      {/* Proceso: vídeo recorrido con el scroll (data/moduloProceso.js) */}
      <ProcesoScroll />
      {/* Tira de logotipos que desfila (data/logosCarrusel.js) */}
      <LogosCarrusel />
      <VisualGraphs />
    </main>
  );
}

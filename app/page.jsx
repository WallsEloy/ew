import HomeCarousel from "../components/HomeCarousel";
import LogosCarrusel from "../components/LogosCarrusel";
import ProcesoScroll from "../components/ProcesoScroll";
import VideoModulo from "../components/VideoModulo";
import VisualGraphs from "../components/VisualGraphs";
import { getSlides } from "../lib/supabaseServer";
import { getVideosHome } from "../lib/videosHomeConfig";

// Render dinámico para reflejar al instante las ediciones del dashboard.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { slides } = await getSlides();
  // Vídeos y textos de los dos módulos, editables en /dashboard/home/videos
  const { config: videos } = await getVideosHome();

  // El home es inmersivo: el nav overlaya el carrusel a propósito. El margen
  // negativo cancela el espaciador global solo aquí en móvil.
  return (
    // Columna flex para poder reordenar por CSS: en escritorio el módulo de
    // vídeo se coloca ANTES del carrusel (order: -1 en VideoModulo.module.css),
    // mientras que en móvil se queda en el orden del marcado, debajo.
    <main className="min-h-screen bg-black w-full overflow-x-clip -mt-[94px] md:mt-0 flex flex-col">
      {/* El póster del módulo de vídeo es lo primero que se ve en escritorio: se
          pide con prioridad para que la cabecera no aparezca en negro mientras
          el vídeo (que va aparte y en diferido) todavía no ha llegado. */}
      {videos.video.poster && (
        // eslint-disable-next-line @next/next/no-head-element
        <link
          rel="preload"
          as="image"
          href={videos.video.poster}
          fetchPriority="high"
        />
      )}
      <HomeCarousel slides={slides} />
      {/* Módulo de vídeo (dashboard → Home → Vídeos) */}
      <VideoModulo config={videos.video} />
      {/* Proceso: vídeo recorrido con el scroll (mismo panel) */}
      <ProcesoScroll config={videos.proceso} />
      {/* Tira de logotipos que desfila (data/logosCarrusel.js) */}
      <LogosCarrusel />
      <VisualGraphs />
    </main>
  );
}

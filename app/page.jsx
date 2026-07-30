import HomeCarousel from "../components/HomeCarousel";
import LogosCarrusel from "../components/LogosCarrusel";
import ProcesoScroll from "../components/ProcesoScroll";
import VideoModulo from "../components/VideoModulo";
import VisualGraphs from "../components/VisualGraphs";
import Footer from "../components/Footer";
import { getFocosCarrusel } from "../lib/focoCarrusel";
import { getSlides } from "../lib/supabaseServer";
import { getVideosHome } from "../lib/videosHomeConfig";

// Render dinámico para reflejar al instante las ediciones del dashboard.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { slides } = await getSlides();
  // Vídeos y textos de los dos módulos, editables en /dashboard/home/videos
  const { config: videos } = await getVideosHome();
  // Punto de enfoque de cada imagen del carrusel (dashboard → Home → Carrusel)
  const { focos } = await getFocosCarrusel();

  // El home es inmersivo: el nav superpone la Vitrina a propósito. El margen
  // negativo cancela el espaciador global solo aquí en móvil.
  return (
    // El orden del marcado es también el orden visual en escritorio y móvil.
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
      {/* Módulo de vídeo (dashboard → Home → Vídeos) */}
      <VideoModulo config={videos.video} />
      <HomeCarousel slides={slides} focos={focos} />
      {/* Proceso: vídeo recorrido con el scroll (mismo panel) */}
      <ProcesoScroll config={videos.proceso} />
      {/* Tira de logotipos que desfila (data/logosCarrusel.js) */}
      <LogosCarrusel />
      <VisualGraphs />
      <Footer />
    </main>
  );
}

import HomeCarousel from "../components/HomeCarousel";
import VisualGraphs from "../components/VisualGraphs";
import { getSlides } from "../lib/supabaseServer";

// Render dinámico para reflejar al instante las ediciones del dashboard.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { slides } = await getSlides();

  // El home es inmersivo: el nav overlaya el carrusel a propósito. El margen
  // negativo cancela el espaciador global solo aquí en móvil.
  return (
    <main className="min-h-screen bg-black w-full overflow-x-clip -mt-[94px] md:mt-0">
      <HomeCarousel slides={slides} />
      <VisualGraphs />
    </main>
  );
}

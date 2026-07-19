import HomeCarousel from "../components/HomeCarousel";
import VisualGraphs from "../components/VisualGraphs";
import { getSlides } from "../lib/supabaseServer";

// Render dinámico para reflejar al instante las ediciones del dashboard.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { slides } = await getSlides();

  return (
    <main className="min-h-screen bg-black w-full overflow-x-clip">
      <HomeCarousel slides={slides} />
      <VisualGraphs />
    </main>
  );
}

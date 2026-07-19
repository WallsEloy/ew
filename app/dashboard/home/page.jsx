import Link from "next/link";
import CarouselEditor from "../../../components/dashboard/CarouselEditor";

export const metadata = { title: "Dashboard · Carrusel del Home" };
export const dynamic = "force-dynamic";

export default function DashboardHomePage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-10 pt-24 pb-16">
      <div className="mx-auto w-full max-w-5xl">
        <nav className="text-sm text-gray-400 mb-2">
          <Link href="/dashboard" className="hover:text-white underline">
            Dashboard
          </Link>{" "}
          / Carrusel del Home
        </nav>
        <h1 className="text-2xl font-bold mb-1">Carrusel del Home</h1>
        <p className="text-sm text-gray-400 mb-6">
          Edita los slides: textos, botón, color, imagen, orden. Agrega o quita
          slides y guarda.
        </p>
        <CarouselEditor />
      </div>
    </main>
  );
}

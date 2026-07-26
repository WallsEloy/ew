import CarouselEditor from "../../../../components/dashboard/CarouselEditor";

export const metadata = { title: "Dashboard · Carrusel del Home" };
export const dynamic = "force-dynamic";

export default function DashboardCarruselPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <nav className="text-sm text-gray-400 mb-2">
        <a href="/dashboard/home" className="hover:text-white underline">
          Home
        </a>{" "}
        / Carrusel
      </nav>
      <h1 className="text-2xl font-bold mb-1">Carrusel del Home</h1>
      <p className="text-sm text-gray-400 mb-6">
        Edita los slides: textos, botón, color, imagen, orden. Agrega o quita
        slides y guarda.
      </p>
      <CarouselEditor />
    </div>
  );
}

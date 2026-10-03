import PortfolioEditor from "../../../components/dashboard/PortfolioEditor";

export const metadata = { title: "Dashboard · Coding" };
export const dynamic = "force-dynamic";

export default function DashboardCodingPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="mb-1 text-2xl font-bold">Coding · Proyectos</h1>
      <p className="mb-6 text-sm text-gray-400">
        Administra el perfil y todos los proyectos Coding: portada, título,
        descripción, autor, métricas, categoría, ficha técnica, publicación y orden.
      </p>
      <PortfolioEditor section="coding" />
    </div>
  );
}

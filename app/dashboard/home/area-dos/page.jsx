import AreaDosEditor from "../../../../components/dashboard/AreaDosEditor";

export const metadata = { title: "Dashboard · Área dos" };
export const dynamic = "force-dynamic";

export default function DashboardAreaDosPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <nav className="text-sm text-gray-400 mb-2">
        <a href="/dashboard/home" className="hover:text-white underline">
          Home
        </a>{" "}
        / Área dos
      </nav>
      <h1 className="text-2xl font-bold mb-1">Área dos · Grafos visuales</h1>
      <p className="text-sm text-gray-400 mb-6">
        Edita el título y el texto de cada escena, y agrega o quita escenas. La
        animación de los nodos no cambia.
      </p>
      <AreaDosEditor />
    </div>
  );
}

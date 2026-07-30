import GrowEditor from "../../../components/dashboard/GrowEditor";

export const metadata = { title: "Dashboard · Grow" };
export const dynamic = "force-dynamic";

export default function DashboardGrowPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="mb-1 text-2xl font-bold">Grow · Opción A</h1>
      <p className="mb-6 text-sm text-gray-400">Edita la cabecera, las tarjetas y el contenido inicial de cada página de proyecto.</p>
      <GrowEditor />
    </div>
  );
}

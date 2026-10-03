import GrowFlowEditor from "../../../../components/dashboard/GrowFlowEditor";

export const metadata = { title: "Dashboard · Flujo de Grow" };

export default function DashboardGrowFlowPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="mb-1 text-2xl font-bold">Grow · Flujo de marketing</h1>
      <p className="mb-6 text-sm text-gray-400">Modifica posiciones, visibilidad de módulos y conexiones del diagrama React Flow.</p>
      <GrowFlowEditor />
    </div>
  );
}

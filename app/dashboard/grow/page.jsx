import GrowEditor from "../../../components/dashboard/GrowEditor";
import Link from "next/link";

export const metadata = { title: "Dashboard · Grow" };
export const dynamic = "force-dynamic";

export default function DashboardGrowPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="mb-1 text-2xl font-bold">Grow · Opción A</h1>
      <p className="mb-6 text-sm text-gray-400">Edita la cabecera, las tarjetas y el contenido inicial de cada página de proyecto.</p>
      <Link href="/dashboard/grow/flujo" className="mb-6 inline-flex rounded border border-[#00aff0] px-4 py-2 text-sm font-semibold text-[#00aff0]">Editar flujo de marketing →</Link>
      <GrowEditor />
    </div>
  );
}

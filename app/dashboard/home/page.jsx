import Link from "next/link";
import { DASHBOARD_NAV } from "../../../components/dashboard/dashboardNav";

export const metadata = { title: "Dashboard · Home" };

const HOME = DASHBOARD_NAV.find((s) => s.href === "/dashboard/home");
const PANELS = HOME?.children ?? [];

export default function DashboardHomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Home</h1>
      <p className="text-sm text-gray-400 mb-6">
        Paneles de edición del home. Elige qué quieres editar.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PANELS.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="box-border block rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-5 hover:border-[#00aff0] transition-colors"
          >
            <h2 className="text-lg font-semibold mb-1">{p.label}</h2>
            <p className="text-sm text-gray-400">{p.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

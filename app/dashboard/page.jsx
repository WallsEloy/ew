import Link from "next/link";
import { DASHBOARD_NAV } from "../../components/dashboard/dashboardNav";

export const metadata = { title: "Dashboard" };

// Tarjetas de sección: todo el nav salvo la propia portada ("Inicio").
const SECTIONS = DASHBOARD_NAV.filter((s) => s.href !== "/dashboard");

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-gray-400 mb-6">
        Edita el contenido del sitio. Empezando por el home.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map((s) =>
          s.available ? (
            <Link
              key={s.href}
              href={s.href}
              className="box-border block rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-5 hover:border-[#00aff0] transition-colors"
            >
              <h2 className="text-lg font-semibold mb-1">{s.label}</h2>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </Link>
          ) : (
            <div
              key={s.href}
              aria-disabled="true"
              className="box-border block rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-5 opacity-45 cursor-not-allowed"
            >
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold">{s.label}</h2>
                <span className="text-[0.6rem] uppercase tracking-wide px-1.5 py-0.5 rounded-full border border-[#333] text-gray-400">
                  Pronto
                </span>
              </div>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

import Link from "next/link";

export const metadata = { title: "Dashboard" };

const SECTIONS = [
  {
    href: "/dashboard/home",
    title: "Home · Carrusel",
    desc: "Edita los slides del carrusel: textos, botones, colores, imágenes y orden.",
    available: true,
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-10 pt-24 pb-16">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-gray-400 mb-6">
          Edita el contenido del sitio. Empezando por el home.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="box-border block rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-5 hover:border-[#00aff0] transition-colors"
            >
              <h2 className="text-lg font-semibold mb-1">{s.title}</h2>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

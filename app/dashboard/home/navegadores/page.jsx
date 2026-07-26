import NavegadoresEditor from "../../../../components/dashboard/NavegadoresEditor";

export const metadata = { title: "Dashboard · Navegadores" };
export const dynamic = "force-dynamic";

export default function DashboardNavegadoresPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <nav className="text-sm text-gray-400 mb-2">
        <a href="/dashboard/home" className="hover:text-white underline">
          Home
        </a>{" "}
        / Navegadores
      </nav>
      <h1 className="text-2xl font-bold mb-1">Navegadores</h1>
      <p className="text-sm text-gray-400 mb-6">
        Edita el navegador superior y el dock inferior móvil: logos, botones de
        registro/login y los accesos del dock (texto, URL, icono, orden).
      </p>
      <NavegadoresEditor />
    </div>
  );
}

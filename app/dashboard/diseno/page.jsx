import PortfolioEditor from "../../../components/dashboard/PortfolioEditor";

export const metadata = { title: "Dashboard · Diseño" };
export const dynamic = "force-dynamic";

export default function DashboardDisenoPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Diseño · Perfiles</h1>
      <p className="text-sm text-gray-400 mb-6">
        Edita cada perfil: nombre, bio, avatar, logo, seguidores/seguidos,
        visibilidad y orden. Dentro de cada perfil, «Imágenes del perfil» abre el
        gestor de posts. En el perfil Web, «Proyectos Web» permite modificar la
        portada, título, descripción, autor, vistas, insignia, categoría, video y
        ficha técnica de cada subpágina.
      </p>
      <PortfolioEditor section="diseno" />
    </div>
  );
}

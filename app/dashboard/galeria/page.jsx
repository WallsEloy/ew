import PortfolioEditor from "../../../components/dashboard/PortfolioEditor";

export const metadata = { title: "Dashboard · Galería" };
export const dynamic = "force-dynamic";

export default function DashboardGaleriaPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Galería · Perfiles</h1>
      <p className="text-sm text-gray-400 mb-6">
        Edita cada galería: nombre, bio, avatar, logo, seguidores/seguidos,
        visibilidad y orden. Dentro de cada una, «Imágenes del perfil» abre el
        gestor de piezas: subir y quitar imágenes, descripción y ficha técnica
        (la que sale al girar la tarjeta).
      </p>
      <PortfolioEditor section="galeria" />
    </div>
  );
}

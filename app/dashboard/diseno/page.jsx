import DisenoEditor from "../../../components/dashboard/DisenoEditor";

export const metadata = { title: "Dashboard · Diseño" };
export const dynamic = "force-dynamic";

export default function DashboardDisenoPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Diseño · Perfiles</h1>
      <p className="text-sm text-gray-400 mb-6">
        Edita cada perfil: nombre, bio, avatar, logo, seguidores/seguidos,
        visibilidad y orden. Los posts se editarán en un paso siguiente.
      </p>
      <DisenoEditor />
    </div>
  );
}

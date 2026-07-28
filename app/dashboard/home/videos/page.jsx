import VideosHomeEditor from "../../../../components/dashboard/VideosHomeEditor";

export const metadata = { title: "Dashboard · Vídeos del home" };
export const dynamic = "force-dynamic";

export default function DashboardVideosPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <nav className="text-sm text-gray-400 mb-2">
        <a href="/dashboard/home" className="hover:text-white underline">
          Home
        </a>{" "}
        / Vídeos
      </nav>
      <h1 className="text-2xl font-bold mb-1">Vídeos del home</h1>
      <p className="text-sm text-gray-400 mb-6">
        Reemplaza los vídeos de los dos módulos y edita sus textos. Los efectos no
        cambian: el primero seguirá reproduciéndose en bucle con sonido y onda, y
        el segundo seguirá recorriéndose con el scroll. Al subir un vídeo se
        genera su póster automáticamente.
      </p>
      <VideosHomeEditor />
    </div>
  );
}

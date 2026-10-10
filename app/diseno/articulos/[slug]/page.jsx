import { notFound } from "next/navigation";
import Articulo from "../../../../components/articulos/Articulo";
import { getArticulo, getArticulos } from "../../../../lib/articulos";

export function generateStaticParams() {
  return getArticulos("diseno").map((articulo) => ({ slug: articulo.slug }));
}

export function generateMetadata({ params }) {
  const articulo = getArticulo("diseno", params.slug);
  if (!articulo) return { title: "Artículos" };
  return { title: articulo.titulo, description: articulo.bajada };
}

export default function ArticuloDisenoPage({ params }) {
  const articulo = getArticulo("diseno", params.slug);
  if (!articulo) notFound();
  return <Articulo articulo={articulo} />;
}

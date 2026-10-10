import { notFound } from "next/navigation";
import Articulo from "../../../../components/articulos/Articulo";
import ExperienciaBigData from "../../../../components/articulos/ExperienciaBigData";
import { getArticulo, getArticulos } from "../../../../lib/articulos";

export function generateStaticParams() {
  return getArticulos("grow").map((articulo) => ({ slug: articulo.slug }));
}

export function generateMetadata({ params }) {
  const articulo = getArticulo("grow", params.slug);
  if (!articulo) return { title: "Artículos" };
  return { title: articulo.titulo, description: articulo.bajada };
}

export default function ArticuloGrowPage({ params }) {
  const articulo = getArticulo("grow", params.slug);
  if (!articulo) notFound();
  // Artículos interactivos con página propia
  if (articulo.experiencia === "big-data") return <ExperienciaBigData articulo={articulo} />;
  return <Articulo articulo={articulo} />;
}

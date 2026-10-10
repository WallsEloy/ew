import ListaArticulos from "../../../components/articulos/ListaArticulos";

export const metadata = {
  title: "Artículos · Grow",
  description: "Artículos de Grow sobre marketing, datos y crecimiento.",
};

export default function ArticulosGrowPage() {
  return <ListaArticulos seccion="grow" />;
}

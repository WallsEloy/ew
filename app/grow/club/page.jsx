import ClubLanding from "../../../components/club/ClubLanding";
import { fuenteGogo } from "../../../components/gogo/fuente";
import { CLUB } from "../../../data/club";

const descripcion = "Club privado de inversionistas: conoce empresas emergentes, explora su evolución y descubre la administración de participaciones privadas. Demostración con datos ficticios; no es una oferta pública de valores.";

export const metadata = {
  title: `${CLUB.nombre} · Club privado de inversionistas`,
  description: descripcion,
  openGraph: { title: `${CLUB.nombre} · ${CLUB.titulo}`, description: descripcion, type: "website", locale: "es_MX" },
  twitter: { card: "summary_large_image", title: CLUB.nombre, description: descripcion },
};

export default function ClubPage() {
  return <ClubLanding fuente={fuenteGogo.variable} />;
}

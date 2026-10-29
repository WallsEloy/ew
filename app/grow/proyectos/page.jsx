import { getGrowConfig } from "../../../lib/growConfig";
import Link from "next/link";
import ProyectosFiltrables from "./ProyectosFiltrables";
import styles from "../opcion-a/page.module.css";

export const metadata = {
  title: "Proyectos · Grow",
  description: "Proyectos de Grow: campañas y marcas que crecen con una idea.",
};
// Igual que Marketing: en caché, regenerada al guardar desde el dashboard
export const revalidate = 300;

export default async function GrowProyectos() {
  const { config } = await getGrowConfig();
  return (
    <ProyectosFiltrables
      proyectos={config.projects.filter((project) => project.seccion === "proyectos")}
      encabezado={
        // Acceso a la landing del club privado de inversionistas
        <Link href="/grow/club" className={styles.club}>
          <span>Club privado de inversionistas</span>
          <strong>Invierte en ideas que construyen el futuro</strong>
          <em>Explorar el club →</em>
        </Link>
      }
    />
  );
}

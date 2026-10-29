import { getGrowConfig } from "../../../lib/growConfig";
import TarjetasGrow from "../TarjetasGrow";

export const metadata = {
  title: "Grow",
  description: "Selección de proyectos creativos, visuales y digitales de EW.",
};
// Página en caché: el dashboard la regenera al guardar (revalidatePath) y,
// como red de seguridad, se vuelve a generar como máximo cada 5 minutos.
export const revalidate = 300;

export default async function GrowOptionA() {
  const { config } = await getGrowConfig();
  // Marketing: todo lo que no está asignado a la sección Proyectos
  return <TarjetasGrow proyectos={config.projects.filter((project) => project.seccion !== "proyectos")} />;
}

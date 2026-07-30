import Image from "next/image";
import Link from "next/link";
import GrowProjectCarousel from "../../../components/GrowProjectCarousel";
import { getGrowConfig } from "../../../lib/growConfig";
import styles from "./page.module.css";

export const metadata = {
  title: "Grow — Proyectos EW",
  description: "Selección de proyectos creativos, visuales y digitales de EW.",
};
export const dynamic = "force-dynamic";

export default async function GrowOptionA() {
  const { config } = await getGrowConfig();

  return (
    <main className={styles.page}>
      <GrowProjectCarousel
        images={config.projects.map((project) => project.image)}
        title={config.title}
        eyebrow={config.eyebrow}
      />
      <div className={styles.content}>
        <section className={styles.projects} aria-label="Proyectos destacados">
          {config.projects.map((project, index) => (
            <article className={styles.card} key={`${project.slug}-${index}`}>
              <Image src={project.image} alt="" fill sizes="(max-width: 768px) 92vw, 760px" className={styles.image} />
              <div className={styles.scrim} aria-hidden="true" />
              <div className={styles.copy}>
                <span>{project.eyebrow}</span>
                <h2>{project.title}</h2>
                <Link href={`/grow/proyectos/${project.slug}`}>{project.action}</Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

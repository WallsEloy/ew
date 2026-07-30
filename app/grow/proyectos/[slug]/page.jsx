import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGrowConfig } from "../../../../lib/growConfig";
import ClientAdvertisingFlow from "../../../../components/ClientAdvertisingFlow";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function GrowProjectPage({ params }) {
  const { slug } = params;
  const { config } = await getGrowConfig();
  const normalizedSlug = slug === "identidad-visuall" ? "identidad-visual" : slug;
  const project = config.projects.find((item) => item.slug === normalizedSlug);
  if (!project) notFound();

  return (
    <main className={styles.page}>
      {project.slug !== "identidad-visual" && (
        <section className={styles.hero}>
          <Image src={project.image} alt={project.title} fill priority sizes="100vw" className={styles.image} />
          <div className={styles.scrim} />
          <div className={styles.copy}>
            <span>{project.eyebrow}</span>
            <h1>{project.title}</h1>
            <p>{project.summary}</p>
          </div>
        </section>
      )}
      {project.slug === "identidad-visual" && <ClientAdvertisingFlow />}
      <section className={styles.body}>
        <p>{project.body}</p>
        <Link href="/grow/opcion-a">← Volver a Grow</Link>
      </section>
    </main>
  );
}

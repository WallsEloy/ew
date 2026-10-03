import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileProject } from "../../../../../lib/portfolioServer";
import styles from "../../../../diseno/proyectos/[profileId]/[projectId]/page.module.css";

export const dynamic = "force-dynamic";

export default async function CodingProjectPage({ params }) {
  const route = await params;
  const data = await getProfileProject("coding", route.profileId, route.projectId);
  if (!data) notFound();

  const title = data.title || (data.caption || "Proyecto Coding").split("#")[0].trim();
  const technicalData = [
    ["Categoría", data.web?.type || "Desarrollo"],
    ["Colección", data.meta?.coleccion],
    ["Año", data.meta?.anio],
    ["Tecnología", data.meta?.tecnica],
    ["Formato", data.meta?.formato],
    ["Estudio", data.web?.author || "EW Studio"],
  ].filter(([, value]) => value);

  return (
    <main className={styles.projectPage}>
      <Link href="/coding" className={styles.backLink} aria-label="Volver a Coding">
        <span>←</span> Volver a Coding
      </Link>

      <section className={styles.projectLayout}>
        <div className={styles.mosaic}>
          {data.image && (
            <figure className={`${styles.card} ${styles.card1}`}>
              <img src={data.image} alt={title} />
            </figure>
          )}
        </div>

        <aside className={styles.details}>
          <div className={styles.brandLine}>
            <span className={styles.brandDot} />
            <span>{data.profileName}</span>
          </div>
          <h1>{title}</h1>
          <p className={styles.category}>{data.web?.type || "Desarrollo digital"}</p>
          <div className={styles.descriptionBlock}>
            <span>Sobre el proyecto</span>
            <p>{data.caption || data.profileBio}</p>
          </div>
          <dl className={styles.metaGrid}>
            {technicalData.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </aside>
      </section>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileProject } from "../../../../../lib/portfolioServer";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const BRANDING_DEMO = [
  { id: "brand-workspace", image: "/branding-demo/brand-workspace.jpg", caption: "Desarrollo de paleta y sistema visual" },
  { id: "brand-editorial", image: "/branding-demo/brand-editorial.jpg", caption: "Proceso de construcción de marca" },
  { id: "brand-color", image: "/branding-demo/brand-color.jpg", caption: "Universo cromático de la identidad" },
  { id: "brand-digital", image: "/branding-demo/brand-digital.jpg", caption: "Aplicación de identidad en medios digitales" },
  { id: "brand-application", image: "/branding-demo/brand-application.jpg", caption: "Texturas y recursos gráficos" },
  { id: "brand-layout", image: "/branding-demo/brand-layout.jpg", caption: "Símbolo y presencia de marca" },
];

export default async function DesignProjectPage({ params }) {
  const route = await params;
  const data = await getProfileProject("diseno", route.profileId, route.projectId);
  if (!data) notFound();

  const isWebProject = String(route.profileId) === "2" || /web/i.test(`${data.profileName} ${data.profileBio}`);
  const title = data.title || (data.caption || "Proyecto de diseño").split("#")[0].trim();
  const description =
    data.caption ||
    data.profileBio ||
    "Identidad visual desarrollada desde el concepto hasta sus aplicaciones finales.";
  const gallery = (isWebProject
    ? [{ id: "cover", image: data.image, caption: data.caption }]
    : [{ id: "cover", image: data.image, caption: data.caption }, ...BRANDING_DEMO]
  ).filter((item) => item.image);
  const technicalData = [
    ["Disciplina", data.web?.type || data.meta?.tecnica || (isWebProject ? "Diseño web" : "Branding")],
    ["Colección", data.meta?.coleccion],
    ["Año", data.meta?.anio],
    ["Ubicación", data.meta?.ubicacion],
    ["Formato", data.meta?.formato],
    ["Estudio", data.web?.author || "EW Studio"],
  ].filter(([, value]) => value);

  return (
    <main className={styles.projectPage}>
      <Link href={isWebProject ? "/diseno?vista=web" : "/diseno"} className={styles.backLink} aria-label="Volver a Diseño">
        <span>←</span> Volver a {isWebProject ? "Web" : "Diseño"}
      </Link>

      <section className={styles.projectLayout}>
        <div className={styles.mosaic}>
          {gallery.map((item, index) => (
            <figure
              className={`${styles.card} ${styles[`card${index + 1}`]}`}
              key={`${item.id}-${index}`}
            >
              <img
                src={item.image}
                alt={item.caption || `${title}, aplicación ${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </figure>
          ))}
        </div>

        <aside className={styles.details}>
          <div className={styles.brandLine}>
            <span className={styles.brandDot} />
            <span>{data.profileName}</span>
          </div>

          <h1>{title}</h1>
          <p className={styles.category}>{data.web?.type || (isWebProject ? "Diseño y desarrollo web" : "Dirección de arte · Identidad visual")}</p>

          <div className={styles.descriptionBlock}>
            <span>Sobre el proyecto</span>
            <p>{description}</p>
          </div>

          <dl className={styles.metaGrid}>
            {technicalData.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.colorRow} aria-label="Paleta de color del proyecto">
            <span className={styles.swatchGold} />
            <span className={styles.swatchBlue} />
            <span className={styles.swatchPaper} />
            <span className={styles.swatchInk} />
          </div>
        </aside>
      </section>
    </main>
  );
}

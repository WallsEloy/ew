import Image from "next/image";
import Link from "next/link";
import styles from "./opcion-a/page.module.css";

// Lista de tarjetas de Grow. La usan Marketing (/grow/opcion-a) y Proyectos
// (/grow/proyectos); cada página le pasa sólo sus proyectos y, si quiere,
// un encabezado propio encima de las tarjetas.
export default function TarjetasGrow({ proyectos, encabezado = null }) {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        {encabezado}
        <section className={styles.projects} aria-label="Proyectos destacados">
          {proyectos.map((project, index) => (
            project.estilo === "post" ? (
              // Tarjeta como la de marketing: barra de post (avatar y nombre)
              // arriba y la imagen de la campaña debajo, sin degradado
              <article className={`${styles.card} ${styles.cardPost}`} key={`${project.slug}-${index}`}>
                <div className={styles.postBarra} aria-hidden="true">
                  <span className={styles.postAvatar} style={{ backgroundColor: project.avatarColor || "#ff2d6f" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {project.avatar && <img src={project.avatar} alt="" />}
                  </span>
                  <span className={styles.postLineas}><i /><i /></span>
                  {/* Categoría del proyecto, a la derecha de la barra */}
                  {project.eyebrow && <span className={styles.postCategoria}>{project.eyebrow}</span>}
                </div>
                <div className={styles.postImagen}>
                  <Image src={project.image} alt="" fill sizes="(max-width: 768px) 92vw, 760px" className={styles.image} />
                  {/* La categoría va en la etiqueta de la barra, no se repite aquí */}
                  <div className={`${styles.copy} ${styles.copySinVelo}`}>
                    <h2>{project.title}</h2>
                    <Link href={`/grow/proyectos/${project.slug}`}>{project.action}</Link>
                  </div>
                </div>
              </article>
            ) : (
            <article className={styles.card} key={`${project.slug}-${index}`}>
              <Image src={project.image} alt="" fill sizes="(max-width: 768px) 92vw, 760px" className={styles.image} />
              {/* La primera portada (Marketing) va sin degradado */}
              {index !== 0 && <div className={styles.scrim} aria-hidden="true" />}
              <div className={`${styles.copy} ${index === 0 ? styles.copySinVelo : ""}`}>
                <span>{project.eyebrow}</span>
                <h2>{project.title}</h2>
                <Link href={`/grow/proyectos/${project.slug}`}>{project.action}</Link>
              </div>
            </article>
            )
          ))}
        </section>
      </div>
    </main>
  );
}

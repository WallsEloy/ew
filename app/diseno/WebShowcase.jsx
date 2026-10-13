import Image from "next/image";
import PortadaCarrusel from "./PortadaCarrusel";
import GrupoDesplegable from "./GrupoDesplegable";
import { MARCAS_WEB } from "../../lib/proyectosWeb";
import Link from "next/link";
import styles from "./WebShowcase.module.css";

// Cuadros de referencia que ocupan el grid mientras no hay proyectos.
const PLACEHOLDER_COUNT = 4;

// Portadas en carrusel del área Coding, por "perfil/proyecto"
const CARRUSELES_CODING = {
  "1/0": [
    "/Coding/DentalMaya/portada-16x10.webp",
    "/Coding/DentalMaya/carolina.webp",
    "/Coding/DentalMaya/paciente-maria.webp",
    "/Coding/DentalMaya/odontograma-maria.webp",
  ],
};

// Proyectos que se despliegan bajo una tarjeta de Web, por "perfil/proyecto".
// Sin material todavía: se muestran como tarjetas de referencia.
const GRUPOS_WEB = {
  "2/0": { tipo: "Event site", proyectos: [{ title: "Sprint Dat" }, { title: "Sun-set" }] },
};

export default function WebShowcase({ profile, variant = "web", basePath = "/diseno" }) {
  const projects = profile.posts || [];
  const isCoding = variant === "coding";
  return (
    <section className={styles.section} aria-labelledby="web-showcase-title">
      <div className={styles.heading}>
        <div><span>{isCoding ? "Desarrollo digital" : "Selección digital"}</span><h2 id="web-showcase-title">Muestrario {isCoding ? "coding" : "web"}</h2></div>
        <p>{isCoding ? "Aplicaciones, plataformas y experimentos desarrollados con código, rendimiento y una experiencia clara." : "Interfaces, productos y experiencias digitales construidas para funcionar con claridad y carácter."}</p>
      </div>
      <div className={styles.grid}>
        {!projects.length && (
          <>
            <p className={styles.empty}>Agrega proyectos desde Dashboard → {isCoding ? "Coding" : "Diseño → Web"}.</p>
            {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
              <article className={styles.card} key={`referencia-${index}`} aria-hidden="true">
                <div className={`${styles.preview} ${styles.placeholder}`}>
                  <span className={styles.kind}>Referencia</span>
                  <div className={styles.previewTitle}><small>Proyecto {isCoding ? "coding" : "web"}</small><strong>{String(index + 1).padStart(2, "0")}</strong></div>
                </div>
                <div className={styles.meta}>
                  <span className={styles.avatar}>EW</span>
                  <span className={styles.placeholderLine} />
                </div>
              </article>
            ))}
          </>
        )}
        {projects.map((project) => (
          <article className={styles.card} key={project.title}>
            <Link className={styles.projectLink} href={`${basePath}/proyectos/${profile.id}/${project.id}`}>
            {/* La portada mide 16:10, igual que las capturas (1800×1125): no se recortan */}
            <div className={styles.preview}>
              {isCoding && CARRUSELES_CODING[`${profile.id}/${project.id}`] ? (
                <PortadaCarrusel imagenes={CARRUSELES_CODING[`${profile.id}/${project.id}`]} alt={project.title} />
              ) : project.image ? (
                <Image src={project.image} alt={project.title} fill sizes="(max-width: 640px) 92vw, 50vw" className={styles.image} />
              ) : (
                <span className={styles.noImage}>Sin portada</span>
              )}
              {/* En Web la portada va limpia, sin textos encima: el nombre lo
                  da el logotipo del pie */}
              {isCoding && (
                <>
                  <div className={styles.shade} />
                  <span className={styles.kind}>{project.web?.type || "UI / UX"}</span>
                  {project.web?.video && <span className={styles.video} aria-label="Proyecto con vídeo">●</span>}
                  <div className={styles.previewTitle}><small>Proyecto coding</small><strong>{project.title || project.caption}</strong></div>
                </>
              )}
            </div>
            {!isCoding && MARCAS_WEB[`${profile.id}/${project.id}`] ? (
              // Web: logotipo del proyecto (el del hero) a la izquierda y su
              // categoría a la derecha
              <div className={styles.metaMarca}>
                <span className={styles.marcaLogo} style={MARCAS_WEB[`${profile.id}/${project.id}`].altoTarjeta ? { height: MARCAS_WEB[`${profile.id}/${project.id}`].altoTarjeta } : undefined}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={MARCAS_WEB[`${profile.id}/${project.id}`].logo} alt={`Logotipo de ${project.title}`} decoding="async" />
                </span>
                <span className={styles.marcaCategoria}>{MARCAS_WEB[`${profile.id}/${project.id}`].categoria}</span>
              </div>
            ) : (
            <div className={styles.meta}>
              <span
                className={styles.avatar}
                style={profile.avatar ? { backgroundImage: `url(${JSON.stringify(profile.avatar).slice(1, -1)})` } : undefined}
                aria-hidden="true"
              >
                {!profile.avatar && "EW"}
              </span>
              <strong>{project.web?.author || "EW Studio"}</strong>
              {project.web?.badge && <span className={styles.pro}>{project.web.badge}</span>}
              <span className={styles.metrics}><b>♥</b> {project.likes}　<b>◆</b> {project.web?.views || "0"}</span>
            </div>
            )}
            </Link>
            {!isCoding && GRUPOS_WEB[`${profile.id}/${project.id}`] && (
              <GrupoDesplegable {...GRUPOS_WEB[`${profile.id}/${project.id}`]} />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

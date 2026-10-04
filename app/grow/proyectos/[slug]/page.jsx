import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGrowConfig } from "../../../../lib/growConfig";
import ClientAdvertisingFlow from "../../../../components/ClientAdvertisingFlow";
import styles from "./page.module.css";

// Página en caché: el dashboard la regenera al guardar (revalidatePath) y,
// como red de seguridad, se vuelve a generar como máximo cada 5 minutos.
export const revalidate = 300;

// Convierte un enlace de Figma (archivo, prototipo o embed) en la URL del
// visor embebido. Devuelve null si el enlace no es de figma.com.
// `mobile` ajusta el prototipo al alto del visor para pantallas de celular y
// oculta la interfaz de Figma.
function getFigmaEmbedUrl(rawUrl, { mobile = false } = {}) {
  try {
    const url = new URL(String(rawUrl || "").trim());
    if (!/(^|\.)figma\.com$/.test(url.hostname)) return null;
    if (mobile) {
      if (!url.searchParams.has("scaling")) url.searchParams.set("scaling", "scale-down");
      // Solo el mockup: sin la interfaz de Figma (barra y controles)
      if (!url.searchParams.has("hide-ui")) url.searchParams.set("hide-ui", "1");
    }
    if (url.hostname.startsWith("embed.") || url.pathname.startsWith("/embed")) return url.toString();
    return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url.toString())}`;
  } catch {
    return null;
  }
}

export default async function GrowProjectPage({ params }) {
  const { slug } = params;
  const { config } = await getGrowConfig();
  const normalizedSlug = slug === "identidad-visuall" ? "identidad-visual" : slug;
  const project = config.projects.find((item) => item.slug === normalizedSlug);
  if (!project) notFound();
  const figmaEmbeds = [
    { label: "Figma", src: getFigmaEmbedUrl(project.figmaUrl) },
    { label: "Prototipo", src: getFigmaEmbedUrl(project.figmaPrototypeUrl, { mobile: true }), mobile: true },
  ].filter((embed) => embed.src);

  return (
    <main className={styles.page}>
      {project.clientLogo && <img src={project.clientLogo} alt={`Logo de ${project.title}`} className={styles.clientLogo} />}
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
      {project.slug === "identidad-visual" && (
        <>
          <ClientAdvertisingFlow config={config.flow} />
          {/* Texto provisional tras el flujo */}
          <section className={styles.interlude}>
            <span>Del flujo al diseño</span>
            <h2>Cada punto de contacto, diseñado con intención.</h2>
            <p>El flujo define cómo llega cada persona a la marca. A partir de ahí, el sistema visual da forma a cada pantalla, pieza y mensaje para que la experiencia se sienta coherente de principio a fin.</p>
          </section>
        </>
      )}
      {figmaEmbeds.map((embed) => (
        <Fragment key={embed.label}>
        {embed.mobile && (
          // Texto provisional entre el diseño de Figma y el prototipo
          <section className={styles.interlude}>
            <span>Del diseño a la interacción</span>
            <h2>Un prototipo para recorrer la experiencia.</h2>
            <p>Las pantallas cobran vida: el prototipo permite probar la navegación, los estados y las transiciones tal como los vivirá el usuario en su celular.</p>
          </section>
        )}
        <section className={`${styles.figma} ${embed.mobile ? styles.figmaMobile : ""}`} aria-label={`${embed.label} en Figma de ${project.title}`}>
          <span>{embed.label}</span>
          {embed.mobile ? (
            <div className={styles.figmaRow}>
              <iframe src={embed.src} title={`${embed.label} · ${project.title}`} loading="lazy" allowFullScreen />
              {/* Texto provisional junto al prototipo */}
              <div className={styles.figmaCopy}>
                <h2>Una experiencia pensada para el celular</h2>
                <p>Este prototipo muestra el recorrido principal de la aplicación: cómo el usuario descubre la marca, navega por el contenido y llega a la acción final en pocos pasos.</p>
                <ul>
                  <li>Navegación clara y directa</li>
                  <li>Componentes coherentes con la identidad</li>
                  <li>Interacciones listas para probar</li>
                </ul>
              </div>
            </div>
          ) : (
            <iframe src={embed.src} title={`${embed.label} · ${project.title}`} loading="lazy" allowFullScreen />
          )}
        </section>
        </Fragment>
      ))}
      {project.slug === "identidad-visual" && (
        // Texto provisional de cierre: manejo de datos para remarketing
        <section className={styles.interlude}>
          <span>Datos y remarketing</span>
          <h2>Una base de datos que trabaja para la campaña.</h2>
          <p>El remarketing funciona cuando los datos están ordenados. Cada escaneo de QR, visita a la landing y evento del píxel se guarda en una base de datos propia, para volver a hablarle a cada persona con el mensaje adecuado y en el momento justo.</p>
          <ul className={styles.dataPoints}>
            <li><strong>Captura</strong>Píxel, códigos QR y formularios registran cada interacción con su origen y campaña.</li>
            <li><strong>Segmentación</strong>Las audiencias se agrupan por comportamiento: quién visitó, quién se interesó y quién compró.</li>
            <li><strong>Consentimiento</strong>Solo se usan datos autorizados, con opción de baja y cumplimiento de privacidad.</li>
            <li><strong>Sincronización</strong>Las audiencias se envían a Meta, Google y el CRM para mantener las campañas actualizadas.</li>
            <li><strong>Medición</strong>Cada conversión vuelve a la base de datos para saber qué anuncio funcionó y optimizar la inversión.</li>
          </ul>
        </section>
      )}
      <section className={styles.body}>
        <p>{project.body}</p>
        <Link href="/grow/opcion-a">← Volver a Grow</Link>
      </section>
    </main>
  );
}

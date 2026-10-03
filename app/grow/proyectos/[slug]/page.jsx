import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGrowConfig } from "../../../../lib/growConfig";
import ClientAdvertisingFlow from "../../../../components/ClientAdvertisingFlow";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

// Convierte un enlace de Figma (archivo, prototipo o embed) en la URL del
// visor embebido. Devuelve null si el enlace no es de figma.com.
// `mobile` ajusta el prototipo al alto del visor para pantallas de celular.
function getFigmaEmbedUrl(rawUrl, { mobile = false } = {}) {
  try {
    const url = new URL(String(rawUrl || "").trim());
    if (!/(^|\.)figma\.com$/.test(url.hostname)) return null;
    if (mobile && !url.searchParams.has("scaling")) url.searchParams.set("scaling", "scale-down");
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
      {project.slug === "identidad-visual" && <ClientAdvertisingFlow config={config.flow} />}
      {figmaEmbeds.map((embed) => (
        <section className={`${styles.figma} ${embed.mobile ? styles.figmaMobile : ""}`} key={embed.label} aria-label={`${embed.label} en Figma de ${project.title}`}>
          <span>{embed.label}</span>
          <iframe src={embed.src} title={`${embed.label} · ${project.title}`} loading="lazy" allowFullScreen />
        </section>
      ))}
      <section className={styles.body}>
        <p>{project.body}</p>
        <Link href="/grow/opcion-a">← Volver a Grow</Link>
      </section>
    </main>
  );
}

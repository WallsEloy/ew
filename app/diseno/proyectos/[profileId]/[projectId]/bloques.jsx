import Image from "next/image";
import VideoTile from "./VideoTile";
import styles from "./page.module.css";

/*
 * Bloques compartidos por las páginas de proyecto (Diseño y Coding): texto
 * editorial y filas de imágenes/videos (con capturas dentro de un iPhone).
 * Método: doc/documentos/proyectos web/acomodo_paginas_web.md
 */
export function renderRich(text) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, index) => (index % 2 ? <strong key={index}>{part}</strong> : part));
}

// Bloque de texto editorial: antetítulo y título a la izquierda, cuerpo a la derecha
export function StoryBlock({ block }) {
  return (
    <section className={styles.story}>
      <header>
        <span>{block.eyebrow}</span>
        <h2>{block.title}</h2>
      </header>
      <div className={styles.storyBody}>
        {block.body.map((paragraph, index) => <p key={index}>{renderRich(paragraph)}</p>)}
        {block.credit && (
          <p className={styles.storyCredit}>
            {block.credit.label}: <a href={block.credit.href} target="_blank" rel="noreferrer">{block.credit.name}</a>
          </p>
        )}
      </div>
    </section>
  );
}

// Fila de imágenes: columnas proporcionales a cada imagen, o rejilla de
// cuadrados (compact). Todas protegidas contra descarga.
export function FeatureRow({ items: row, compact, columns = 3 }) {
  const totalRatio = row.reduce((sum, item) => sum + item.width / item.height, 0);
  return (
    <div
      className={`${styles.featureRow} ${compact ? styles.featureRowCompact : ""} ${row.some((item) => item.device === "iphone") ? styles.featureRowPhones : ""} ${row.length === 1 && row[0].device === "iphone" ? styles.featureRowPhoneSolo : ""}`}
      style={compact ? { "--compact-columns": columns } : { "--feature-columns": row.map((item) => `minmax(0, ${(item.width / item.height).toFixed(4)}fr)`).join(" ") }}
    >
      {row.map((feature) => feature.video && feature.device === "iphone" ? (
        // Grabación de pantalla dentro de un iPhone
        <figure className={`${styles.feature} ${styles.phone}`} key={feature.video}>
          <div className={`${styles.phoneScreen} ${styles.phoneScreenVideo}`} style={{ aspectRatio: "9 / 19.5" }}>
            <VideoTile src={feature.video} poster={feature.poster} label={feature.alt} width={feature.width} height={feature.height} />
            <span className={styles.phoneIsland} aria-hidden="true" />
          </div>
        </figure>
      ) : feature.video ? (
        <figure className={`${styles.feature} ${styles.featureVideo}`} key={feature.video}>
          <VideoTile src={feature.video} poster={feature.poster} label={feature.alt} width={feature.width} height={feature.height} />
        </figure>
      ) : feature.device === "iphone" ? (
        // Captura de celular enmascarada dentro de un iPhone (marco, bordes
        // redondeados e isla dinámica hechos con CSS)
        <figure className={`${styles.feature} ${styles.phone}`} key={feature.image}>
          {/* Pantalla en formato 19.5:9 (el de los iPhone actuales); la captura
              se recorta desde arriba */}
          <div className={styles.phoneScreen} style={{ aspectRatio: "9 / 19.5" }}>
            <Image
              src={feature.image}
              alt={feature.alt}
              width={feature.width}
              height={feature.height}
              sizes={`(max-width: 767px) 46vw, ${Math.round(1200 / columns)}px`}
              quality={80}
              draggable={false}
            />
            <span className={styles.phoneIsland} aria-hidden="true" />
            <span className={styles.mediaShield} aria-hidden="true" />
          </div>
        </figure>
      ) : (
        <figure className={styles.feature} key={feature.image}>
          <Image
            src={feature.image}
            alt={feature.alt}
            width={feature.width}
            height={feature.height}
            sizes={`(max-width: 767px) ${compact ? "46vw" : "92vw"}, ${compact ? Math.round(1200 / columns) : Math.round((1200 * (feature.width / feature.height)) / totalRatio)}px`}
            quality={80}
            draggable={false}
          />
          <span className={styles.mediaShield} aria-hidden="true" />
        </figure>
      ))}
    </div>
  );
}

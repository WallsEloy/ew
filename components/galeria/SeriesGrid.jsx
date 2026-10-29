import Link from "next/link";
import styles from "./PostGrid.module.css";

// Una tarjeta por serie con su primera imagen, una encima de otra y a todo
// el ancho de la ventana, en horizontal; al tocarla se abre la
// subpágina de la serie (/galeria/<galeria>/<serie>) con todas sus imágenes.
export default function SeriesGrid({ series, base }) {
  return (
    <div className={styles.seriesLista}>
      {series.map((serie, index) => {
        const portada = serie.posts[0];
        return (
          <Link
            key={serie.slug}
            href={`${base}/${serie.slug}`}
            className={`${styles.postItem} ${styles.serieTarjeta}`}
            aria-label={`Ver ${serie.nombre || "la serie"} (${serie.posts.length} imágenes)`}
          >
            <img
              src={portada.image}
              alt={portada.title || ""}
              className={styles.postImage}
              loading={index < 6 ? "eager" : "lazy"}
              decoding="async"
            />
            {/* Marca de «varias imágenes», como en Instagram */}
            {serie.posts.length > 1 && (
              <span className={styles.marcaSerie} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="8" y="8" width="13" height="13" rx="2" />
                  <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
                </svg>
                {serie.posts.length}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

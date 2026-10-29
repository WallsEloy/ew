"use client";
import { useState } from "react";
import Link from "next/link";
import PostGrid from "../../components/galeria/PostGrid";
import FeedModal from "../../components/galeria/FeedModal";
import styles from "./page.module.css";

// Subpágina de una serie: enlace de regreso a la galería, la cuadrícula con
// todas las imágenes de la serie y el visor, igual que en Concept Art.
export default function SerieGaleria({ galeria, serie }) {
  const [abierta, setAbierta] = useState(null); // índice de la imagen abierta

  return (
    <div className={styles.serie}>
      <Link href={galeria.href} className={styles.serieVolver}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {galeria.nombre}
      </Link>

      <PostGrid posts={serie.posts} onClick={setAbierta} />

      {abierta !== null && (
        <FeedModal
          posts={serie.posts}
          startIndex={abierta}
          galleryName={galeria.nombre}
          allowImageScroll
          detallesAbajo
          onClose={() => setAbierta(null)}
        />
      )}
    </div>
  );
}

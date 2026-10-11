"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./WebShowcase.module.css";

// Cada cuánto cambia la imagen de la portada (ms)
const INTERVALO = 3200;

/*
 * Portada de tarjeta en carrusel (solo área Coding): las imágenes se funden
 * una tras otra en bucle. Con "reducir movimiento" se queda en la primera.
 */
export default function PortadaCarrusel({ imagenes, alt }) {
  const [activa, setActiva] = useState(0);

  useEffect(() => {
    if (imagenes.length < 2) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const id = setInterval(() => setActiva((i) => (i + 1) % imagenes.length), INTERVALO);
    return () => clearInterval(id);
  }, [imagenes.length]);

  return (
    <>
      {imagenes.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === 0 ? alt : ""}
          fill
          sizes="(max-width: 640px) 92vw, 50vw"
          className={`${styles.image} ${styles.carruselImg} ${i === activa ? styles.carruselActiva : ""}`}
        />
      ))}
      <span className={styles.carruselPuntos} aria-hidden="true">
        {imagenes.map((src, i) => (
          <span key={src} className={i === activa ? styles.carruselPuntoActivo : ""} />
        ))}
      </span>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import styles from "./ProfileCarousel.module.css";

const INTERVALO = 6000;

/*
 * Carrusel de portadas de la cabecera de una galería. Se ve en escritorio y, con
 * `enMovil`, también en móvil (encuadrado en la parte alta de la portada).
 *
 * Las imágenes no van en <img> sino como background-image declarada dentro de la
 * media query de escritorio y alimentada por la variable --portada: un <img> con
 * display:none se descarga igual, y estas portadas pesan cientos de KB que el
 * móvil no necesita. Al ser fondos no tienen alt, de ahí el role + aria-label.
 */
export default function ProfileCarousel({ portadas = [], name = "", enMovil = false, encuadreMovil }) {
  const laminas = (portadas || []).filter(Boolean);
  // El carrusel sólo existe a partir de DOS portadas: con una, la cabecera es
  // una portada fija (sin temporizador, sin puntos y sin transición).
  const esCarrusel = laminas.length > 1;
  const [activa, setActiva] = useState(0);

  // Avance automático. Con una sola portada no hay temporizador que mantener.
  useEffect(() => {
    if (!esCarrusel) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiva((actual) => (actual + 1) % laminas.length);
    }, INTERVALO);
    return () => window.clearInterval(timer);
  }, [esCarrusel, laminas.length]);

  // Si se quitan portadas desde el dashboard, el índice puede quedar fuera
  useEffect(() => {
    setActiva((actual) => (actual < laminas.length ? actual : 0));
  }, [laminas.length]);

  if (!laminas.length) return null;

  return (
    <div
      className={`${styles.carrusel} ${esCarrusel ? styles.animado : ""} ${enMovil ? styles.enMovil : ""}`}
      // Encuadre propio de la portada en móvil (posición y tamaño del fondo)
      style={encuadreMovil ? { "--encuadre-movil": encuadreMovil.posicion, "--tam-movil": encuadreMovil.tamano, "--proporcion-movil": encuadreMovil.proporcion } : undefined}
      role="img"
      aria-label={
        name
          ? `${esCarrusel ? "Portadas" : "Portada"} de ${name}`
          : `${esCarrusel ? "Portadas" : "Portada"} de la galería`
      }
    >
      {laminas.map((src, i) => (
        <div
          key={src}
          className={`${styles.lamina} ${i === activa ? styles.laminaActiva : ""}`}
          style={{ "--portada": `url("${src}")` }}
        />
      ))}

      {esCarrusel && (
        <div className={styles.puntos}>
          {laminas.map((src, i) => (
            <button
              key={src}
              type="button"
              className={`${styles.punto} ${i === activa ? styles.puntoActivo : ""}`}
              aria-label={`Ver portada ${i + 1} de ${laminas.length}`}
              aria-current={i === activa}
              onClick={() => setActiva(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

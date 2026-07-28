"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { moduloProceso } from "../data/moduloProceso";
import styles from "./ProcesoScroll.module.css";

/*
 * Módulo de proceso: el vídeo NO se reproduce solo, se recorre con el scroll, y
 * los textos van pasando como un carrusel según avanza.
 *
 * Cómo funciona, que no se ve en el marcado:
 * - La sección mide varias pantallas de alto y dentro lleva un escenario pegado
 *   (sticky) de una pantalla: eso es lo que da la sensación de que el vídeo se
 *   queda quieto mientras el scroll lo atraviesa.
 * - El avance del scroll se traduce a segundo del vídeo. No se asigna
 *   currentTime en cada evento de scroll —eso provoca una tormenta de búsquedas
 *   y se ve a saltos—: se guarda el segundo deseado y un bucle de animación
 *   acerca el vídeo poco a poco, que es lo que lo hace fluido.
 * - El vídeo está siempre en pausa y en silencio: aquí manda el scroll, no el
 *   reloj del vídeo.
 * - Con "reducir movimiento" no hay recorrido: el vídeo se queda en su póster y
 *   los tres textos se muestran a la vez, en lista.
 */
export default function ProcesoScroll() {
  const { video, poster, capitulos, boton } = moduloProceso;
  const seccionRef = useRef(null);
  const videoRef = useRef(null);
  const destinoRef = useRef(0); // segundo al que queremos llegar
  const duracionRef = useRef(0);
  const [activo, setActivo] = useState(0);
  const sinMovimiento = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: seccionRef,
    offset: ["start start", "end end"],
  });

  // Avance del scroll → segundo del vídeo + capítulo visible
  useMotionValueEvent(scrollYProgress, "change", (avance) => {
    const acotado = Math.min(1, Math.max(0, avance));
    destinoRef.current = acotado * duracionRef.current;

    const indice = Math.min(
      capitulos.length - 1,
      Math.floor(acotado * capitulos.length),
    );
    setActivo((actual) => (actual === indice ? actual : indice));
  });

  // Bucle que acerca el vídeo a su destino, en vez de saltar a él
  useEffect(() => {
    const v = videoRef.current;
    if (!v || sinMovimiento) return undefined;

    const alCargar = () => {
      duracionRef.current = v.duration || 0;
    };
    v.addEventListener("loadedmetadata", alCargar);
    if (v.readyState >= 1) alCargar();

    let animacion;
    const acercar = () => {
      const objetivo = destinoRef.current;
      const diferencia = objetivo - v.currentTime;
      // Umbral pequeño: por debajo no merece la pena buscar otro fotograma
      if (Math.abs(diferencia) > 0.02 && v.readyState >= 2) {
        v.currentTime += diferencia * 0.18;
      }
      animacion = window.requestAnimationFrame(acercar);
    };
    acercar();

    return () => {
      window.cancelAnimationFrame(animacion);
      v.removeEventListener("loadedmetadata", alCargar);
    };
  }, [sinMovimiento]);

  return (
    <section
      ref={seccionRef}
      className={styles.seccion}
      style={{ "--capitulos": capitulos.length }}
      aria-labelledby="proceso-titulo"
    >
      <div className={styles.escenario}>
        <video
          ref={videoRef}
          className={styles.video}
          src={video}
          poster={poster}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className={styles.velo} aria-hidden="true" />

        <div className={styles.contenido}>
          {/* Un solo h2 para el lector de pantalla; los capítulos son su relato */}
          <h2 id="proceso-titulo" className={styles.oculto}>
            Cómo se hace una pieza
          </h2>

          <div className={styles.capitulos}>
            {capitulos.map((c, i) => (
              <article
                key={c.titulo}
                className={`${styles.capitulo} ${i === activo ? styles.capituloActivo : ""}`}
                aria-hidden={i !== activo}
              >
                <p className={styles.indice}>
                  {String(i + 1).padStart(2, "0")}
                  <span className={styles.total}>/{String(capitulos.length).padStart(2, "0")}</span>
                </p>
                <h3 className={styles.titulo}>{c.titulo}</h3>
                <p className={styles.texto}>{c.texto}</p>
              </article>
            ))}
          </div>

          <Link href={boton.href} className={styles.boton}>
            {boton.texto}
          </Link>
        </div>

        {/* Progreso del recorrido: marca en qué capítulo va */}
        <div className={styles.progreso} aria-hidden="true">
          {capitulos.map((c, i) => (
            <span
              key={c.titulo}
              className={`${styles.tramo} ${i <= activo ? styles.tramoHecho : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

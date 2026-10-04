"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { moduloProceso } from "../data/moduloProceso";
import { fuenteElegida } from "../data/videosHome";
import { alAcercarse, conexionLimitada } from "../lib/conexion";
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
 *   los textos se muestran a la vez, en lista.
 * - El vídeo se pide cuando el bloque se acerca, no al cargar la página: está a
 *   varias pantallas de distancia y son 2,5 MB. Con línea mala o ahorro de datos
 *   no se pide nunca: quedan el póster y los textos, que siguen pasando.
 */
export default function ProcesoScroll({ config }) {
  // Igual que VideoModulo: manda el dashboard y el archivo de datos es respaldo.
  const { video, poster, logo, capitulos, boton } = config
    ? { ...config, video: fuenteElegida(config) }
    : moduloProceso;
  const seccionRef = useRef(null);
  const videoRef = useRef(null);
  const destinoRef = useRef(0); // segundo al que queremos llegar
  const duracionRef = useRef(0);
  const [activo, setActivo] = useState(0);
  const [fuente, setFuente] = useState(null);
  const sinMovimiento = useReducedMotion();

  // El vídeo se pide al acercarse; con línea limitada se queda el póster
  useEffect(() => {
    if (conexionLimitada()) return undefined;
    return alAcercarse(seccionRef.current, () => setFuente(video), "800px");
  }, [video]);

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
          src={fuente || undefined}
          poster={poster}
          muted
          playsInline
          /* auto sólo tiene sentido una vez que hay fuente: para buscar
             fotograma con el scroll hay que tenerlos descargados */
          preload={fuente ? "auto" : "none"}
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className={styles.velo} aria-hidden="true" />

        <div className={styles.contenido}>
          {/* Un solo h2 para el lector de pantalla; los capítulos son su relato */}
          <h2 id="proceso-titulo" className={styles.oculto}>
            Cómo se hace una pieza
          </h2>

          {/* Logotipo fijo sobre los capítulos: queda quieto mientras los textos
              van pasando, para que el bloque tenga un ancla visual */}
          {logo && <img src={logo} alt="" className={styles.logo} />}

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

        {/* Progreso del recorrido: el círculo azul marca el capítulo visible */}
        <div className={styles.progreso} aria-hidden="true">
          {capitulos.map((c, i) => (
            <span
              key={c.titulo}
              className={`${styles.tramo} ${i === activo ? styles.tramoActivo : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

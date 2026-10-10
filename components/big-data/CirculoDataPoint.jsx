"use client";

import { useEffect, useRef } from "react";
import styles from "./CirculoDataPoint.module.css";

// Longitud total del trazo del círculo (stroke-dasharray)
const TRAZO = 1130;

const TEXTOS = [
  "¿Sabes lo que es un data point?",
  "Es un dato como",
  "Un like",
  "Un mensaje",
  "Una edad",
  "Una compra",
  "Un comentario",
  "Un pedido",
  "Una visita",
  "Un pago",
  "Un pedido",
  "Diferentes datos recolectados",
];

/*
 * Animación entre el hero Saturno y Big Data (LoaderSection + BackgroundParticles
 * de Singularix): un círculo que se dibuja con el scroll mientras el texto del
 * centro cambia, y partículas que suben de fondo mientras está a la vista.
 * Estilos en CSS module: el original estilizaba todos los <circle> del sitio.
 */
export default function CirculoDataPoint() {
  const wrapperRef = useRef(null);
  const loaderRef = useRef(null);
  const circleRef = useRef(null);
  const textRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const loader = loaderRef.current;
    const circle = circleRef.current;
    const text = textRef.current;
    let ticking = false;
    let lastIndex = -1;
    let visible = false;
    let oculto = false;

    // Avance (0 a 1) dentro del wrapper mientras la escena está fija
    const progreso = () => {
      const rect = wrapper.getBoundingClientRect();
      const alto = rect.height - window.innerHeight;
      return rect.top <= 0 ? Math.min(1, Math.max(0, -rect.top / alto)) : 0;
    };

    const update = () => {
      ticking = false;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const p = progreso();

      // El círculo se dibuja entre el 4 % y el 90 % del recorrido
      if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
        visible = true;
        loader.classList.add(styles.visible);
        const dibujo = p > 0.04 ? Math.min(1, (p - 0.04) / 0.86) : 0;
        circle.style.strokeDashoffset = String(TRAZO - dibujo * TRAZO);
      } else if (rect.top > 0) {
        visible = false;
        loader.classList.remove(styles.visible);
        circle.style.strokeDashoffset = String(TRAZO);
      }
      oculto = p >= 1.5;
      loader.classList.toggle(styles.oculto, oculto);

      // Texto: el primero se queda hasta el 18 %; el resto se reparte hasta el 90 %
      let index = 0;
      if (p > 0.9) index = TEXTOS.length - 1;
      else if (p >= 0.18) index = Math.min(TEXTOS.length - 1, 1 + Math.floor(((p - 0.18) / 0.82) * (TEXTOS.length - 1)));
      if (index !== lastIndex) {
        lastIndex = index;
        text.style.opacity = "0";
        setTimeout(() => {
          text.textContent = TEXTOS[index];
          text.style.opacity = "1";
        }, 200);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    // Partículas que suben mientras el círculo está a la vista
    const intervalo = setInterval(() => {
      if (!visible || oculto || !particlesRef.current) return;
      const p = document.createElement("div");
      p.className = styles.particle;
      p.style.left = `${Math.random() * window.innerWidth}px`;
      p.style.animationDuration = `${5 + Math.random() * 5}s`;
      particlesRef.current.appendChild(p);
      setTimeout(() => p.remove(), 10000);
    }, 500);

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(intervalo);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.particles} ref={particlesRef} aria-hidden="true" />
      {/* Escena fija mientras se recorre el wrapper */}
      <div className={styles.sticky}>
        <div className={styles.loader} ref={loaderRef}>
          <svg className={styles.svg} viewBox="0 0 380 380" aria-hidden="true">
            <defs>
              <linearGradient id="gradienteDataPoint" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7f00ff" />
                <stop offset="100%" stopColor="#0018ff" />
              </linearGradient>
            </defs>
            <circle ref={circleRef} className={styles.circle} cx="190" cy="190" r="180" />
          </svg>
          <div className={styles.text} ref={textRef} aria-live="polite">
            {TEXTOS[0]}
          </div>
        </div>
      </div>
    </div>
  );
}

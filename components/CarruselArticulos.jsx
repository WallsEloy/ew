"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ARTICULOS, SECCIONES_ARTICULOS } from "../lib/articulos";
import styles from "./CarruselArticulos.module.css";

/*
 * Carrusel de artículos del home: una tira de tarjetas que se desplaza sola y
 * sin fin, y que también se arrastra con el dedo o con el mouse (al soltar,
 * sigue sola desde ahí). Al pasar el mouse por encima se detiene. Junta los
 * artículos reales de Grow y Diseño con unos de muestra, marcados como
 * "Próximamente", mientras se escriben los demás. Para quitar los de muestra
 * basta vaciar MUESTRA.
 */
const MUESTRA = [
  { titulo: "Identidad visual que vende", categoria: "Branding", bajada: "Por qué una marca coherente convierte más que una bonita." },
  { titulo: "Remarketing sin perseguir", categoria: "Marketing", bajada: "Cómo volver a encontrar a quien ya mostró interés, sin cansarlo." },
  { titulo: "Diseño web que carga rápido", categoria: "Web", bajada: "Imágenes, video y código ligeros para no perder visitas." },
  { titulo: "Fotografía de producto", categoria: "Fotografía", bajada: "Luz, fondo y encuadre para que el producto se venda solo." },
  { titulo: "IA en el proceso creativo", categoria: "Inteligencia artificial", bajada: "Dónde ayuda, dónde estorba y cómo usarla con criterio." },
  { titulo: "Del logo al sistema", categoria: "Branding", bajada: "Paleta, tipografía y aplicaciones que sostienen una marca." },
];

const PALETA = ["#00aff0", "#7b3fe4", "#e63a1e", "#f0be20", "#1fa2ff", "#ff9ae1"];

function tarjetas() {
  const reales = ARTICULOS.map((a) => ({
    titulo: a.titulo,
    categoria: `${SECCIONES_ARTICULOS[a.seccion].nombre} · ${a.categoria}`,
    bajada: a.bajada,
    href: `${SECCIONES_ARTICULOS[a.seccion].ruta}/${a.slug}`,
  }));
  return [...reales, ...MUESTRA.map((m) => ({ ...m, proximo: true }))];
}

// Velocidad del desfile automático (px por segundo)
const VELOCIDAD = 45;

export default function CarruselArticulos() {
  const items = tarjetas();
  const ventanaRef = useRef(null);
  const tiraRef = useRef(null);
  // Si hubo arrastre, el clic que llega al soltar no debe abrir el artículo
  const arrastreRef = useRef(false);

  useEffect(() => {
    const ventana = ventanaRef.current;
    const tira = tiraRef.current;
    if (!ventana || !tira) return undefined;

    const lento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = 0;
    // Periodo de la tira duplicada: la mitad del ancho más un hueco entre tarjetas
    const periodo = () => (tira.scrollWidth + parseFloat(getComputedStyle(tira).columnGap || "0")) / 2;
    let mitad = periodo();
    let encima = false;
    let arrastre = null; // { inicioX, inicioPos, ultimoX, ultimoT, vel }
    let inercia = 0;
    let anterior = performance.now();
    let frame;

    // Mantiene x dentro de [-mitad, 0): la tira está duplicada, así que saltar
    // una mitad no se nota
    const envolver = () => {
      if (!mitad) return;
      x = ((x % mitad) - mitad) % mitad;
    };

    const tick = (t) => {
      const dt = Math.min(0.05, (t - anterior) / 1000);
      anterior = t;
      if (!arrastre) {
        if (Math.abs(inercia) > 5) {
          x += inercia * dt;
          inercia *= Math.pow(0.04, dt); // frena poco a poco
        } else if (!encima) {
          x -= (lento ? VELOCIDAD / 4 : VELOCIDAD) * dt;
        }
      }
      envolver();
      tira.style.transform = `translate3d(${x}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      arrastre = { inicioX: e.clientX, inicioPos: x, ultimoX: e.clientX, ultimoT: performance.now(), vel: 0, movido: false };
      inercia = 0;
      arrastreRef.current = false;
    };
    const onMove = (e) => {
      if (!arrastre) return;
      const dx = e.clientX - arrastre.inicioX;
      if (!arrastre.movido && Math.abs(dx) > 6) {
        arrastre.movido = true;
        arrastreRef.current = true;
        ventana.setPointerCapture?.(e.pointerId);
        ventana.classList.add(styles.arrastrando);
      }
      if (!arrastre.movido) return;
      const ahora = performance.now();
      const dtm = Math.max(1, ahora - arrastre.ultimoT);
      arrastre.vel = ((e.clientX - arrastre.ultimoX) / dtm) * 1000;
      arrastre.ultimoX = e.clientX;
      arrastre.ultimoT = ahora;
      x = arrastre.inicioPos + dx;
    };
    const onUp = () => {
      if (!arrastre) return;
      if (arrastre.movido) inercia = Math.max(-2500, Math.min(2500, arrastre.vel));
      arrastre = null;
      ventana.classList.remove(styles.arrastrando);
    };
    const onEnter = () => { encima = true; };
    const onLeave = () => { encima = false; };
    const onResize = () => { mitad = periodo(); };

    ventana.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    ventana.addEventListener("mouseenter", onEnter);
    ventana.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      ventana.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      ventana.removeEventListener("mouseenter", onEnter);
      ventana.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Tras arrastrar, se cancela el clic que dispara el navegador al soltar
  const evitarClicTrasArrastre = (e) => {
    if (arrastreRef.current) {
      e.preventDefault();
      e.stopPropagation();
      arrastreRef.current = false;
    }
  };

  const Tarjeta = ({ item, i, oculta }) => {
    const contenido = (
      <>
        <span className={styles.acento} style={{ background: PALETA[i % PALETA.length] }} aria-hidden="true" />
        <span className={styles.categoria}>{item.categoria}</span>
        <h3>{item.titulo}</h3>
        <p>{item.bajada}</p>
        <span className={styles.pie}>{item.proximo ? "Próximamente" : "Leer artículo →"}</span>
      </>
    );
    // La copia de la tira también enlaza (es la que se ve al dar la vuelta),
    // pero queda fuera del tabulador y del lector de pantalla
    return item.href ? (
      <Link
        href={item.href}
        className={styles.tarjeta}
        draggable={false}
        tabIndex={oculta ? -1 : undefined}
        aria-hidden={oculta || undefined}
      >
        {contenido}
      </Link>
    ) : (
      <div className={`${styles.tarjeta} ${item.proximo ? styles.proxima : ""}`} aria-hidden={oculta || undefined}>
        {contenido}
      </div>
    );
  };

  return (
    <section className={styles.seccion} aria-labelledby="carrusel-articulos-titulo">
      <div className={styles.cabecera}>
        <h2 id="carrusel-articulos-titulo">Artículos</h2>
        <div className={styles.enlaces}>
          <Link href="/grow/articulos">Grow</Link>
          <Link href="/diseno/articulos">Diseño</Link>
        </div>
      </div>

      {/* La tira va duplicada: al llegar a la mitad vuelve al inicio sin salto.
          Se arrastra con el dedo o el mouse; al soltar sigue con inercia. */}
      <div className={styles.ventana} ref={ventanaRef} onClickCapture={evitarClicTrasArrastre}>
        <div className={styles.tira} ref={tiraRef}>
          {items.map((item, i) => (
            <Tarjeta key={`a-${i}`} item={item} i={i} />
          ))}
          {items.map((item, i) => (
            <Tarjeta key={`b-${i}`} item={item} i={i} oculta />
          ))}
        </div>
      </div>
    </section>
  );
}

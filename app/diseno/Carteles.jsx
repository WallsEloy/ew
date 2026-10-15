"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CATEGORIAS_CARTELES } from "../../data/carteles";
import VideoTile from "./proyectos/[profileId]/[projectId]/VideoTile";
import styles from "./Carteles.module.css";

/*
 * Área Carteles: una cuadrícula con un módulo por categoría (2 columnas en
 * celular, 4 en escritorio). Al abrir un módulo, sus carteles se recorren en un
 * carrusel a pantalla completa: se desliza con el dedo (scroll-snap), con las
 * flechas, con los puntos o con el teclado (← → y Esc para cerrar).
 */
export default function Carteles({ titulo = "Carteles", descripcion }) {
  const [abierta, setAbierta] = useState(null); // índice de la categoría abierta

  // ?categoria=<slug> abre esa categoría al entrar (lo usa el botón «Ver
  // proyecto» de las fotos de la galería)
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("categoria");
    const i = CATEGORIAS_CARTELES.findIndex((c) => c.slug === slug);
    if (i >= 0) setAbierta(i);
  }, []);

  return (
    <section className={styles.area} aria-labelledby="carteles-titulo">
      <header className={styles.cabecera}>
        <span>Diseño gráfico</span>
        <h2 id="carteles-titulo">{titulo}</h2>
        {descripcion && <p>{descripcion}</p>}
      </header>

      <div className={styles.grid}>
        {CATEGORIAS_CARTELES.map((categoria, i) => (
          <button
            key={categoria.slug}
            type="button"
            className={styles.modulo}
            onClick={() => setAbierta(i)}
            aria-label={`Abrir ${categoria.nombre}: ${categoria.carteles.length} carteles`}
          >
            <span className={styles.portada}>
              {/* Los demás carteles asoman detrás de la portada, como una pila */}
              {categoria.carteles.slice(1, 3).map((c, j) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={c.mini} src={c.mini} alt="" className={`${styles.detras} ${styles[`detras${j + 1}`]}`} loading="lazy" decoding="async" />
              ))}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={categoria.carteles[0].mini} alt="" className={styles.frente} loading="lazy" decoding="async" />
            </span>
            <span className={styles.pie}>
              <strong>{categoria.nombre}</strong>
              <small>{categoria.carteles.length} carteles</small>
            </span>
          </button>
        ))}
      </div>

      {abierta !== null && (
        <Carrusel categoria={CATEGORIAS_CARTELES[abierta]} onCerrar={() => setAbierta(null)} />
      )}
    </section>
  );
}

function Carrusel({ categoria, onCerrar }) {
  const pistaRef = useRef(null);
  const cerrarRef = useRef(null);
  const visorRef = useRef(null);
  const aplicacionesRef = useRef(null);
  const [actual, setActual] = useState(0);
  const total = categoria.carteles.length;
  // Índice actual para el teclado (el listener no se vuelve a registrar)
  const actualRef = useRef(0);
  actualRef.current = actual;

  const irA = useCallback((i, suave = true) => {
    const pista = pistaRef.current;
    if (!pista) return;
    const destino = Math.max(0, Math.min(total - 1, i));
    const slide = pista.children[destino];
    pista.scrollTo({ left: slide.offsetLeft - (pista.clientWidth - slide.clientWidth) / 2, behavior: suave ? "smooth" : "auto" });
  }, [total]);

  // El cartel actual es el más cercano al centro de la pista
  const alDesplazar = () => {
    const pista = pistaRef.current;
    if (!pista) return;
    const centro = pista.scrollLeft + pista.clientWidth / 2;
    let mejor = 0;
    let distancia = Infinity;
    [...pista.children].forEach((slide, i) => {
      const d = Math.abs(slide.offsetLeft + slide.clientWidth / 2 - centro);
      if (d < distancia) { distancia = d; mejor = i; }
    });
    setActual(mejor);
  };

  /*
   * Arrastre con el dedo o con el mouse. La pista sigue el gesto y, al soltar,
   * pasa al cartel siguiente o al anterior según la distancia o la velocidad
   * del gesto. Los gestos verticales se dejan al navegador (touch-action: pan-y).
   */
  const arrastreRef = useRef(null);
  const ignorarClicRef = useRef(false);

  const alPresionar = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    arrastreRef.current = { x: e.clientX, y: e.clientY, left: pistaRef.current.scrollLeft, t: performance.now(), inicio: actualRef.current, movido: false, id: e.pointerId };
  };

  const alMover = (e) => {
    const a = arrastreRef.current;
    const pista = pistaRef.current;
    if (!a || !pista) return;
    const dx = e.clientX - a.x;
    if (!a.movido) {
      // Sólo cuenta como arrastre si el gesto es más horizontal que vertical;
      // si no, es scroll del visor y se suelta
      if (Math.abs(e.clientY - a.y) > Math.abs(dx) && Math.abs(e.clientY - a.y) > 6) { arrastreRef.current = null; return; }
      if (Math.abs(dx) < 6) return;
      a.movido = true;
      pista.classList.add(styles.arrastrando);
      pista.setPointerCapture?.(a.id);
    }
    pista.scrollLeft = a.left - dx;
  };

  const alSoltar = (e) => {
    const a = arrastreRef.current;
    const pista = pistaRef.current;
    arrastreRef.current = null;
    if (!a || !a.movido || !pista) return;
    const dx = e.clientX - a.x;
    const velocidad = dx / Math.max(1, performance.now() - a.t); // px/ms
    let destino = a.inicio;
    if (dx < -50 || velocidad < -0.35) destino = a.inicio + 1;
    else if (dx > 50 || velocidad > 0.35) destino = a.inicio - 1;
    pista.classList.remove(styles.arrastrando);
    pista.releasePointerCapture?.(a.id);
    // Un arrastre no debe contar como clic sobre el cartel vecino
    ignorarClicRef.current = true;
    setTimeout(() => { ignorarClicRef.current = false; }, 0);
    irA(destino);
  };

  // Al abrir, el primer cartel queda centrado (la pista tiene medio ancho de
  // margen a cada lado para que el primero y el último puedan centrarse)
  useEffect(() => {
    irA(0, false);
  }, [irA]);

  // Teclado, bloqueo del scroll de la página y foco en cerrar
  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cerrarRef.current?.focus();
    const tecla = (e) => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowRight") irA(actualRef.current + 1);
      if (e.key === "ArrowLeft") irA(actualRef.current - 1);
    };
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", tecla);
    };
  }, [irA, onCerrar]);


  // Se pinta en <body>: dentro de la página quedaría atrapado por contenedores
  // con transformaciones y se descuadraría en el celular
  return createPortal(
    <div ref={visorRef} className={styles.visor} role="dialog" aria-modal="true" aria-label={`Carteles de ${categoria.nombre}`}>
      {/* Primera pantalla: el carrusel. Si la categoría tiene aplicaciones, se
          ven debajo, dentro del mismo visor, bajando con scroll */}
      <div className={styles.pantalla}>
      <div className={styles.visorCabecera}>
        <div>
          <strong>{categoria.nombre}</strong>
          <span>{categoria.descripcion}</span>
        </div>
        <span className={styles.contador} aria-live="polite">{actual + 1} / {total}</span>
        <button ref={cerrarRef} type="button" className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar carrusel">×</button>
      </div>

      <div
        ref={pistaRef}
        className={styles.pista}
        onScroll={alDesplazar}
        onPointerDown={alPresionar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
      >
        {categoria.carteles.map((c, i) => (
          <figure key={c.src} className={`${styles.slide} ${i === actual ? styles.slideActivo : ""}`} onClick={() => !ignorarClicRef.current && i !== actual && irA(i)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.src} alt={c.alt} width={c.ancho} height={c.alto} loading={Math.abs(i - actual) <= 1 ? "eager" : "lazy"} decoding="async" draggable={false} />
          </figure>
        ))}
      </div>

      <button type="button" className={`${styles.flecha} ${styles.flechaIzq}`} onClick={() => irA(actual - 1)} disabled={actual === 0} aria-label="Cartel anterior">‹</button>
      <button type="button" className={`${styles.flecha} ${styles.flechaDer}`} onClick={() => irA(actual + 1)} disabled={actual === total - 1} aria-label="Cartel siguiente">›</button>

      <div className={styles.puntos}>
        {categoria.carteles.map((c, i) => (
          <button key={c.src} type="button" className={i === actual ? styles.puntoActivo : ""} onClick={() => irA(i)} aria-label={`Ir al cartel ${i + 1}`} aria-current={i === actual} />
        ))}
        {categoria.aplicaciones && (
          <button type="button" className={styles.bajar} onClick={() => aplicacionesRef.current?.scrollIntoView({ behavior: "smooth" })}>
            ↓ {categoria.aplicaciones.titulo}
          </button>
        )}
      </div>
      </div>

      {categoria.aplicaciones && (
        <section ref={aplicacionesRef} className={styles.aplicaciones} aria-label={categoria.aplicaciones.titulo}>
          <header>
            <h3>{categoria.aplicaciones.titulo}</h3>
            {categoria.aplicaciones.texto && <p>{categoria.aplicaciones.texto}</p>}
          </header>
          <div className={styles.aplicacionesGrid}>
            {/* Imágenes y videos (los videos se reproducen solos, en silencio,
                sólo mientras están a la vista) */}
            {categoria.aplicaciones.imagenes.map((img) => img.video ? (
              <VideoTile key={img.video} src={img.video} poster={img.poster} label={img.alt} width={img.ancho} height={img.alto} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={img.src} src={img.src} alt={img.alt} width={img.ancho} height={img.alto} loading="lazy" decoding="async" />
            ))}
          </div>
        </section>
      )}
    </div>,
    document.body,
  );
}

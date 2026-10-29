"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icono from "../gogo/Icono";
import { TemaCampana } from "./piezas";
import styles from "./artifact.module.css";

// Lightbox: flechas del teclado, Escape, deslizar con el dedo y foco atrapado
function Lightbox({ items: GALERIA, indice, onCambiar, onCerrar }) {
  const tema = useContext(TemaCampana);
  const cerrar = useRef(null);
  const toque = useRef(null);
  const item = GALERIA[indice];
  const mover = useCallback((paso) => onCambiar((indice + paso + GALERIA.length) % GALERIA.length), [indice, onCambiar]);

  useEffect(() => {
    const anterior = document.activeElement;
    cerrar.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; anterior?.focus?.(); };
  }, []);
  useEffect(() => {
    const tecla = (e) => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowRight") mover(1);
      if (e.key === "ArrowLeft") mover(-1);
      if (e.key === "Tab") {
        const focos = [...document.querySelectorAll("[data-art-lightbox] button")];
        const k = focos.indexOf(document.activeElement);
        if (e.shiftKey && k <= 0) { e.preventDefault(); focos[focos.length - 1].focus(); }
        else if (!e.shiftKey && k === focos.length - 1) { e.preventDefault(); focos[0].focus(); }
      }
    };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [mover, onCerrar]);

  return createPortal(
    <div
      className={`${styles.lightbox} ${tema}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Galería: ${item.alt}`}
      data-art-lightbox
      onClick={onCerrar}
      onTouchStart={(e) => { toque.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (toque.current === null) return;
        const dx = e.changedTouches[0].clientX - toque.current;
        if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
        toque.current = null;
      }}
    >
      <div className={styles.lightboxBarra} onClick={(e) => e.stopPropagation()}>
        <span>{String(indice + 1).padStart(2, "0")} / {String(GALERIA.length).padStart(2, "0")} · {item.tipo}</span>
        <button ref={cerrar} type="button" onClick={onCerrar} aria-label="Cerrar galería"><Icono nombre="x" size={20} /></button>
      </div>
      <figure className={styles.lightboxFigura} onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={item.src} src={item.src} alt={item.alt} />
        <figcaption>{item.alt}</figcaption>
      </figure>
      <button type="button" className={`${styles.lightboxFlecha} ${styles.lightboxIzq}`} onClick={(e) => { e.stopPropagation(); mover(-1); }} aria-label="Imagen anterior"><Icono nombre="flecha" size={22} /></button>
      <button type="button" className={`${styles.lightboxFlecha} ${styles.lightboxDer}`} onClick={(e) => { e.stopPropagation(); mover(1); }} aria-label="Imagen siguiente"><Icono nombre="flecha" size={22} /></button>
    </div>,
    document.body,
  );
}

export default function Galeria({ items: GALERIA }) {
  const [indice, setIndice] = useState(null);
  const cerrar = useCallback(() => setIndice(null), []);
  return (
    <>
      <div className={styles.galeria} data-grupo>
        {GALERIA.map((g, k) => (
          <button key={g.src} type="button" className={`${styles.galeriaItem} ${styles[`g_${g.ancho}`]}`} onClick={() => setIndice(k)} aria-label={`Ampliar: ${g.alt}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.src} alt="" loading="lazy" decoding="async" />
            <span>{g.tipo}</span>
          </button>
        ))}
      </div>
      {indice !== null && <Lightbox items={GALERIA} indice={indice} onCambiar={setIndice} onCerrar={cerrar} />}
    </>
  );
}

"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Icono from "../gogo/Icono";
import styles from "./artifact.module.css";

// Clase del tema de color de la campaña. El modal y el lightbox viven en un
// portal (fuera de la landing), así que la toman de aquí.
export const TemaCampana = createContext("");

export const pesos = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
// Ventana modal genérica (foco, Escape, regreso del foco)
export function Modal({ titulo, etiqueta, onCerrar, children, ancho = 480 }) {
  const cerrar = useRef(null);
  const tema = useContext(TemaCampana);
  useEffect(() => {
    const anterior = document.activeElement;
    cerrar.current?.focus();
    const tecla = (e) => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "Tab") {
        const focos = [...document.querySelectorAll("[data-art-modal] :is(button, a, input, select, textarea):not([disabled])")];
        const k = focos.indexOf(document.activeElement);
        if (e.shiftKey && k <= 0) { e.preventDefault(); focos[focos.length - 1]?.focus(); }
        else if (!e.shiftKey && k === focos.length - 1) { e.preventDefault(); focos[0]?.focus(); }
      }
    };
    document.addEventListener("keydown", tecla);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", tecla); document.body.style.overflow = overflow; anterior?.focus?.(); };
  }, [onCerrar]);
  return createPortal(
    <div className={styles.modalFondo} onClick={onCerrar}>
      <div className={`${styles.modal} ${tema}`} style={{ width: `min(${ancho}px, 100%)` }} role="dialog" aria-modal="true" aria-labelledby="art-modal-titulo" data-art-modal onClick={(e) => e.stopPropagation()}>
        <button ref={cerrar} type="button" className={styles.modalCerrar} onClick={onCerrar} aria-label="Cerrar"><Icono nombre="x" size={18} /></button>
        {etiqueta && <span className={styles.modalEtiqueta}>{etiqueta}</span>}
        <h3 id="art-modal-titulo">{titulo}</h3>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function Demo({ texto = "Datos demostrativos" }) {
  return <span className={styles.demo}><i />{texto}</span>;
}

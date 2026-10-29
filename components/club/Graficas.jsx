"use client";

import { useId, useState } from "react";
import styles from "./club.module.css";

export const pesos = (n, decimales = 0) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: decimales }).format(n);

// Formato corto para ejes y tarjetas: $5.0 M, $106.5 mil
export const pesosCorto = (n) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)} M` : n >= 1_000 ? `$${(n / 1_000).toFixed(1)} mil` : pesos(n);

const escala = (valores, alto, margen = 0.08) => {
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  const bajo = min - rango * margen;
  const alto2 = max + rango * margen;
  return (v) => alto - ((v - bajo) / (alto2 - bajo)) * alto;
};

const trazo = (valores, ancho, alto) => {
  const y = escala(valores, alto);
  const paso = ancho / Math.max(1, valores.length - 1);
  return valores.map((v, i) => `${i ? "L" : "M"}${(i * paso).toFixed(2)},${y(v).toFixed(2)}`).join(" ");
};

// Gráfica de área interactiva. Se explora con el mouse, con el dedo o con
// las flechas del teclado; el punto activo muestra su valor.
export function Linea({ etiquetas, valores, color = "#10b981", formato = pesos, alto = 220, titulo }) {
  const id = useId().replace(/:/g, "");
  const [activo, setActivo] = useState(null);
  const ANCHO = 600;
  const ALTO = 200;
  const linea = trazo(valores, ANCHO, ALTO);
  const y = escala(valores, ALTO);
  const paso = ANCHO / Math.max(1, valores.length - 1);
  const i = activo ?? valores.length - 1;
  const variacion = ((valores[valores.length - 1] - valores[0]) / valores[0]) * 100;

  const mover = (e) => {
    const caja = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - caja.left) / caja.width;
    setActivo(Math.max(0, Math.min(valores.length - 1, Math.round(x * (valores.length - 1)))));
  };
  const tecla = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); setActivo(Math.min(valores.length - 1, i + 1)); }
    if (e.key === "ArrowLeft") { e.preventDefault(); setActivo(Math.max(0, i - 1)); }
    if (e.key === "Home") setActivo(0);
    if (e.key === "End") setActivo(valores.length - 1);
  };

  return (
    <div className={styles.linea}>
      <div
        className={styles.lineaArea}
        style={{ height: alto }}
        tabIndex={0}
        role="img"
        aria-label={`${titulo || "Gráfica"}: de ${formato(valores[0])} (${etiquetas[0]}) a ${formato(valores[valores.length - 1])} (${etiquetas[etiquetas.length - 1]}), variación de ${variacion.toFixed(1)}%. Usa las flechas para recorrer los puntos.`}
        onPointerMove={mover}
        onPointerDown={mover}
        onPointerLeave={() => setActivo(null)}
        onKeyDown={tecla}
        onBlur={() => setActivo(null)}
      >
        <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={`relleno-${id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.35" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={ANCHO} y1={ALTO * f} y2={ALTO * f} className={styles.rejilla} />)}
          <path d={`${linea} L${ANCHO},${ALTO} L0,${ALTO} Z`} fill={`url(#relleno-${id})`} className={styles.lineaRelleno} />
          <path d={linea} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" className={styles.lineaTrazo} />
          <line x1={i * paso} x2={i * paso} y1="0" y2={ALTO} className={styles.cursor} />
        </svg>
        <span className={styles.punto} style={{ left: `${(i * paso / ANCHO) * 100}%`, top: `${(y(valores[i]) / ALTO) * 100}%`, background: color }} />
        <span
          // Cerca del borde superior, la etiqueta va debajo del punto
          className={`${styles.burbuja} ${y(valores[i]) / ALTO < 0.35 ? styles.burbujaAbajo : ""}`}
          style={{ left: `${Math.min(86, Math.max(14, (i * paso / ANCHO) * 100))}%`, top: `${(y(valores[i]) / ALTO) * 100}%` }}
          aria-hidden="true"
        >
          <small>{etiquetas[i]}</small>
          <b>{formato(valores[i])}</b>
        </span>
      </div>
      <div className={styles.lineaEje} aria-hidden="true">
        {etiquetas.map((e, k) => (
          <span key={e} className={k === i ? styles.ejeActivo : ""} style={{ visibility: etiquetas.length > 8 && k % 2 && k !== i ? "hidden" : "visible" }}>{e}</span>
        ))}
      </div>
    </div>
  );
}

// Minigráfica de tendencia para tarjetas
export function Mini({ valores, color = "#10b981", alto = 44 }) {
  const id = useId().replace(/:/g, "");
  const ANCHO = 160;
  const ALTO = 44;
  const linea = trazo(valores, ANCHO, ALTO);
  return (
    <svg className={styles.mini} viewBox={`0 0 ${ANCHO} ${ALTO}`} preserveAspectRatio="none" style={{ height: alto }} aria-hidden="true">
      <defs>
        <linearGradient id={`mini-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.3" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${linea} L${ANCHO},${ALTO} L0,${ALTO} Z`} fill={`url(#mini-${id})`} />
      <path d={linea} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// Dona con leyenda; resalta un segmento al pasar el mouse o con el foco
export function Dona({ datos, centro, formato = (v) => `${v.toFixed(0)}%`, titulo }) {
  const [activo, setActivo] = useState(null);
  const total = datos.reduce((s, d) => s + d.valor, 0) || 1;
  const R = 15.9155;
  let acumulado = 0;
  const elegido = activo !== null ? datos[activo] : null;
  return (
    <figure className={styles.dona}>
      <div className={styles.donaGrafica}>
        <svg viewBox="0 0 42 42" role="img" aria-label={`${titulo}: ${datos.map((d) => `${d.etiqueta} ${formato((d.valor / total) * 100)}`).join(", ")}`}>
          <circle cx="21" cy="21" r={R} fill="none" className={styles.donaPista} strokeWidth="5" />
          {datos.map((d, k) => {
            const largo = (d.valor / total) * 100;
            const inicio = acumulado;
            acumulado += largo;
            const visible = Math.max(0, largo - 0.8);
            return (
              <circle key={d.etiqueta} cx="21" cy="21" r={R} fill="none" stroke={d.color}
                strokeWidth={activo === k ? 6.4 : 5} strokeDasharray={`${visible} ${100 - visible}`} strokeDashoffset={25 - inicio}
                opacity={activo === null || activo === k ? 1 : 0.35} className={styles.donaSegmento}
                onMouseEnter={() => setActivo(k)} onMouseLeave={() => setActivo(null)} />
            );
          })}
        </svg>
        <div className={styles.donaCentro} aria-hidden="true">
          <strong>{elegido ? formato((elegido.valor / total) * 100) : centro.valor}</strong>
          <span>{elegido ? elegido.etiqueta : centro.etiqueta}</span>
        </div>
      </div>
      <figcaption>
        <ul className={styles.leyenda}>
          {datos.map((d, k) => (
            <li key={d.etiqueta}>
              <button type="button" className={activo === k ? styles.leyendaActiva : ""}
                onMouseEnter={() => setActivo(k)} onMouseLeave={() => setActivo(null)} onFocus={() => setActivo(k)} onBlur={() => setActivo(null)}>
                <i style={{ background: d.color }} /><span>{d.etiqueta}</span><b>{formato((d.valor / total) * 100)}</b>
              </button>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

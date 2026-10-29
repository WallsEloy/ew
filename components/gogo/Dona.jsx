"use client";

import { useState } from "react";
import styles from "./gogo.module.css";

// Gráfica de dona en SVG. Cada segmento y cada fila de la leyenda resalta el
// mismo dato al pasar el mouse o al enfocarlo con el teclado, y el centro
// muestra su porcentaje. Los cambios de valor se animan con CSS.
// datos: [{ etiqueta, valor, color }] — `valor` en porcentaje (0–100).
export default function Dona({ datos, titulo, centro, formato = (v) => `${Number.isInteger(Math.round(v * 10) / 10) ? Math.round(v) : v.toFixed(1)}%` }) {
  const [activo, setActivo] = useState(null);
  const total = datos.reduce((suma, d) => suma + Math.max(0, d.valor), 0) || 1;
  const radio = 15.9155; // circunferencia de 100: los porcentajes son longitudes
  let acumulado = 0;
  const elegido = activo !== null ? datos[activo] : null;

  return (
    <figure className={styles.dona}>
      <div className={styles.donaGrafica}>
        <svg viewBox="0 0 42 42" role="img" aria-label={`${titulo}: ${datos.map((d) => `${d.etiqueta} ${formato((d.valor / total) * 100)}`).join(", ")}`}>
          <circle cx="21" cy="21" r={radio} fill="none" className={styles.donaPista} strokeWidth="5" />
          {datos.map((d, i) => {
            const largo = (Math.max(0, d.valor) / total) * 100;
            const inicio = acumulado;
            acumulado += largo;
            return (
              <circle
                key={d.etiqueta}
                className={styles.donaSegmento}
                cx="21"
                cy="21"
                r={radio}
                fill="none"
                stroke={d.color}
                strokeWidth={activo === i ? 6.4 : 5}
                // Un pequeño hueco entre segmentos
                strokeDasharray={`${Math.max(0, largo - (largo > 1 ? 0.6 : 0))} ${100 - Math.max(0, largo - (largo > 1 ? 0.6 : 0))}`}
                strokeDashoffset={25 - inicio}
                opacity={activo === null || activo === i ? 1 : 0.35}
                onMouseEnter={() => setActivo(i)}
                onMouseLeave={() => setActivo(null)}
              />
            );
          })}
        </svg>
        <div className={styles.donaCentro} aria-hidden="true">
          <strong>{elegido ? formato((elegido.valor / total) * 100) : centro?.valor}</strong>
          <span>{elegido ? elegido.etiqueta : centro?.etiqueta}</span>
        </div>
      </div>
      <figcaption>
        <ul className={styles.leyenda}>
          {datos.map((d, i) => (
            <li key={d.etiqueta}>
              <button
                type="button"
                className={activo === i ? styles.leyendaActiva : ""}
                onMouseEnter={() => setActivo(i)}
                onMouseLeave={() => setActivo(null)}
                onFocus={() => setActivo(i)}
                onBlur={() => setActivo(null)}
              >
                <i style={{ background: d.color }} />
                <span>{d.etiqueta}</span>
                <b>{formato((d.valor / total) * 100)}</b>
              </button>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

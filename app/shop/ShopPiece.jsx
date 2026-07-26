"use client";

import Link from "next/link";
import { useState } from "react";

import {
  CATEGORIAS,
  CERTIFICADOS,
  VISTAS,
  copiaAsignada,
  formatearPrecio,
} from "../../lib/shopData";
import styles from "./page.module.css";

// Cada vista del carrusel se monta con una puesta en escena distinta (ver shopData)
const CLASES_VISTA = {
  obra: styles.vistaObra,
  pantalla: styles.vistaPantalla,
  enmarcada: styles.vistaEnmarcada,
  detalle: styles.vistaDetalle,
  sala: styles.vistaSala,
};

export default function ShopPiece({ pieza }) {
  const [categoriaId, setCategoriaId] = useState(CATEGORIAS[0].id);
  const [vistaIndex, setVistaIndex] = useState(0);

  const categoria =
    CATEGORIAS.find((c) => c.id === categoriaId) || CATEGORIAS[0];

  // Las vistas dependen del formato elegido: lo digital no se enmarca
  const vistas = (categoria.vistas || ["obra"]).map((id) => VISTAS[id]);
  // El índice se recorta por si el formato nuevo trae menos vistas que el anterior
  const indice = Math.min(vistaIndex, vistas.length - 1);
  const vista = vistas[indice];

  const mover = (paso) =>
    setVistaIndex((actual) => {
      const base = Math.min(actual, vistas.length - 1);
      return (base + paso + vistas.length) % vistas.length;
    });

  const elegirCategoria = (id) => {
    setCategoriaId(id);
    setVistaIndex(0);
  };

  const copia = copiaAsignada(pieza.semilla, categoria);
  const edicion = categoria.copias
    ? `Copia ${String(copia).padStart(2, "0")} de ${categoria.copias}`
    : "Edición abierta";

  // Mientras no haya pasarela de pagos, la compra se cierra por contacto con
  // todo lo elegido ya cargado en la URL.
  const checkoutHref = `/contacto?${new URLSearchParams({
    pieza: pieza.referencia,
    formato: categoria.nombre,
    copia: categoria.copias ? `${copia}/${categoria.copias}` : "abierta",
  }).toString()}`;

  return (
    <div className={styles.layout}>
      <div className={styles.mediaColumn}>
        <Link href="/galeria" className={styles.volver}>
          ← Volver a la galería
        </Link>

        {/* --- Carrusel de vistas --- */}
        <div className={styles.carrusel}>
          <div className={styles.escenario}>
            <div className={`${styles.vista} ${CLASES_VISTA[vista.id] || ""}`}>
              <img
                src={pieza.imagen}
                alt={`${pieza.titulo} — ${vista.nombre}`}
                className={styles.obra}
              />
            </div>

            {vistas.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => mover(-1)}
                  className={`${styles.flecha} ${styles.flechaPrevia}`}
                  aria-label="Ver la imagen anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => mover(1)}
                  className={`${styles.flecha} ${styles.flechaSiguiente}`}
                  aria-label="Ver la imagen siguiente"
                >
                  ›
                </button>
              </>
            )}

            <span className={styles.vistaNombre}>{vista.nombre}</span>
          </div>

          {vistas.length > 1 && (
            <div className={styles.puntos} aria-hidden="true">
              {vistas.map((item, i) => (
                <span
                  key={item.id}
                  className={`${styles.punto} ${i === indice ? styles.puntoActivo : ""}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* --- Descripción, debajo de la imagen --- */}
        <div className={styles.ficha}>
          <p className={styles.eyebrow}>
            {pieza.galeria} · {pieza.referencia}
          </p>
          <h1 className={styles.titulo}>{pieza.titulo}</h1>
          <p className={styles.vistaPie} aria-live="polite">
            {vista.pie}
          </p>
          <p className={styles.descripcion}>{pieza.descripcion}</p>
        </div>

        {/* --- Certificados --- */}
        <section className={styles.certificados}>
          <h2 className={styles.seccionTitulo}>Certificados y documentación</h2>

          {CERTIFICADOS.map((cert) => {
            const incluido = cert.categorias.includes(categoria.id);

            return (
              <details key={cert.id} className={styles.acordeon}>
                <summary className={styles.acordeonCabecera}>
                  <span className={styles.acordeonTexto}>
                    <span className={styles.acordeonNombre}>{cert.nombre}</span>
                    <span className={styles.acordeonResumen}>{cert.resumen}</span>
                  </span>
                  <span
                    className={`${styles.acordeonEstado} ${
                      incluido ? styles.acordeonIncluido : ""
                    }`}
                  >
                    {incluido ? "Incluido" : "No aplica"}
                  </span>
                  <span className={styles.acordeonFlecha} aria-hidden="true">
                    ⌄
                  </span>
                </summary>

                <ul className={styles.acordeonLista}>
                  {cert.puntos.map((punto) => (
                    <li key={punto}>{punto}</li>
                  ))}
                </ul>

                {!incluido && (
                  <p className={styles.acordeonAviso}>
                    No viene con «{categoria.nombre}». Se incluye en:{" "}
                    {cert.categorias
                      .map(
                        (id) =>
                          CATEGORIAS.find((c) => c.id === id)?.nombre || id,
                      )
                      .join(" · ")}
                    .
                  </p>
                )}
              </details>
            );
          })}
        </section>
      </div>

      {/* --- Panel de compra --- */}
      <div className={styles.panel}>
        <h2 className={styles.seccionTitulo}>Elige cómo la quieres</h2>

        <div className={styles.categorias} role="radiogroup" aria-label="Formato">
          {CATEGORIAS.map((item) => {
            const activa = item.id === categoria.id;

            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={activa}
                onClick={() => elegirCategoria(item.id)}
                className={`${styles.categoria} ${activa ? styles.categoriaActiva : ""}`}
              >
                <span className={styles.categoriaCabecera}>
                  <span className={styles.categoriaNombre}>{item.nombre}</span>
                  <span className={styles.categoriaEtiqueta}>{item.etiqueta}</span>
                </span>
                <span className={styles.categoriaResumen}>{item.resumen}</span>
                <ul className={styles.categoriaDetalle}>
                  {item.detalle.map((linea) => (
                    <li key={linea}>{linea}</li>
                  ))}
                </ul>
                <span className={styles.categoriaPie}>
                  <span className={styles.categoriaPrecio}>
                    {formatearPrecio(item.precio)}
                  </span>
                  <span className={styles.categoriaEdicion}>
                    {item.copias ? `Edición de ${item.copias}` : "Edición abierta"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Bloque de compra */}
        <div className={styles.compra}>
          <div className={styles.compraResumen}>
            <span className={styles.compraFormato}>{categoria.nombre}</span>
            <span className={styles.compraPrecio}>
              {formatearPrecio(categoria.precio)}
            </span>
          </div>

          <p className={styles.compraCopia}>{edicion}</p>

          <p className={styles.compraTexto}>
            {pieza.descripcion} {categoria.resumen} {categoria.entrega}.
          </p>

          <Link href={checkoutHref} className={styles.adquirir}>
            Adquirir
          </Link>

          <p className={styles.compraNota}>
            El estudio confirma la copia y los datos de envío por correo antes
            del cobro.
          </p>
        </div>
      </div>
    </div>
  );
}

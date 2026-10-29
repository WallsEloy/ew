"use client";

import { useEffect, useState } from "react";
import TarjetasGrow from "../TarjetasGrow";
import styles from "../opcion-a/page.module.css";

// Categorías de Grow → Proyectos, en el orden de los botones
const CATEGORIAS = ["Negocio", "Crowdfunding"];

// Botones de categoría sobre las tarjetas. El filtro se refleja en la URL
// (?categoria=negocio) para poder compartir la vista.
export default function ProyectosFiltrables({ proyectos, encabezado }) {
  const [categoria, setCategoria] = useState("Todos");

  useEffect(() => {
    const pedida = new URLSearchParams(window.location.search).get("categoria");
    const encontrada = CATEGORIAS.find((c) => c.toLowerCase() === pedida?.toLowerCase());
    if (encontrada) setCategoria(encontrada);
  }, []);

  const elegir = (c) => {
    setCategoria(c);
    const url = new URL(window.location.href);
    if (c === "Todos") url.searchParams.delete("categoria");
    else url.searchParams.set("categoria", c.toLowerCase());
    window.history.replaceState(null, "", url);
  };

  const opciones = ["Todos", ...CATEGORIAS];
  const visibles = categoria === "Todos" ? proyectos : proyectos.filter((p) => p.eyebrow === categoria);

  return (
    <TarjetasGrow
      proyectos={visibles}
      encabezado={
        <>
          {encabezado}
          <div className={styles.filtros} role="group" aria-label="Filtrar proyectos por categoría">
            {opciones.map((c) => (
              <button key={c} type="button" className={`${styles.filtro} ${categoria === c ? styles.filtroActivo : ""}`} aria-pressed={categoria === c} onClick={() => elegir(c)}>
                {c}
              </button>
            ))}
          </div>
          {!visibles.length && <p className={styles.sinProyectos}>Todavía no hay proyectos de {categoria}.</p>}
        </>
      }
    />
  );
}

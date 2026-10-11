"use client";
import { useId, useState } from "react";
import styles from "./WebShowcase.module.css";

// Botón bajo una tarjeta del muestrario que despliega otros proyectos del
// mismo tipo (p. ej. Event site). Mientras no tienen material se muestran
// como tarjetas de referencia, con el mismo estilo de los cuadros vacíos.
export default function GrupoDesplegable({ tipo, proyectos }) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();

  return (
    <div className={styles.grupo}>
      <button
        type="button"
        className={`${styles.grupoBoton} ${abierto ? styles.grupoBotonAbierto : ""}`}
        onClick={() => setAbierto((valor) => !valor)}
        aria-expanded={abierto}
        aria-controls={id}
      >
        <span>{tipo}</span>
        <b>{proyectos.length} proyectos más</b>
        <i aria-hidden="true">▾</i>
      </button>
      <div id={id} className={`${styles.grupoLista} ${abierto ? styles.grupoListaAbierta : ""}`} hidden={!abierto}>
        {proyectos.map((proyecto) => (
          <article className={styles.grupoTarjeta} key={proyecto.title}>
            <div className={`${styles.preview} ${styles.placeholder}`}>
              <span className={styles.kind}>{tipo}</span>
              <div className={styles.previewTitle}><small>Próximamente</small><strong>{proyecto.title}</strong></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

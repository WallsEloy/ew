"use client";

import { useState } from "react";
import { COMUNIDAD_CONECTADA, registrarColeccionista } from "../../lib/artifactCampana";
import Icono from "../gogo/Icono";
import styles from "./artifact.module.css";

const INTERESES = [
  { id: "avances", texto: "Avances de producción" },
  { id: "ediciones", texto: "Nuevas ediciones" },
  { id: "eventos", texto: "Eventos y lanzamientos" },
];

// Registro a la comunidad. Lista para Supabase (lib/artifactCampana.js);
// mientras no esté conectada, simula el registro y lo dice.
export default function Comunidad({ nombre = "ARTIFACT", campana = "artifact" }) {
  const [datos, setDatos] = useState({ nombre: "", correo: "", intereses: ["avances", "ediciones"], consentimiento: false });
  const [errores, setErrores] = useState({});
  const [estado, setEstado] = useState("inicial");
  const [mensaje, setMensaje] = useState("");

  const alternar = (id) => setDatos((d) => ({ ...d, intereses: d.intereses.includes(id) ? d.intereses.filter((x) => x !== id) : [...d.intereses, id] }));

  const enviar = async (e) => {
    e.preventDefault();
    const er = {};
    if (datos.nombre.trim().length < 2) er.nombre = "Escribe tu nombre.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(datos.correo.trim())) er.correo = "Escribe un correo válido.";
    if (!datos.intereses.length) er.intereses = "Elige al menos un tema.";
    if (!datos.consentimiento) er.consentimiento = "Necesitamos tu consentimiento para escribirte.";
    setErrores(er);
    if (Object.keys(er).length) { document.getElementById(`art-com-${Object.keys(er)[0]}`)?.focus(); return; }
    setEstado("enviando");
    try {
      const r = await registrarColeccionista({ ...datos, campana });
      setEstado("listo");
      setMensaje(r.simulado ? "Registro simulado: todavía no se guardan datos. Cuando se conecte la comunidad, te escribiremos." : "¡Listo! Ya eres parte de la comunidad.");
    } catch (err) {
      setEstado("error");
      setMensaje(err.message);
    }
  };

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <div className={styles.formFila}>
        <label className={styles.campo}>
          <span>Nombre</span>
          <input id="art-com-nombre" autoComplete="name" value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} aria-invalid={Boolean(errores.nombre)} />
          {errores.nombre && <small className={styles.error}>{errores.nombre}</small>}
        </label>
        <label className={styles.campo}>
          <span>Correo</span>
          <input id="art-com-correo" type="email" autoComplete="email" value={datos.correo} onChange={(e) => setDatos({ ...datos, correo: e.target.value })} aria-invalid={Boolean(errores.correo)} />
          {errores.correo && <small className={styles.error}>{errores.correo}</small>}
        </label>
      </div>
      <fieldset className={styles.intereses} id="art-com-intereses" tabIndex={-1}>
        <legend>Quiero recibir</legend>
        {INTERESES.map((i) => (
          <label key={i.id} className={datos.intereses.includes(i.id) ? styles.interesActivo : ""}>
            <input type="checkbox" checked={datos.intereses.includes(i.id)} onChange={() => alternar(i.id)} />
            {i.texto}
          </label>
        ))}
        {errores.intereses && <small className={styles.error}>{errores.intereses}</small>}
      </fieldset>
      <label className={styles.casilla}>
        <input id="art-com-consentimiento" type="checkbox" checked={datos.consentimiento} onChange={(e) => setDatos({ ...datos, consentimiento: e.target.checked })} />
        <span>Acepto recibir correos de {nombre} y el tratamiento de mis datos conforme al Aviso de Privacidad (en preparación).</span>
      </label>
      {errores.consentimiento && <small className={styles.error}>{errores.consentimiento}</small>}
      <button type="submit" className={styles.botonLima} disabled={estado === "enviando"}>{estado === "enviando" ? "Enviando…" : "Unirme a la comunidad"}</button>
      {!COMUNIDAD_CONECTADA && estado === "inicial" && <small className={styles.notaChica}>Demostración: el registro todavía no se guarda.</small>}
      {(estado === "listo" || estado === "error") && (
        <p className={estado === "listo" ? styles.ok : styles.error} role="status"><Icono nombre={estado === "listo" ? "check" : "alerta"} size={16} />{mensaje}</p>
      )}
    </form>
  );
}

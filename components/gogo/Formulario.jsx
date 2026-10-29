"use client";

import { useState } from "react";
import { INTERESES } from "../../data/gogo";
import Icono from "./Icono";
import styles from "./gogo.module.css";

const VACIO = { nombre: "", correo: "", empresa: "", interes: "", mensaje: "", privacidad: false };

function validar(datos) {
  const errores = {};
  if (datos.nombre.trim().length < 3) errores.nombre = "Escribe tu nombre completo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(datos.correo.trim())) errores.correo = "Escribe un correo válido.";
  if (!INTERESES.includes(datos.interes)) errores.interes = "Elige un tipo de interés.";
  if (datos.mensaje.trim().length < 10) errores.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres).";
  if (!datos.privacidad) errores.privacidad = "Necesitamos tu consentimiento para tratar tus datos.";
  return errores;
}

// Formulario de demostración: valida, pero NO envía nada a ningún servidor ni
// guarda los datos. Al validarse, lo dice claramente.
export default function Formulario() {
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [validado, setValidado] = useState(false);

  const cambiar = (campo) => (e) => {
    const valor = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setDatos((d) => ({ ...d, [campo]: valor }));
    setValidado(false);
    if (errores[campo]) setErrores((er) => ({ ...er, [campo]: undefined }));
  };

  const enviar = (e) => {
    e.preventDefault();
    const encontrados = validar(datos);
    setErrores(encontrados);
    const primero = Object.keys(encontrados)[0];
    if (primero) {
      document.getElementById(`gogo-${primero}`)?.focus();
      setValidado(false);
      return;
    }
    setValidado(true);
  };

  const error = (campo) => errores[campo] && <span id={`gogo-${campo}-error`} className={styles.campoError}>{errores[campo]}</span>;
  const aria = (campo) => ({ "aria-invalid": Boolean(errores[campo]), "aria-describedby": errores[campo] ? `gogo-${campo}-error` : undefined });

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <p className={styles.formDemo}><Icono nombre="alerta" size={16} /><span>Formulario de demostración: todavía no hay un servidor conectado, así que los datos no se envían ni se guardan.</span></p>
      <div className={styles.formGrid}>
        <label className={styles.campo}>
          <span>Nombre completo *</span>
          <input id="gogo-nombre" autoComplete="name" value={datos.nombre} onChange={cambiar("nombre")} {...aria("nombre")} />
          {error("nombre")}
        </label>
        <label className={styles.campo}>
          <span>Correo electrónico *</span>
          <input id="gogo-correo" type="email" autoComplete="email" value={datos.correo} onChange={cambiar("correo")} {...aria("correo")} />
          {error("correo")}
        </label>
        <label className={styles.campo}>
          <span>Empresa <small>(opcional)</small></span>
          <input id="gogo-empresa" autoComplete="organization" value={datos.empresa} onChange={cambiar("empresa")} />
        </label>
        <label className={styles.campo}>
          <span>Tipo de interés *</span>
          <select id="gogo-interes" value={datos.interes} onChange={cambiar("interes")} {...aria("interes")}>
            <option value="">Selecciona una opción</option>
            {INTERESES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          {error("interes")}
        </label>
        <label className={`${styles.campo} ${styles.campoAncho}`}>
          <span>Mensaje *</span>
          <textarea id="gogo-mensaje" rows={4} value={datos.mensaje} onChange={cambiar("mensaje")} {...aria("mensaje")} />
          {error("mensaje")}
        </label>
      </div>
      <div className={styles.privacidad}>
        <p><strong>Aviso de privacidad (pendiente).</strong> El aviso de privacidad definitivo se publicará antes de recibir datos reales. En él se indicará quién es el responsable, para qué se usan los datos y cómo ejercer tus derechos ARCO.</p>
        <label className={styles.casilla}>
          <input id="gogo-privacidad" type="checkbox" checked={datos.privacidad} onChange={cambiar("privacidad")} {...aria("privacidad")} />
          <span>Acepto el tratamiento de mis datos personales conforme al aviso de privacidad.</span>
        </label>
        {error("privacidad")}
      </div>
      <button type="submit" className={styles.botonPrimario}>Validar solicitud <Icono nombre="flecha" size={18} /></button>
      {validado && (
        <p className={styles.formOk} role="status">
          <Icono nombre="check" size={18} /><span>Los datos están completos. Como es una demostración, <b>no se envió ninguna solicitud</b>: cuando exista el servidor, este botón la enviará.</span>
        </p>
      )}
    </form>
  );
}

"use client";

import { useState } from "react";
import { PAISES, TIPOS_INTERESADO } from "../../data/club";
import Icono from "../gogo/Icono";
import styles from "./club.module.css";

const VACIO = { nombre: "", correo: "", pais: "México", tipo: "", mensaje: "" };

function validar(d) {
  const e = {};
  if (d.nombre.trim().length < 3) e.nombre = "Escribe tu nombre.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.correo.trim())) e.correo = "Escribe un correo válido.";
  if (!PAISES.includes(d.pais)) e.pais = "Elige tu país.";
  if (!TIPOS_INTERESADO.includes(d.tipo)) e.tipo = "Elige el tipo de interesado.";
  if (d.mensaje.trim().length < 10) e.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres).";
  return e;
}

// Registro de interés: sólo demostración frontend. Valida y avisa, pero no
// envía ni guarda nada.
export default function FormularioClub() {
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [tocados, setTocados] = useState({});
  const [listo, setListo] = useState(false);

  const cambiar = (campo) => (ev) => {
    const nuevos = { ...datos, [campo]: ev.target.value };
    setDatos(nuevos);
    setListo(false);
    // Validación visual en vivo de los campos ya tocados
    if (tocados[campo]) setErrores((er) => ({ ...er, [campo]: validar(nuevos)[campo] }));
  };
  const tocar = (campo) => () => {
    setTocados((t) => ({ ...t, [campo]: true }));
    setErrores((er) => ({ ...er, [campo]: validar(datos)[campo] }));
  };
  const enviar = (ev) => {
    ev.preventDefault();
    const e = validar(datos);
    setErrores(e);
    setTocados({ nombre: true, correo: true, pais: true, tipo: true, mensaje: true });
    const primero = Object.keys(e)[0];
    if (primero) { document.getElementById(`club-${primero}`)?.focus(); setListo(false); return; }
    setListo(true);
  };

  const estado = (campo) => (errores[campo] ? styles.campoMal : tocados[campo] ? styles.campoBien : "");
  const aria = (campo) => ({ "aria-invalid": Boolean(errores[campo]), "aria-describedby": errores[campo] ? `club-${campo}-error` : undefined });
  const error = (campo) => errores[campo] && <span id={`club-${campo}-error`} className={styles.campoError}>{errores[campo]}</span>;

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <div className={styles.formGrid}>
        <label className={`${styles.campo} ${estado("nombre")}`}>
          <span>Nombre *</span>
          <input id="club-nombre" autoComplete="name" value={datos.nombre} onChange={cambiar("nombre")} onBlur={tocar("nombre")} {...aria("nombre")} />
          {error("nombre")}
        </label>
        <label className={`${styles.campo} ${estado("correo")}`}>
          <span>Correo electrónico *</span>
          <input id="club-correo" type="email" autoComplete="email" value={datos.correo} onChange={cambiar("correo")} onBlur={tocar("correo")} {...aria("correo")} />
          {error("correo")}
        </label>
        <label className={`${styles.campo} ${estado("pais")}`}>
          <span>País *</span>
          <select id="club-pais" autoComplete="country-name" value={datos.pais} onChange={cambiar("pais")} onBlur={tocar("pais")} {...aria("pais")}>
            {PAISES.map((p) => <option key={p}>{p}</option>)}
          </select>
          {error("pais")}
        </label>
        <label className={`${styles.campo} ${estado("tipo")}`}>
          <span>Tipo de interesado *</span>
          <select id="club-tipo" value={datos.tipo} onChange={cambiar("tipo")} onBlur={tocar("tipo")} {...aria("tipo")}>
            <option value="">Selecciona una opción</option>
            {TIPOS_INTERESADO.map((t) => <option key={t}>{t}</option>)}
          </select>
          {error("tipo")}
        </label>
        <label className={`${styles.campo} ${styles.campoAncho} ${estado("mensaje")}`}>
          <span>Mensaje *</span>
          <textarea id="club-mensaje" rows={4} value={datos.mensaje} onChange={cambiar("mensaje")} onBlur={tocar("mensaje")} {...aria("mensaje")} />
          {error("mensaje")}
        </label>
      </div>
      <p className={styles.formAviso}>
        <Icono nombre="info" size={16} />
        <span>Completar este formulario <b>no otorga membresía</b>, acceso a una oferta de valores ni derecho a invertir. Es una demostración: los datos no se envían ni se guardan.</span>
      </p>
      <button type="submit" className={styles.botonPrimario}>Solicitar información <Icono nombre="flecha" size={18} /></button>
      {listo && (
        <p className={styles.formOk} role="status">
          <Icono nombre="check" size={18} />
          <span>Datos completos. Como es una demostración, <b>no se envió ninguna solicitud</b>.</span>
        </p>
      )}
    </form>
  );
}

"use client";

import { useState } from "react";
import { crearCheckout } from "../../lib/artifactCampana";
import Icono from "../gogo/Icono";
import { Modal, pesos } from "./piezas";
import styles from "./artifact.module.css";

// Checkout de SIMULACIÓN: muestra el resumen, pide datos de contacto y
// devuelve un folio ficticio. No cobra ni guarda nada.
export default function Checkout({ paquete, onCerrar }) {
  const [paso, setPaso] = useState("resumen");
  const [cantidad, setCantidad] = useState(1);
  const [datos, setDatos] = useState({ nombre: "", correo: "" });
  const [errores, setErrores] = useState({});
  const [resultado, setResultado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const quedan = paquete.limite === null ? 10 : Math.max(1, Math.min(5, paquete.limite - paquete.apartados));
  const total = paquete.precio * cantidad;

  const confirmar = async (e) => {
    e.preventDefault();
    const er = {};
    if (datos.nombre.trim().length < 3) er.nombre = "Escribe tu nombre.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(datos.correo.trim())) er.correo = "Escribe un correo válido.";
    setErrores(er);
    if (Object.keys(er).length) { document.getElementById(`art-co-${Object.keys(er)[0]}`)?.focus(); return; }
    setEnviando(true);
    const r = await crearCheckout({ paquete, cantidad, comprador: datos });
    setEnviando(false);
    setResultado(r);
    setPaso("listo");
  };

  return (
    <Modal titulo={paso === "listo" ? "Reserva simulada" : paquete.nombre} etiqueta="Checkout de simulación · sin cobro" onCerrar={onCerrar} ancho={520}>
      {paso === "resumen" && (
        <div className={styles.checkout}>
          <p>{paquete.recompensa}</p>
          <ul>{paquete.incluye.map((x) => <li key={x}><Icono nombre="check" size={14} />{x}</li>)}</ul>
          <label className={styles.cantidad}>
            <span>Cantidad</span>
            <select value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))}>
              {Array.from({ length: quedan }, (_, k) => k + 1).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <div className={styles.total}><span>Total</span><strong>{pesos(total)} MXN</strong></div>
          {paquete.fisico && <small>Envío: se calculará antes del pago real. Entrega estimada: {paquete.entregaEstimada}.</small>}
          <button type="button" className={styles.botonLima} onClick={() => setPaso("datos")}>Continuar</button>
        </div>
      )}
      {paso === "datos" && (
        <form className={styles.checkout} onSubmit={confirmar} noValidate>
          <label className={styles.campo}>
            <span>Nombre</span>
            <input id="art-co-nombre" autoComplete="name" value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} aria-invalid={Boolean(errores.nombre)} aria-describedby={errores.nombre ? "art-co-nombre-e" : undefined} />
            {errores.nombre && <small id="art-co-nombre-e" className={styles.error}>{errores.nombre}</small>}
          </label>
          <label className={styles.campo}>
            <span>Correo</span>
            <input id="art-co-correo" type="email" autoComplete="email" value={datos.correo} onChange={(e) => setDatos({ ...datos, correo: e.target.value })} aria-invalid={Boolean(errores.correo)} aria-describedby={errores.correo ? "art-co-correo-e" : undefined} />
            {errores.correo && <small id="art-co-correo-e" className={styles.error}>{errores.correo}</small>}
          </label>
          <div className={styles.total}><span>{cantidad} × {paquete.nombre}</span><strong>{pesos(total)} MXN</strong></div>
          <p className={styles.avisoSim}><Icono nombre="info" size={16} /><span>Es una simulación: no se pide tarjeta ni se cobra dinero.</span></p>
          <div className={styles.botones}>
            <button type="button" className={styles.botonLinea} onClick={() => setPaso("resumen")}>Atrás</button>
            <button type="submit" className={styles.botonLima} disabled={enviando}>{enviando ? "Procesando…" : "Simular reserva"}</button>
          </div>
        </form>
      )}
      {paso === "listo" && resultado && (
        <div className={styles.checkout} role="status">
          <span className={styles.listoIcono}><Icono nombre="check" size={26} /></span>
          <p>Tu reserva de <b>{cantidad} × {paquete.nombre}</b> por <b>{pesos(resultado.total)} MXN</b> quedó registrada <b>sólo como simulación</b>.</p>
          <div className={styles.total}><span>Folio de simulación</span><strong>{resultado.folio}</strong></div>
          <small>No se cobró dinero ni se guardaron tus datos. Cuando se habiliten los pagos, este paso llevará al checkout seguro.</small>
          <button type="button" className={styles.botonLima} onClick={onCerrar}>Listo</button>
        </div>
      )}
    </Modal>
  );
}

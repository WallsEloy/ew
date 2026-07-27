"use client";

import { useEffect, useState } from "react";
import styles from "./CuentaAtras.module.css";

/*
 * Cuenta atrás hasta un instante concreto.
 *
 * `hasta` viaja SIEMPRE como ISO en UTC (el dashboard convierte la hora local
 * que escribe el editor), así que el momento final es el mismo para todo el
 * mundo, lo mire desde donde lo mire.
 *
 * El primer pintado no puede calcular nada: en el servidor y en el cliente
 * darían números distintos y React se quejaría de la hidratación. Por eso hasta
 * que no monta en el navegador se pintan guiones.
 */
const UNIDADES = [
  { clave: "dias", label: "días" },
  { clave: "horas", label: "horas" },
  { clave: "minutos", label: "min" },
  { clave: "segundos", label: "seg" },
];

function restante(hasta) {
  const objetivo = new Date(hasta).getTime();
  if (Number.isNaN(objetivo)) return null;

  // Al llegar (o pasar) la fecha se queda en ceros, no en negativo.
  const diff = Math.max(0, objetivo - Date.now());
  return {
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff / 3600000) % 24),
    minutos: Math.floor((diff / 60000) % 60),
    segundos: Math.floor((diff / 1000) % 60),
    terminado: diff === 0,
  };
}

export default function CuentaAtras({ hasta, etiqueta = "" }) {
  const [tiempo, setTiempo] = useState(null);

  useEffect(() => {
    if (!hasta) return undefined;

    setTiempo(restante(hasta));
    const timer = window.setInterval(() => {
      const t = restante(hasta);
      setTiempo(t);
      // Una vez en ceros no hay nada más que contar
      if (t?.terminado) window.clearInterval(timer);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [hasta]);

  if (!hasta || (tiempo && Number.isNaN(new Date(hasta).getTime()))) return null;

  return (
    <div className={styles.cuenta}>
      {etiqueta && <p className={styles.etiqueta}>{etiqueta}</p>}

      <div className={styles.unidades}>
        {UNIDADES.map(({ clave, label }) => (
          <div key={clave} className={styles.unidad}>
            <span className={styles.numero}>
              {tiempo ? String(tiempo[clave]).padStart(2, "0") : "--"}
            </span>
            <span className={styles.label}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

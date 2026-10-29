"use client";

import { useEffect, useState } from "react";
import { SIMULADOR } from "../../data/gogo";
import Dona from "./Dona";
import Icono from "./Icono";
import { Ayuda, Contador } from "./piezas";
import styles from "./gogo.module.css";

const CLAVE = "gogo-simulador";
const dinero = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: SIMULADOR.moneda, maximumFractionDigits: 0 }).format(n);
const pct = (n) => `${n.toFixed(2)}%`;
const limitar = (n, { min, max }) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));

// Un control: deslizador y campo numérico ligados al mismo valor
const miles = (n) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(n);

function Control({ id, etiqueta, ayuda, rango, valor, onCambio }) {
  const [texto, setTexto] = useState(miles(valor));
  useEffect(() => setTexto(miles(valor)), [valor]);
  const confirmar = () => {
    const limpio = Number(String(texto).replace(/\D/g, ""));
    const nuevo = limitar(limpio, rango);
    onCambio(nuevo);
    setTexto(miles(nuevo));
  };
  return (
    <div className={styles.control}>
      <div className={styles.controlCabecera}>
        <label htmlFor={`${id}-numero`}>{etiqueta}</label>
        <Ayuda texto={ayuda} />
      </div>
      <div className={styles.controlNumero}>
        <span aria-hidden="true">$</span>
        <input
          id={`${id}-numero`}
          inputMode="numeric"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onBlur={confirmar}
          onKeyDown={(e) => e.key === "Enter" && confirmar()}
          aria-describedby={`${id}-rango`}
        />
        <small>{SIMULADOR.moneda}</small>
      </div>
      <input
        type="range"
        min={rango.min}
        max={rango.max}
        step={rango.paso}
        value={valor}
        onChange={(e) => onCambio(Number(e.target.value))}
        aria-label={`${etiqueta} (deslizador)`}
        style={{ "--lleno": `${((valor - rango.min) / (rango.max - rango.min)) * 100}%` }}
      />
      <div id={`${id}-rango`} className={styles.controlRango}><span>{dinero(rango.min)}</span><span>{dinero(rango.max)}</span></div>
    </div>
  );
}

export default function Simulador() {
  const [pre, setPre] = useState(SIMULADOR.valuacionPre.inicial);
  const [aporte, setAporte] = useState(SIMULADOR.aportacion.inicial);
  const [total, setTotal] = useState(SIMULADOR.capitalTotal.inicial);
  const [listo, setListo] = useState(false);

  // Recuerda el último escenario en este navegador (sólo cifras ficticias)
  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE) || "null");
      if (guardado) {
        setPre(limitar(guardado.pre, SIMULADOR.valuacionPre));
        setAporte(limitar(guardado.aporte, SIMULADOR.aportacion));
        setTotal(limitar(guardado.total, SIMULADOR.capitalTotal));
      }
    } catch {}
    setListo(true);
  }, []);
  // Guarda sólo después de leer lo anterior, para no pisarlo con los iniciales
  useEffect(() => {
    if (!listo) return;
    try { localStorage.setItem(CLAVE, JSON.stringify({ pre, aporte, total })); } catch {}
  }, [listo, pre, aporte, total]);

  const restablecer = () => {
    setPre(SIMULADOR.valuacionPre.inicial);
    setAporte(SIMULADOR.aportacion.inicial);
    setTotal(SIMULADOR.capitalTotal.inicial);
  };

  // Escenario A: una sola emisión primaria con esta aportación
  const postA = pre + aporte;
  const partA = (aporte / postA) * 100;

  // Escenario B: varios inversionistas completan el capital total buscado.
  // El capital total nunca es menor que la aportación propia.
  const totalEf = Math.max(total, aporte);
  const postB = pre + totalEf;
  const partB = (aporte / postB) * 100;
  const otrosB = ((totalEf - aporte) / postB) * 100;
  const actualesB = (pre / postB) * 100;
  const dilucion = (totalEf / postB) * 100;

  return (
    <div className={styles.simulador}>
      <div className={styles.simControles}>
        <Control id="pre" etiqueta="Valuación previa hipotética (pre-money)" ayuda="Valor que se le asigna a la empresa ANTES de recibir capital nuevo. Aquí es un supuesto editable, no una valuación oficial." rango={SIMULADOR.valuacionPre} valor={pre} onCambio={setPre} />
        <Control id="aporte" etiqueta="Aportación del inversionista" ayuda="Monto que una persona aportaría en el escenario. Es ficticio: esta página no recibe dinero." rango={SIMULADOR.aportacion} valor={aporte} onCambio={setAporte} />
        <Control id="total" etiqueta="Capital total buscado en el escenario" ayuda="Suma de todas las aportaciones de la ronda hipotética, incluida la tuya. Sirve para calcular la dilución con varios inversionistas." rango={SIMULADOR.capitalTotal} valor={total} onCambio={setTotal} />
        {total < aporte && (
          <p className={styles.simAviso} role="status"><Icono nombre="alerta" size={16} /> El capital total no puede ser menor que la aportación; el escenario B usa {dinero(aporte)}.</p>
        )}
        <button type="button" className={styles.botonFantasma} onClick={restablecer}>Restablecer valores</button>
      </div>

      <div className={styles.simResultados}>
        <div className={styles.simEscenario}>
          <header>
            <span className={styles.chip}>Escenario A</span>
            <h3>Aportación individual aislada</h3>
            <Ayuda texto="Participación = Aportación ÷ (Valuación pre-money + Aportación) × 100. Supone que sólo entra esta aportación." />
          </header>
          <div className={styles.simCifras}>
            <div><small>Participación teórica <em>simulada</em></small><Contador valor={partA} formato={pct} className={styles.cifraGrande} /></div>
            <div><small>Valuación posterior (post-money) <em>simulada</em></small><Contador valor={postA} formato={dinero} className={styles.cifraMedia} /></div>
          </div>
          <Dona
            titulo="Distribución del escenario A"
            centro={{ valor: pct(partA), etiqueta: "Tu parte" }}
            datos={[
              { etiqueta: "Accionistas actuales", valor: 100 - partA, color: "#6366f1" },
              { etiqueta: "Tu aportación", valor: partA, color: "#10b981" },
            ]}
            formato={pct}
          />
          <p className={styles.simExplica} aria-live="polite">
            Con una valuación previa de <b>{dinero(pre)}</b>, aportar <b>{dinero(aporte)}</b> lleva la valuación posterior a <b>{dinero(postA)}</b>. Tu aportación representaría <b>{pct(partA)}</b> de la empresa en este supuesto.
          </p>
        </div>

        <div className={styles.simEscenario}>
          <header>
            <span className={`${styles.chip} ${styles.chipAzul}`}>Escenario B</span>
            <h3>Varios inversionistas</h3>
            <Ayuda texto="Participación = Aportación ÷ (Valuación pre-money + Capital total captado) × 100. Todas las aportaciones entran a la misma valuación previa." />
          </header>
          <div className={styles.simCifras}>
            <div><small>Tu participación diluida <em>simulada</em></small><Contador valor={partB} formato={pct} className={styles.cifraGrande} /></div>
            <div><small>Valuación posterior de la ronda <em>simulada</em></small><Contador valor={postB} formato={dinero} className={styles.cifraMedia} /></div>
          </div>
          <Dona
            titulo="Distribución del escenario B"
            centro={{ valor: pct(partB), etiqueta: "Tu parte" }}
            datos={[
              { etiqueta: "Accionistas actuales", valor: actualesB, color: "#6366f1" },
              { etiqueta: "Otros inversionistas", valor: otrosB, color: "#f43f5e" },
              { etiqueta: "Tu aportación", valor: partB, color: "#10b981" },
            ]}
            formato={pct}
          />
          <p className={styles.simExplica} aria-live="polite">
            Si la ronda capta <b>{dinero(totalEf)}</b> en total, los accionistas actuales pasan a tener <b>{pct(actualesB)}</b> (una dilución de <b>{pct(dilucion)}</b>). Tu misma aportación equivaldría a <b>{pct(partB)}</b>{partA - partB > 0.005 ? <>, <b>{(partA - partB).toFixed(2)} puntos menos</b> que en el escenario A, porque el resto del capital también entra a la empresa</> : ""}.
          </p>
        </div>
      </div>

      <p className={styles.notaLegal}>
        <Icono nombre="info" size={16} /> Simulación matemática con valores ficticios. No representa una valuación oficial, una oferta, retornos ni dividendos. Una ronda real puede incluir otros términos (opciones, preferencias, notas convertibles) que cambian el resultado.
      </p>
    </div>
  );
}

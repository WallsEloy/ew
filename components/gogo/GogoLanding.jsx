"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  GOGO, RESUMEN, PROBLEMAS, SOLUCIONES, ECOSISTEMA, RECORRIDO_PEDIDO, INGRESOS,
  CIUDADES, PASOS_EXPANSION, USO_CAPITAL, ROADMAP, DOCUMENTOS, AVISO_LEGAL,
} from "../../data/gogo";
import Icono from "./Icono";
import Dona from "./Dona";
import Simulador from "./Simulador";
import Formulario from "./Formulario";
import { Ayuda, useRevelar } from "./piezas";
import styles from "./gogo.module.css";

const SECCIONES = [
  { id: "resumen", texto: "Resumen" },
  { id: "oportunidad", texto: "Oportunidad" },
  { id: "ecosistema", texto: "Ecosistema" },
  { id: "modelo", texto: "Modelo" },
  { id: "expansion", texto: "Expansión" },
  { id: "simulador", texto: "Simulador" },
  { id: "capital", texto: "Capital" },
  { id: "roadmap", texto: "Roadmap" },
  { id: "documentos", texto: "Documentos" },
  { id: "contacto", texto: "Contacto" },
];

const ir = (id) => {
  const destino = document.getElementById(id);
  if (!destino) return;
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  destino.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
};

// Logo temporal: una "G" en movimiento y el nombre
function Logo({ grande = false }) {
  return (
    <span className={`${styles.logo} ${grande ? styles.logoGrande : ""}`}>
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" className={styles.logoFondo} />
        <path d="M22.5 11.2A8 8 0 1 0 24 16h-7.5" fill="none" className={styles.logoTrazo} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M5 23h4M3 19h4" className={styles.logoTrazo} strokeWidth="2" strokeLinecap="round" opacity=".6" />
      </svg>
      <span>GoGo<b>Food</b></span>
    </span>
  );
}

// Encabezado de cada sección
function Titulo({ numero, eyebrow, titulo, texto }) {
  return (
    <header className={styles.titulo} data-revelar>
      <span className={styles.eyebrow}><b>{numero}</b>{eyebrow}</span>
      <h2>{titulo}</h2>
      {texto && <p>{texto}</p>}
    </header>
  );
}

// Mockup de la app de pedidos (interfaz ficticia)
function Mockup() {
  return (
    <div className={styles.mockup} aria-label="Ejemplo ilustrativo de la app de pedidos de GoGo Food" role="img">
      <div className={styles.telefono}>
        <div className={styles.telefonoIsla} />
        <div className={styles.app}>
          <div className={styles.appCabecera}>
            <small>Entregar en</small>
            <strong>Centro, Acámbaro <span>▾</span></strong>
          </div>
          <div className={styles.appBuscar}><Icono nombre="buscar" size={14} /> ¿Qué se te antoja hoy?</div>
          <div className={styles.appCategorias}>
            {["🌮 Tacos", "🍕 Pizza", "☕ Café", "🍰 Postres"].map((c, i) => <span key={c} className={i === 0 ? styles.appCatActiva : ""}>{c}</span>)}
          </div>
          <small className={styles.appSub}>Cerca de ti</small>
          {[
            { n: "Taquería La Esquina", t: "15–25 min", c: "#f97316", e: "🌮" },
            { n: "Pizzería Don Nico", t: "25–35 min", c: "#ef4444", e: "🍕" },
            { n: "Café del Portal", t: "10–20 min", c: "#a16207", e: "☕" },
          ].map((r) => (
            <div key={r.n} className={styles.appRestaurante}>
              <span style={{ background: r.c }}>{r.e}</span>
              <div><strong>{r.n}</strong><small><Icono nombre="estrella" size={10} /> Nuevo · {r.t}</small></div>
            </div>
          ))}
        </div>
      </div>
      <div className={`${styles.flotante} ${styles.flotanteSeguimiento}`}>
        <div className={styles.flotanteFila}><Icono nombre="moto" size={16} /><strong>Tu pedido va en camino</strong></div>
        <div className={styles.progreso}><i /></div>
        <div className={styles.pasosEntrega}><span>Aceptado</span><span>Preparando</span><span className={styles.pasoActivo}>En ruta</span></div>
      </div>
      <div className={`${styles.flotante} ${styles.flotantePedido}`}>
        <Icono nombre="check" size={14} /><span>Pedido aceptado por el restaurante</span>
      </div>
    </div>
  );
}

// Diagrama del ecosistema con el recorrido de un pedido
function Ecosistema() {
  const [paso, setPaso] = useState(0);
  const [pausa, setPausa] = useState(false);
  useEffect(() => {
    if (pausa || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const t = setInterval(() => setPaso((p) => (p + 1) % RECORRIDO_PEDIDO.length), 2400);
    return () => clearInterval(t);
  }, [pausa]);
  const activo = RECORRIDO_PEDIDO[paso].de;
  const posiciones = { consumidor: styles.nodoArribaIzq, restaurante: styles.nodoArribaDer, repartidor: styles.nodoAbajoDer, admin: styles.nodoAbajoIzq };

  return (
    <div className={styles.eco} data-revelar>
      <div className={styles.ecoDiagrama}>
        <svg className={styles.ecoLineas} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {[[18, 18], [82, 18], [82, 82], [18, 82]].map(([x, y]) => <line key={`${x}${y}`} x1="50" y1="50" x2={x} y2={y} />)}
          <rect x="18" y="18" width="64" height="64" rx="4" className={styles.ecoAnillo} />
        </svg>
        <div className={styles.ecoCentro}><Logo /><small>Plataforma</small></div>
        {ECOSISTEMA.map((n) => (
          <div key={n.id} className={`${styles.ecoNodo} ${posiciones[n.id]} ${activo === n.id ? styles.ecoNodoActivo : ""}`}>
            <span><Icono nombre={n.icono} size={20} /></span>
            <strong>{n.titulo}</strong>
          </div>
        ))}
      </div>
      <div className={styles.ecoLista}>
        <ol>
          {RECORRIDO_PEDIDO.map((p, i) => (
            <li key={p.texto}>
              <button type="button" className={i === paso ? styles.ecoPasoActivo : ""} onClick={() => { setPaso(i); setPausa(true); }} aria-current={i === paso ? "step" : undefined}>
                <b>{String(i + 1).padStart(2, "0")}</b>{p.texto}
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className={styles.botonFantasma} onClick={() => setPausa((v) => !v)}>
          {pausa ? "▶ Reproducir recorrido" : "❚❚ Pausar recorrido"}
        </button>
        <div className={styles.ecoDescripciones}>
          {ECOSISTEMA.map((n) => (
            <p key={n.id}><strong>{n.titulo}.</strong> {n.texto}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mapa estilizado de la red de ciudades
function Mapa() {
  const piloto = CIUDADES.find((c) => c.estado === "piloto") || CIUDADES[0];
  const operativas = CIUDADES.filter((c) => c.estado === "operativa").length;
  return (
    <div className={styles.mapa} data-revelar>
      <svg viewBox="0 0 100 100" role="img" aria-label={`Mapa ilustrativo: ${CIUDADES.map((c) => `${c.nombre} (${c.estado})`).join(", ")}`}>
        <defs>
          <pattern id="gogo-rejilla" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" className={styles.mapaRejilla} strokeWidth=".3" /></pattern>
          <radialGradient id="gogo-halo"><stop offset="0" stopColor="#38bdf8" stopOpacity=".3" /><stop offset="1" stopColor="#38bdf8" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#gogo-rejilla)" />
        <circle cx={piloto.x} cy={piloto.y} r="22" fill="url(#gogo-halo)" />
        {CIUDADES.filter((c) => c !== piloto).map((c) => (
          <line key={c.nombre} x1={piloto.x} y1={piloto.y} x2={c.x} y2={c.y} className={c.estado === "operativa" ? styles.rutaOperativa : styles.rutaPotencial} />
        ))}
        {CIUDADES.map((c) => (
          <g key={c.nombre} className={styles[`ciudad_${c.estado}`]}>
            {c.estado === "piloto" && <circle cx={c.x} cy={c.y} r="3" className={styles.pulso} />}
            <circle cx={c.x} cy={c.y} r={c.estado === "piloto" ? 2.4 : 1.6} />
            <text x={c.x} y={c.y - 4}>{c.nombre}</text>
          </g>
        ))}
      </svg>
      <ul className={styles.mapaLeyenda}>
        <li><i className={styles.leyOperativa} />Operativa <small>({operativas} por ahora)</small></li>
        <li><i className={styles.leyPiloto} />Ciudad piloto · en preparación</li>
        <li><i className={styles.leyPotencial} />Localidad potencial · ilustrativa</li>
      </ul>
    </div>
  );
}

// Ventana de documento pendiente (accesible: foco, Escape y regreso del foco)
function ModalDocumento({ documento, onCerrar }) {
  const cerrarRef = useRef(null);
  useEffect(() => {
    const anterior = document.activeElement;
    cerrarRef.current?.focus();
    const tecla = (e) => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "Tab") {
        const focos = [...document.querySelectorAll("[data-gogo-modal] button")];
        const i = focos.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); focos[focos.length - 1].focus(); }
        else if (!e.shiftKey && i === focos.length - 1) { e.preventDefault(); focos[0].focus(); }
      }
    };
    document.addEventListener("keydown", tecla);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, [onCerrar]);

  return createPortal(
    <div className={styles.modalFondo} onClick={onCerrar}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="gogo-modal-titulo" data-gogo-modal onClick={(e) => e.stopPropagation()}>
        <button ref={cerrarRef} type="button" className={styles.modalCerrar} onClick={onCerrar} aria-label="Cerrar"><Icono nombre="x" size={18} /></button>
        <span className={styles.modalIcono}><Icono nombre="candado" size={22} /></span>
        <h3 id="gogo-modal-titulo">Documento pendiente de publicación</h3>
        <p><strong>{documento}</strong> todavía no está disponible. Se compartirá sólo con participantes autorizados, una vez definidas la estructura jurídica y la documentación del proyecto.</p>
        <button type="button" className={styles.botonPrimario} onClick={onCerrar}>Entendido</button>
      </div>
    </div>,
    document.body,
  );
}

export default function GogoLanding({ fuente = "" }) {
  const raiz = useRef(null);
  const [conScroll, setConScroll] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState("");
  const [documento, setDocumento] = useState(null);
  const cerrarDocumento = useCallback(() => setDocumento(null), []);
  useRevelar(raiz);

  // Encabezado con efecto al bajar y sección activa en la navegación
  useEffect(() => {
    const alBajar = () => setConScroll(window.scrollY > 120);
    alBajar();
    window.addEventListener("scroll", alBajar, { passive: true });
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => e.isIntersecting && setSeccionActiva(e.target.id));
    }, { rootMargin: "-45% 0px -50% 0px" });
    SECCIONES.forEach((s) => { const el = document.getElementById(s.id); if (el) observador.observe(el); });
    return () => { window.removeEventListener("scroll", alBajar); observador.disconnect(); };
  }, []);

  const navegar = (id) => { setMenuAbierto(false); ir(id); };

  return (
    <div ref={raiz} className={`${styles.landing} ${fuente}`}>
      {/* Escritorio: la barra del sitio es transparente; esta franja negra
          evita que el naranja se vea detrás de sus enlaces al bajar */}
      <div className={styles.fondoBarraSitio} aria-hidden="true" />
      {/* Navegación de la landing (debajo de la barra del sitio) */}
      <div className={`${styles.barra} ${conScroll ? styles.barraScroll : ""}`}>
        <button type="button" className={styles.barraLogo} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Ir al inicio de GoGo Food"><Logo /></button>
        <nav aria-label="Secciones de GoGo Food" className={`${styles.barraNav} ${menuAbierto ? styles.barraNavAbierta : ""}`} id="gogo-menu">
          {SECCIONES.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={seccionActiva === s.id ? styles.navActiva : ""} aria-current={seccionActiva === s.id ? "true" : undefined} onClick={(e) => { e.preventDefault(); navegar(s.id); }}>{s.texto}</a>
          ))}
        </nav>
        <button type="button" className={styles.barraCta} onClick={() => navegar("contacto")}>Solicitar información</button>
        <button type="button" className={styles.barraMenu} aria-expanded={menuAbierto} aria-controls="gogo-menu" aria-label={menuAbierto ? "Cerrar secciones" : "Abrir secciones"} onClick={() => setMenuAbierto((v) => !v)}>
          <Icono nombre={menuAbierto ? "x" : "menu"} size={20} />
        </button>
      </div>

      {/* 01 — Hero */}
      <section className={styles.hero} aria-labelledby="gogo-titulo">
        <div className={styles.heroLuz} aria-hidden="true" />
        <div className={styles.heroTexto}>
          <div className={styles.heroEtiquetas} data-revelar>
            <span className={styles.chip}>{GOGO.etiqueta}</span>
            <span className={styles.estado}><i />Estado: {GOGO.estado}</span>
          </div>
          <h1 id="gogo-titulo" data-revelar>{GOGO.titulo}</h1>
          <p data-revelar>{GOGO.descripcion}</p>
          <div className={styles.heroBotones} data-revelar>
            <button type="button" className={styles.botonPrimario} onClick={() => ir("resumen")}>Explorar proyecto <Icono nombre="flecha" size={18} /></button>
            <button type="button" className={styles.botonSecundario} onClick={() => ir("modelo")}>Conocer el modelo de negocio</button>
          </div>
          <p className={styles.heroNota} data-revelar><Icono nombre="escudo" size={14} /> Presentación informativa. No es una oferta pública de valores.</p>
        </div>
        <div data-revelar className={styles.heroMockup}><Mockup /></div>
      </section>

      {/* 02 — Resumen ejecutivo */}
      <section id="resumen" className={styles.seccion}>
        <Titulo numero="02" eyebrow="Resumen ejecutivo" titulo="Un vistazo al proyecto" texto="Lo esencial de GoGo Food en seis puntos." />
        <div className={styles.gridTres}>
          {RESUMEN.map((r) => (
            <article key={r.titulo} className={styles.tarjeta} data-revelar>
              <span className={styles.icono}><Icono nombre={r.icono} /></span>
              <small>{r.titulo}</small>
              <strong>{r.dato}</strong>
              <p>{r.texto}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 03 — Problema y oportunidad */}
      <section id="oportunidad" className={styles.seccion}>
        <Titulo numero="03" eyebrow="Problema y oportunidad" titulo="Ciudades con demanda, sin infraestructura digital" texto="Muchos negocios locales venden por teléfono o redes sociales y coordinan sus entregas a mano. Las plataformas nacionales no siempre llegan a sus ciudades." />
        <div className={styles.dosColumnas}>
          <article className={`${styles.tarjeta} ${styles.tarjetaProblema}`} data-revelar>
            <div className={styles.columnaCabecera}><span className={styles.iconoRojo}><Icono nombre="alerta" /></span><h3>El problema</h3></div>
            {/* Diagrama: pedidos dispersos por canales informales */}
            <svg className={styles.diagrama} viewBox="0 0 220 70" aria-hidden="true">
              {[[30, 18], [70, 52], [112, 14], [150, 48], [190, 22]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="9" /><line x1={x} y1={y} x2={110} y2={36} /></g>)}
              <text x="110" y="66">pedidos sin un sistema común</text>
            </svg>
            <ul className={styles.listaX}>{PROBLEMAS.map((p) => <li key={p}><Icono nombre="x" size={16} />{p}</li>)}</ul>
          </article>
          <article className={`${styles.tarjeta} ${styles.tarjetaSolucion}`} data-revelar>
            <div className={styles.columnaCabecera}><span className={styles.icono}><Icono nombre="check" /></span><h3>La solución GoGo</h3></div>
            {/* Diagrama: todo conectado a una plataforma central */}
            <svg className={styles.diagrama} viewBox="0 0 220 70" aria-hidden="true">
              {[[30, 18], [30, 52], [190, 18], [190, 52]].map(([x, y], i) => <g key={i}><line x1={x} y1={y} x2={110} y2={35} /><circle cx={x} cy={y} r="8" /></g>)}
              <rect x="84" y="20" width="52" height="30" rx="8" />
              <text x="110" y="66">un sistema centralizado</text>
            </svg>
            <ul className={styles.listaCheck}>{SOLUCIONES.map((s) => <li key={s}><Icono nombre="check" size={16} />{s}</li>)}</ul>
          </article>
        </div>
      </section>

      {/* 04 — Ecosistema */}
      <section id="ecosistema" className={styles.seccion}>
        <Titulo numero="04" eyebrow="Ecosistema GoGo" titulo="Cuatro partes, un mismo pedido" texto="Cada pedido conecta a consumidores, restaurantes, repartidores y la administración de la plataforma. Así es su recorrido." />
        <Ecosistema />
      </section>

      {/* 05 — Modelo de negocio */}
      <section id="modelo" className={styles.seccion}>
        <Titulo numero="05" eyebrow="Modelo de negocio" titulo="Varias fuentes de ingreso sobre una misma operación" />
        <div className={styles.modelo}>
          <div className={styles.gridIngresos}>
            {INGRESOS.map((f, i) => (
              <article key={f.titulo} className={styles.tarjeta} data-revelar>
                <span className={styles.icono}><Icono nombre={f.icono} /></span>
                <small>Fuente {String(i + 1).padStart(2, "0")}</small>
                <strong>{f.titulo}</strong>
                <p>{f.texto}</p>
              </article>
            ))}
          </div>
          <div className={`${styles.tarjeta} ${styles.panelGrafica}`} data-revelar>
            <div className={styles.panelCabecera}>
              <h3>Distribución del ingreso</h3>
              <span className={styles.chipAviso}>Escenario ilustrativo</span>
              <Ayuda texto="Reparto demostrativo para explicar el modelo. Los porcentajes se cambian en data/gogo.js (INGRESOS) y no son resultados de la empresa." />
            </div>
            <Dona titulo="Distribución ilustrativa del ingreso" centro={{ valor: `${INGRESOS.length}`, etiqueta: "fuentes" }} datos={INGRESOS.map((f) => ({ etiqueta: f.titulo, valor: f.porcentaje, color: f.color }))} />
            <p className={styles.notaLegal}><Icono nombre="info" size={16} /> Datos ilustrativos, no resultados financieros de GoGo Food.</p>
          </div>
        </div>
        <div className={styles.socios} data-revelar>
          <article className={styles.tarjeta}>
            <span className={styles.icono}><Icono nombre="pin" /></span>
            <strong>Socio operador por ciudad</strong>
            <p>Establece y mantiene la operación local, incorpora restaurantes y desarrolla el mercado.</p>
            <small className={styles.pendiente}>Participación económica: pendiente de definición contractual</small>
          </article>
          <article className={styles.tarjeta}>
            <span className={styles.icono}><Icono nombre="red" /></span>
            <strong>Socio de expansión</strong>
            <p>Identifica nuevas localidades y recluta a sus operadores.</p>
            <small className={styles.pendiente}>Participación económica: pendiente de definición contractual</small>
          </article>
        </div>
      </section>

      {/* 06 — Expansión territorial */}
      <section id="expansion" className={styles.seccion}>
        <Titulo numero="06" eyebrow="Expansión territorial" titulo="De una ciudad piloto a una red de localidades" texto={`El modelo empieza en ${CIUDADES.find((c) => c.estado === "piloto")?.nombre || "la ciudad piloto"} y se replica con socios operadores en cada localidad.`} />
        <div className={styles.expansion}>
          <Mapa />
          <ol className={styles.pasosExpansion}>
            {PASOS_EXPANSION.map((p, i) => (
              <li key={p.titulo} data-revelar>
                <span className={styles.icono}><Icono nombre={p.icono} size={18} /></span>
                <div><small>Paso {i + 1}</small><strong>{p.titulo}</strong><p>{p.texto}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 07 — Simulador */}
      <section id="simulador" className={styles.seccion}>
        <Titulo numero="07" eyebrow="Simulador financiero" titulo="Cómo se calcula una participación" texto="Mueve los valores para ver cómo cambian la participación y la dilución. Todas las cifras son ficticias y editables." />
        <div data-revelar><Simulador /></div>
      </section>

      {/* 08 — Uso del capital */}
      <section id="capital" className={styles.seccion}>
        <Titulo numero="08" eyebrow="Uso potencial del capital" titulo="A dónde iría el capital" />
        <div className={styles.capital}>
          <div className={`${styles.tarjeta} ${styles.panelGrafica}`} data-revelar>
            <Dona titulo="Uso potencial del capital" centro={{ valor: "100%", etiqueta: "del capital" }} datos={USO_CAPITAL.map((u) => ({ etiqueta: u.rubro, valor: u.porcentaje, color: u.color }))} />
          </div>
          <div className={styles.capitalBarras} data-revelar>
            {USO_CAPITAL.map((u) => (
              <div key={u.rubro} className={styles.barraFila}>
                <div><span>{u.rubro}</span><b>{u.porcentaje}%</b></div>
                <div className={styles.barraPista}><i style={{ width: `${u.porcentaje}%`, background: u.color }} /></div>
              </div>
            ))}
            <p className={styles.notaLegal}><Icono nombre="info" size={16} /> Rubros ilustrativos. El destino real del capital dependerá de un plan financiero aprobado.</p>
          </div>
        </div>
      </section>

      {/* 09 — Roadmap */}
      <section id="roadmap" className={styles.seccion}>
        <Titulo numero="09" eyebrow="Roadmap" titulo="Las fases del proyecto" texto="Sin fechas comprometidas: cada fase empieza cuando la anterior se valida." />
        <ol className={styles.roadmap}>
          {ROADMAP.map((f, i) => (
            <li key={f.titulo} className={f.estado === "en-curso" ? styles.faseEnCurso : ""} data-revelar>
              <span className={styles.faseNumero}>{i + 1}</span>
              <div>
                <span className={styles.faseEstado}>{f.estado === "en-curso" ? "En curso" : "Pendiente"}</span>
                <strong>{f.titulo}</strong>
                <p>{f.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 10 — Documentos */}
      <section id="documentos" className={styles.seccion}>
        <Titulo numero="10" eyebrow="Información para inversionistas" titulo="Documentos para participantes autorizados" texto="Se publicarán cuando el proyecto defina su estructura jurídica y su documentación." />
        <div className={styles.gridTres}>
          {DOCUMENTOS.map((d) => (
            <button key={d.titulo} type="button" className={`${styles.tarjeta} ${styles.documento}`} onClick={() => setDocumento(d.titulo)} data-revelar>
              <span className={styles.icono}><Icono nombre={d.icono} /></span>
              <strong>{d.titulo}</strong>
              <small><Icono nombre="candado" size={12} /> Pendiente de publicación</small>
            </button>
          ))}
        </div>
      </section>

      {/* 11 — Solicitar información */}
      <section id="contacto" className={styles.seccion}>
        <Titulo numero="11" eyebrow="Solicitar información" titulo="¿Te interesa GoGo Food?" texto="Déjanos tus datos y el tipo de interés. Cuando el formulario esté conectado, el equipo te contactará." />
        <div data-revelar><Formulario /></div>
      </section>

      {/* 12 — Footer */}
      {/* Aviso legal y de riesgos. El footer es el del sitio (layout). */}
      <section className={styles.pie} aria-label="Aviso legal y de riesgos">
        <div className={styles.pieAviso}>
          <Icono nombre="alerta" size={18} />
          <p><strong>Aviso legal y de riesgos.</strong> {AVISO_LEGAL} Invertir en empresas privadas en etapa temprana implica riesgos altos, incluida la pérdida total del capital, y baja liquidez.</p>
        </div>
        <div className={styles.pieFinal}>
          <span>{GOGO.nombre} · Demostración · Contacto: {GOGO.contacto.correo} ({GOGO.contacto.nota})</span>
          <Link href="/grow/proyectos">← Volver a Grow · Proyectos</Link>
        </div>
      </section>

      {documento && <ModalDocumento documento={documento} onCerrar={cerrarDocumento} />}
    </div>
  );
}

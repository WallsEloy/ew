"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  CLUB, ESTADISTICAS, PROYECTOS, MESES, PASOS, MODELOS, PARTICIPACIONES, EVOLUCION,
  DIVIDENDOS, DOCUMENTOS, TRANSMISIONES, PILARES, PREGUNTAS,
} from "../../data/club";
import Icono from "../gogo/Icono";
import { Contador, useRevelar } from "../gogo/piezas";
import { Linea, Mini, Dona, pesos, pesosCorto } from "./Graficas";
import FormularioClub from "./FormularioClub";
import styles from "./club.module.css";

const SECCIONES = [
  { id: "inicio", texto: "Inicio" },
  { id: "proyectos", texto: "Proyectos" },
  { id: "como-funciona", texto: "Cómo funciona" },
  { id: "modelos", texto: "Modelos de inversión" },
  { id: "nosotros", texto: "Nosotros" },
];

const PROYECTO = Object.fromEntries(PROYECTOS.map((p) => [p.id, p]));
const ultimo = (serie) => serie[serie.length - 1];
const cambio = (serie, desde = 0) => ((ultimo(serie) - serie[desde]) / serie[desde]) * 100;
const porcentaje = (n, d = 1) => `${n >= 0 ? "+" : ""}${n.toFixed(d)}%`;

const ir = (id) => {
  const destino = document.getElementById(id);
  if (!destino) return;
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  destino.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
};

// Logo provisional: tres barras ascendentes dentro de un círculo
function Logo() {
  return (
    <span className={styles.logo}>
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="10" fill="#10b981" />
        <path d="M9 21v-3M14 21v-7M19 21v-5M24 21V10" stroke="#04140d" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span>{CLUB.nombre}</span>
    </span>
  );
}

function Titulo({ eyebrow, titulo, texto, centrado }) {
  return (
    <header className={`${styles.titulo} ${centrado ? styles.tituloCentrado : ""}`} data-revelar>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h2>{titulo}</h2>
      {texto && <p>{texto}</p>}
    </header>
  );
}

function Ficticio({ texto = "Datos ficticios" }) {
  return <span className={styles.ficticio}><Icono nombre="info" size={12} />{texto}</span>;
}

// Ventana modal genérica (foco, Escape, regreso del foco)
function Modal({ titulo, icono = "candado", children, onCerrar }) {
  const cerrar = useRef(null);
  useEffect(() => {
    const anterior = document.activeElement;
    cerrar.current?.focus();
    const tecla = (e) => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "Tab") {
        const focos = [...document.querySelectorAll("[data-club-modal] button, [data-club-modal] a")];
        const k = focos.indexOf(document.activeElement);
        if (e.shiftKey && k <= 0) { e.preventDefault(); focos[focos.length - 1].focus(); }
        else if (!e.shiftKey && k === focos.length - 1) { e.preventDefault(); focos[0].focus(); }
      }
    };
    document.addEventListener("keydown", tecla);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", tecla); document.body.style.overflow = overflow; anterior?.focus?.(); };
  }, [onCerrar]);
  return createPortal(
    <div className={styles.modalFondo} onClick={onCerrar}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="club-modal-titulo" data-club-modal onClick={(e) => e.stopPropagation()}>
        <button ref={cerrar} type="button" className={styles.modalCerrar} onClick={onCerrar} aria-label="Cerrar"><Icono nombre="x" size={18} /></button>
        <span className={styles.modalIcono}><Icono nombre={icono} size={22} /></span>
        <h3 id="club-modal-titulo">{titulo}</h3>
        {children}
      </div>
    </div>,
    document.body,
  );
}

// Dashboard flotante del hero
function DashboardHero() {
  const total = PROYECTOS.reduce((s, p) => s + ultimo(p.serie), 0);
  const serieTotal = MESES.map((_, k) => PROYECTOS.reduce((s, p) => s + p.serie[k], 0));
  const g = PROYECTO.gogo;
  return (
    <div className={styles.dash} aria-label="Ejemplo de panel con datos ficticios" role="group">
      <div className={`${styles.dashTarjeta} ${styles.dashPrincipal}`}>
        <div className={styles.dashCabecera}>
          <div><small>Valuación conjunta de los proyectos</small><strong>{pesosCorto(total)}</strong></div>
          <span className={styles.positivo}><Icono nombre="subida" size={14} />{porcentaje(cambio(serieTotal))}</span>
        </div>
        <Linea etiquetas={MESES} valores={serieTotal} formato={pesosCorto} alto={150} titulo="Valuación conjunta ficticia" />
        <Ficticio texto="Simulación con datos ficticios" />
      </div>
      <div className={`${styles.dashTarjeta} ${styles.dashValuacion}`}>
        <small>Valuación estimada · {g.nombre}</small>
        <strong>{pesosCorto(ultimo(g.serie))}</strong>
        <div className={styles.indicadores}>
          <span className={styles.positivo}>{porcentaje(cambio(g.serie, 9))} <em>3M</em></span>
          <span className={styles.positivo}>{porcentaje(cambio(g.serie))} <em>12M</em></span>
        </div>
      </div>
      <div className={`${styles.dashTarjeta} ${styles.dashParticipaciones}`}>
        <small>Distribución de participaciones</small>
        <Dona titulo="Distribución ilustrativa de participaciones" centro={{ valor: "100%", etiqueta: "acciones" }}
          datos={[{ etiqueta: "Fundadores", valor: 70, color: "#10b981" }, { etiqueta: "Club", valor: 20, color: "#38bdf8" }, { etiqueta: "Reserva", valor: 10, color: "#64748b" }]} />
      </div>
      <div className={`${styles.dashTarjeta} ${styles.dashMiniaturas}`}>
        {PROYECTOS.map((p) => (
          <div key={p.id} className={styles.miniatura}>
            <span className={styles.avatar} style={{ background: p.color }}>{p.iniciales}</span>
            <div><strong>{p.nombre}</strong><small>{pesosCorto(ultimo(p.serie))}</small></div>
            <Mini valores={p.serie} color={p.color} alto={26} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard de inversionistas (demostración)
function DashboardInversionista({ onDocumento }) {
  const [vista, setVista] = useState("mensual");
  const filas = PARTICIPACIONES.map((pa) => {
    const p = PROYECTO[pa.proyecto];
    const propiedad = pa.acciones / p.accionesTotales;
    return { ...pa, p, propiedad, valor: propiedad * ultimo(p.serie), inicial: propiedad * p.serie[0] };
  });
  const total = filas.reduce((s, f) => s + f.valor, 0);
  const totalInicial = filas.reduce((s, f) => s + f.inicial, 0);
  const datos = EVOLUCION[vista];
  const dividendos = DIVIDENDOS.reduce((s, d) => s + d.monto, 0);

  return (
    <div className={styles.panel} data-revelar>
      <div className={styles.panelBarra}>
        <div className={styles.panelUsuario}><span className={styles.avatar} style={{ background: "#334155" }}>IN</span><div><strong>Inversionista de ejemplo</strong><small>Miembro del club · cuenta de demostración</small></div></div>
        <Ficticio texto="Demostración visual: no es un sistema real" />
      </div>

      <div className={styles.resumen}>
        <div><small>Valuación estimada del portafolio</small><Contador valor={total} formato={(n) => pesos(n)} className={styles.cifra} /></div>
        <div><small>Variación en 12 meses</small><strong className={styles.positivo}>{porcentaje(((total - totalInicial) / totalInicial) * 100)}</strong></div>
        <div><small>Empresas</small><strong>{filas.length}</strong></div>
        <div><small>Dividendos registrados</small><strong>{pesos(dividendos)}</strong></div>
      </div>

      <div className={styles.panelGrid}>
        <section className={`${styles.bloque} ${styles.bloqueEvolucion}`} aria-labelledby="club-evolucion">
          <div className={styles.bloqueCabecera}>
            <h3 id="club-evolucion">Evolución histórica</h3>
            <div className={styles.segmentos} role="group" aria-label="Periodo">
              {[["mensual", "Mensual"], ["trimestral", "Trimestral"], ["anual", "Anual"]].map(([clave, texto]) => (
                <button key={clave} type="button" aria-pressed={vista === clave} className={vista === clave ? styles.segmentoActivo : ""} onClick={() => setVista(clave)}>{texto}</button>
              ))}
            </div>
          </div>
          <Linea etiquetas={datos.etiquetas} valores={datos.valores} titulo={`Evolución ${vista} del portafolio ficticio`} alto={200} />
        </section>

        <section className={styles.bloque} aria-labelledby="club-distribucion">
          <div className={styles.bloqueCabecera}><h3 id="club-distribucion">Distribución del portafolio</h3></div>
          <Dona titulo="Distribución del portafolio ficticio" centro={{ valor: pesosCorto(total), etiqueta: "total" }}
            datos={filas.map((f) => ({ etiqueta: f.p.nombre, valor: f.valor, color: f.p.color }))} formato={(v) => `${v.toFixed(1)}%`} />
        </section>

        <section className={`${styles.bloque} ${styles.bloqueAncho}`} aria-labelledby="club-participaciones">
          <div className={styles.bloqueCabecera}><h3 id="club-participaciones">Mis participaciones</h3></div>
          <div className={styles.tablaScroll}>
            <table className={styles.tabla}>
              <thead><tr><th scope="col">Empresa</th><th scope="col">Acciones</th><th scope="col">Propiedad</th><th scope="col">Valuación estimada</th><th scope="col">12 meses</th></tr></thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.proyecto}>
                    <th scope="row"><span className={styles.avatarChico} style={{ background: f.p.color }}>{f.p.iniciales}</span>{f.p.nombre}</th>
                    <td>{f.acciones.toLocaleString("es-MX")}</td>
                    <td>{(f.propiedad * 100).toFixed(2)}%</td>
                    <td>{pesos(f.valor)}</td>
                    <td><span className={styles.positivo}>{porcentaje(cambio(f.p.serie))}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.bloque} aria-labelledby="club-dividendos">
          <div className={styles.bloqueCabecera}><h3 id="club-dividendos">Dividendos registrados</h3></div>
          <ul className={styles.lista}>
            {DIVIDENDOS.map((d) => (
              <li key={d.fecha + d.proyecto}><span><b>{PROYECTO[d.proyecto].nombre}</b><small>Decretado por asamblea · {d.fecha}</small></span><strong>{pesos(d.monto)}</strong></li>
            ))}
          </ul>
          <p className={styles.nota}>Ejemplo ficticio. Un dividendo pasado no implica dividendos futuros.</p>
        </section>

        <section className={styles.bloque} aria-labelledby="club-documentos">
          <div className={styles.bloqueCabecera}><h3 id="club-documentos">Documentación legal</h3></div>
          <ul className={styles.lista}>
            {DOCUMENTOS.map((d) => (
              <li key={d.titulo}>
                <button type="button" className={styles.documento} onClick={() => onDocumento(d.titulo)}>
                  <Icono nombre="documento" size={16} /><span><b>{d.titulo}</b><small>{PROYECTO[d.proyecto].nombre}</small></span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.bloque} aria-labelledby="club-transmisiones">
          <div className={styles.bloqueCabecera}><h3 id="club-transmisiones">Solicitudes de transmisión</h3></div>
          <ul className={styles.lista}>
            {TRANSMISIONES.map((t) => (
              <li key={t.folio}>
                <span><b>{t.folio} · {PROYECTO[t.proyecto].nombre}</b><small>{t.acciones.toLocaleString("es-MX")} acciones</small></span>
                <span className={`${styles.estado} ${t.estado === "Cerrada" ? styles.estadoCerrado : t.estado === "En revisión" ? styles.estadoRevision : styles.estadoPendiente}`}>{t.estado}</span>
              </li>
            ))}
          </ul>
          <p className={styles.nota}>Trámites administrativos sujetos a los estatutos y acuerdos de cada empresa.</p>
        </section>
      </div>
    </div>
  );
}

// Selector de proyectos con su gráfica de evolución
function Comparador({ elegido, onElegir }) {
  const p = PROYECTO[elegido];
  return (
    <div className={styles.comparador} data-revelar id="evolucion-proyectos">
      <div className={styles.bloqueCabecera}>
        <h3>Evolución por proyecto</h3>
        <div className={styles.segmentos} role="tablist" aria-label="Proyecto">
          {PROYECTOS.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={x.id === elegido} className={x.id === elegido ? styles.segmentoActivo : ""} onClick={() => onElegir(x.id)}>
              <i style={{ background: x.color }} />{x.nombre}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.comparadorCuerpo}>
        <div className={styles.comparadorDatos}>
          <span className={styles.avatar} style={{ background: p.color }}>{p.iniciales}</span>
          <strong>{p.nombre}</strong>
          <small>{p.categoria}</small>
          <dl>
            <div><dt>Valuación estimada</dt><dd>{pesos(ultimo(p.serie))}</dd></div>
            <div><dt>Variación 12 meses</dt><dd className={styles.positivo}>{porcentaje(cambio(p.serie))}</dd></div>
            <div><dt>Etapa</dt><dd>{p.etapa}</dd></div>
          </dl>
          <Ficticio texto="Valuación ficticia, no es una oferta" />
        </div>
        <Linea key={p.id} etiquetas={MESES} valores={p.serie} color={p.color} formato={pesosCorto} alto={240} titulo={`Valuación ficticia de ${p.nombre}`} />
      </div>
    </div>
  );
}

export default function ClubLanding({ fuente = "" }) {
  const raiz = useRef(null);
  const [conScroll, setConScroll] = useState(false);
  const [menu, setMenu] = useState(false);
  const [activa, setActiva] = useState("inicio");
  const [elegido, setElegido] = useState(PROYECTOS[0].id);
  const [modal, setModal] = useState(null);
  const [abierta, setAbierta] = useState(0);
  const cerrarModal = useCallback(() => setModal(null), []);
  useRevelar(raiz);

  useEffect(() => {
    const alBajar = () => setConScroll(window.scrollY > 120);
    alBajar();
    window.addEventListener("scroll", alBajar, { passive: true });
    const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActiva(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    SECCIONES.forEach((s) => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => { window.removeEventListener("scroll", alBajar); obs.disconnect(); };
  }, []);

  const navegar = (id) => { setMenu(false); ir(id); };
  const verEvolucion = (id) => { setElegido(id); ir("evolucion-proyectos"); };
  const sectores = useMemo(() => new Set(PROYECTOS.map((p) => p.categoria)).size, []);

  return (
    <div ref={raiz} className={`${styles.landing} ${fuente}`}>
      {/* 1 — Navegación */}
      <div className={`${styles.barra} ${conScroll ? styles.barraScroll : ""}`}>
        <button type="button" className={styles.barraLogo} onClick={() => navegar("inicio")} aria-label={`Ir al inicio de ${CLUB.nombre}`}><Logo /></button>
        <nav id="club-menu" aria-label={`Secciones de ${CLUB.nombre}`} className={`${styles.barraNav} ${menu ? styles.barraNavAbierta : ""}`}>
          {SECCIONES.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={activa === s.id ? styles.navActiva : ""} aria-current={activa === s.id ? "true" : undefined} onClick={(e) => { e.preventDefault(); navegar(s.id); }}>{s.texto}</a>
          ))}
          <button type="button" className={styles.navAcceso} onClick={() => { setMenu(false); setModal({ tipo: "acceso" }); }}><Icono nombre="candado" size={14} />Acceso a inversionistas</button>
        </nav>
        <button type="button" className={styles.barraCta} onClick={() => navegar("proyectos")}>Explorar proyectos</button>
        <button type="button" className={styles.barraMenu} aria-expanded={menu} aria-controls="club-menu" aria-label={menu ? "Cerrar menú" : "Abrir menú"} onClick={() => setMenu((v) => !v)}>
          <Icono nombre={menu ? "x" : "menu"} size={20} />
        </button>
      </div>

      {/* 2 — Hero */}
      <section id="inicio" className={styles.hero} aria-labelledby="club-titulo">
        <div className={styles.heroLuz} aria-hidden="true" />
        <div className={styles.heroTexto}>
          <span className={styles.chip} data-revelar><i />{CLUB.etiqueta}</span>
          <h1 id="club-titulo" data-revelar>{CLUB.titulo}</h1>
          <p data-revelar>{CLUB.subtitulo}</p>
          <div className={styles.heroBotones} data-revelar>
            <button type="button" className={styles.botonPrimario} onClick={() => ir("proyectos")}>Explorar proyectos <Icono nombre="flecha" size={18} /></button>
            <button type="button" className={styles.botonSecundario} onClick={() => ir("como-funciona")}>Conocer cómo funciona</button>
          </div>
          <dl className={styles.stats} data-revelar>
            {ESTADISTICAS.map((e, k) => (
              <div key={e.etiqueta}>
                <dt>{e.etiqueta}</dt>
                <dd><Contador valor={k === 1 ? sectores : e.valor} formato={(n) => `${e.prefijo || ""}${Math.round(n)}${e.sufijo}`} duracion={1400} /></dd>
              </div>
            ))}
          </dl>
          <p className={styles.heroNota} data-revelar><Icono nombre="escudo" size={14} /> Cifras ilustrativas. No es una oferta pública de valores.</p>
        </div>
        <div className={styles.heroDash} data-revelar><DashboardHero /></div>
      </section>

      {/* 3 — Proyectos */}
      <section id="proyectos" className={styles.seccion}>
        <Titulo eyebrow="Proyectos" titulo="Explora nuestros proyectos" texto="Empresas en distintas etapas, con su información organizada. Las valuaciones son simulaciones, no ofertas de inversión." />
        <div className={styles.gridProyectos}>
          {PROYECTOS.map((p) => (
            <article key={p.id} className={styles.proyecto} data-revelar style={{ "--color": p.color }}>
              <div className={styles.proyectoImagen} aria-hidden="true">
                <Icono nombre={p.icono} size={64} />
                <span className={styles.proyectoEtapa}>{p.etapa}</span>
              </div>
              <div className={styles.proyectoCuerpo}>
                <div className={styles.proyectoCabecera}>
                  <span className={styles.avatar} style={{ background: p.color }}>{p.iniciales}</span>
                  <div><h3>{p.nombre}</h3><small>{p.categoria}</small></div>
                </div>
                <p>{p.descripcion}</p>
                <div className={styles.proyectoCifras}>
                  <div><small>Valuación estimada <em>ficticia</em></small><strong>{pesosCorto(ultimo(p.serie))}</strong></div>
                  <span className={styles.positivo}><Icono nombre="subida" size={14} />{porcentaje(cambio(p.serie))}</span>
                </div>
                <Mini valores={p.serie} color={p.color} />
                {p.href ? (
                  <Link href={p.href} className={styles.botonProyecto}>Conocer proyecto <Icono nombre="flecha" size={16} /></Link>
                ) : (
                  <button type="button" className={styles.botonProyecto} onClick={() => verEvolucion(p.id)}>Conocer proyecto <Icono nombre="flecha" size={16} /></button>
                )}
              </div>
            </article>
          ))}
        </div>
        <Comparador elegido={elegido} onElegir={setElegido} />
      </section>

      {/* 4 — Cómo funciona */}
      <section id="como-funciona" className={styles.seccion}>
        <Titulo eyebrow="Cómo funciona" titulo="Cinco pasos, de conocer a administrar" />
        <ol className={styles.pasos}>
          {PASOS.map((p, k) => (
            <li key={p.titulo} className={styles.paso} data-revelar>
              <span className={styles.pasoNumero}>{String(k + 1).padStart(2, "0")}</span>
              <span className={styles.icono}><Icono nombre={p.icono} /></span>
              <strong>{p.titulo}</strong>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 5 — Modelos */}
      <section id="modelos" className={styles.seccion}>
        <Titulo eyebrow="Modelos de inversión" titulo="Un modelo inicial y dos caminos a futuro" texto="Hoy sólo opera el Modelo A. Los modelos B y C son alternativas de desarrollo futuro y no están habilitados." />
        <div className={styles.modelos}>
          {MODELOS.map((m) => (
            <article key={m.letra} className={`${styles.modelo} ${m.activo ? styles.modeloActivo : ""}`} data-revelar>
              <div className={styles.modeloCabecera}>
                <span className={styles.modeloLetra}>{m.letra}</span>
                <span className={m.activo ? styles.chip : styles.chipGris}>{m.estado}</span>
              </div>
              <h3>{m.titulo}</h3>
              <p>{m.texto}</p>
              <ul>{m.puntos.map((x) => <li key={x}><Icono nombre={m.activo ? "check" : "reloj"} size={15} />{x}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      {/* 6 — Dashboard de inversionistas */}
      <section id="dashboard" className={styles.seccion}>
        <Titulo eyebrow="Dashboard de inversionistas" titulo="Tus participaciones, en un solo lugar" texto="Así se vería el panel privado de un miembro del club. Todo lo que aparece es una demostración con datos ficticios." />
        <DashboardInversionista onDocumento={(t) => setModal({ tipo: "documento", titulo: t })} />
      </section>

      {/* 7 — Transparencia y seguridad (Nosotros) */}
      <section id="nosotros" className={styles.seccion}>
        <Titulo eyebrow="Nosotros · Transparencia y seguridad" titulo="Información clara, acceso privado" texto={`${CLUB.nombre} organiza la información de cada empresa y de cada participación para que los accionistas sepan qué tienen y cómo se registró.`} />
        <div className={styles.pilares}>
          {PILARES.map((p) => (
            <article key={p.titulo} className={styles.tarjeta} data-revelar>
              <span className={styles.icono}><Icono nombre={p.icono} /></span>
              <strong>{p.titulo}</strong>
              <p>{p.texto}</p>
            </article>
          ))}
        </div>
        <p className={styles.notaSeccion} data-revelar><Icono nombre="info" size={16} /> {CLUB.nombre} no es una institución financiera ni cuenta con autorización o supervisión de la CNBV.</p>
      </section>

      {/* 8 — Preguntas frecuentes */}
      <section id="preguntas" className={styles.seccion}>
        <Titulo eyebrow="Preguntas frecuentes" titulo="Lo que conviene saber" texto="Información general; no es asesoría legal, fiscal ni financiera." />
        <div className={styles.acordeon} data-revelar>
          {PREGUNTAS.map((q, k) => (
            <div key={q.p} className={`${styles.pregunta} ${abierta === k ? styles.preguntaAbierta : ""}`}>
              <h3>
                <button type="button" id={`faq-${k}`} aria-expanded={abierta === k} aria-controls={`faq-r-${k}`} onClick={() => setAbierta(abierta === k ? -1 : k)}>
                  {q.p}<Icono nombre="chevron" size={18} />
                </button>
              </h3>
              <div id={`faq-r-${k}`} role="region" aria-labelledby={`faq-${k}`} className={styles.respuesta} hidden={abierta !== k}>
                <p>{q.r}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9 — Registro de interés */}
      <section id="registro" className={styles.seccion}>
        <Titulo eyebrow="Registro de interés" titulo="¿Quieres saber más?" texto="Déjanos tus datos y te contactaremos cuando el club abra solicitudes." />
        <div data-revelar><FormularioClub /></div>
      </section>

      {/* 10 — Footer */}
      {/* Aviso legal. El footer es el del sitio (layout). */}
      <section className={styles.pie} aria-label="Aviso legal">
        <div className={styles.pieAviso}>
          <Icono nombre="alerta" size={18} />
          <p><strong>Aviso legal.</strong> {CLUB.aviso}</p>
        </div>
        <div className={styles.pieFinal}>
          <span>{CLUB.nombre} · Demostración con datos ficticios · Contacto: {CLUB.contacto.correo}</span>
          <Link href="/grow/proyectos">← Volver a Grow · Proyectos</Link>
        </div>
      </section>

      {modal?.tipo === "acceso" && (
        <Modal titulo="Acceso a inversionistas" onCerrar={cerrarModal}>
          <p>El acceso es sólo para miembros identificados y aceptados en el club, y todavía no está abierto. Mientras tanto, puedes ver una demostración del panel o dejar tus datos.</p>
          <div className={styles.modalBotones}>
            <button type="button" className={styles.botonPrimario} onClick={() => { setModal(null); setTimeout(() => ir("dashboard"), 50); }}>Ver demostración</button>
            <button type="button" className={styles.botonSecundario} onClick={() => { setModal(null); setTimeout(() => ir("registro"), 50); }}>Registrar interés</button>
          </div>
        </Modal>
      )}
      {modal?.tipo === "documento" && (
        <Modal titulo="Documento de demostración" icono="documento" onCerrar={cerrarModal}>
          <p><strong>{modal.titulo}</strong> es un ejemplo del tipo de documento que vería un accionista. En esta demostración no hay documentos reales.</p>
          <div className={styles.modalBotones}><button type="button" className={styles.botonPrimario} onClick={cerrarModal}>Entendido</button></div>
        </Modal>
      )}
    </div>
  );
}

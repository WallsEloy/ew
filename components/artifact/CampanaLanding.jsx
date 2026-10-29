"use client";

// Plantilla de campaña de crowdfunding con recompensas (estilo Kickstarter).
// Cada campaña es un objeto de datos (data/artifact.js → CAMPANA_ARTIFACT,
// data/humansFotolibro.js → CAMPANA_HUMANS): textos, cifras, paquetes,
// metas, proceso, galería, FAQ y tema de color. Si `modelo3d` es true, el
// hero y «Explora la pieza» usan el visor 3D; si no, imágenes por variante.

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Icono from "../gogo/Icono";
import Galeria from "./Galeria";
import Checkout from "./Checkout";
import Comunidad from "./Comunidad";
import { Demo, Modal, TemaCampana, pesos } from "./piezas";
import styles from "./artifact.module.css";

// El visor 3D sólo existe en el navegador (WebGL)
const Figura3D = dynamic(() => import("./Figura3D"), {
  ssr: false,
  loading: () => <div className={styles.visorCargando} aria-hidden="true"><span /></div>,
});

const ORDEN_SECCIONES = ["origen", "pieza", "campana", "recompensas", "galeria", "proceso", "artista", "faq"];

const reducido = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ir = (id) => {
  let destino = document.getElementById(id);
  // En escritorio la sección de recompensas se oculta: sus paquetes viven en
  // el panel lateral, así que se va a él
  if (destino && !destino.getClientRects().length) destino = document.getElementById(`${id}-panel`) || destino;
  destino?.scrollIntoView({ behavior: reducido() ? "auto" : "smooth", block: "start" });
};

// Título con una parte en itálica de acento: { antes, em, despues }
function Titulo({ t }) {
  return <>{t.antes}<em>{t.em}</em>{t.despues}</>;
}

// Tarjetas de los paquetes. `compacto`: versión del panel lateral.
function Paquetes({ paquetes, onElegir, compacto = false }) {
  return (
    <div className={`${styles.paquetes} ${compacto ? styles.paquetesCompactos : ""}`} data-grupo>
      {paquetes.map((p) => {
        const quedan = p.limite === null ? null : Math.max(0, p.limite - p.apartados);
        const agotado = quedan === 0;
        return (
          <article key={p.id} className={`${styles.paquete} ${p.destacado ? styles.paqueteDestacado : ""} ${agotado ? styles.paqueteAgotado : ""}`}>
            {p.destacado && <span className={styles.sello}>Más elegido</span>}
            <h3>{p.nombre}</h3>
            <strong className={styles.precio}>{pesos(p.precio)}<small> MXN</small></strong>
            <p>{p.recompensa}</p>
            <ul>{p.incluye.map((x) => <li key={x}><Icono nombre="check" size={14} />{x}</li>)}</ul>
            <div className={styles.disponibilidad}>
              {quedan === null ? (
                <span>Sin límite · {p.apartados} apartados</span>
              ) : (
                <>
                  <span>{agotado ? "Agotado" : `Quedan ${quedan} de ${p.limite}`}</span>
                  <div className={styles.dispBarra}><i style={{ width: `${(p.apartados / p.limite) * 100}%` }} /></div>
                </>
              )}
              <small>Entrega estimada: {p.entregaEstimada}</small>
            </div>
            <button type="button" className={p.destacado ? styles.botonLima : styles.botonLinea} disabled={agotado} onClick={() => onElegir(p)}>
              {agotado ? "Agotado" : `Elegir ${p.nombre}`}
            </button>
          </article>
        );
      })}
    </div>
  );
}

// Días que faltan para el cierre
function DiasRestantes({ cierre }) {
  const [dias, setDias] = useState(null);
  useEffect(() => setDias(Math.max(0, Math.floor((new Date(cierre).getTime() - Date.now()) / 86_400_000))), [cierre]);
  return <>{dias ?? "–"}</>;
}

// Contador regresivo hasta el cierre de la campaña
function Regresivo({ cierre }) {
  const [resto, setResto] = useState(null);
  useEffect(() => {
    const fin = new Date(cierre).getTime();
    const tick = () => setResto(Math.max(0, fin - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [cierre]);
  const partes = resto === null ? null : {
    días: Math.floor(resto / 86_400_000),
    horas: Math.floor(resto / 3_600_000) % 24,
    min: Math.floor(resto / 60_000) % 60,
    seg: Math.floor(resto / 1000) % 60,
  };
  if (resto === 0) return <p className={styles.regresivoFin}>La campaña de preventa terminó.</p>;
  return (
    <div className={styles.regresivo} role="timer" aria-live="off" aria-label={partes ? `Faltan ${partes.días} días y ${partes.horas} horas` : "Calculando tiempo restante"}>
      {["días", "horas", "min", "seg"].map((u) => (
        <div key={u}><strong>{partes ? String(partes[u]).padStart(2, "0") : "--"}</strong><small>{u}</small></div>
      ))}
    </div>
  );
}

export default function CampanaLanding({ datos, fuentes = "" }) {
  const {
    id, tema, modelo3d, ARTIFACT, CAMPANA, VARIANTES, FICHA, PAQUETES, METAS, FABRICACION, GALERIA, ORIGEN, ARTISTA, PREGUNTAS, DOCUMENTOS_LEGALES, TEXTOS,
  } = datos;
  const temaClase = tema ? styles[`tema_${tema}`] || "" : "";
  const SECCIONES = ORDEN_SECCIONES.map((s) => ({ id: s, texto: TEXTOS.secciones[s] }));

  const raiz = useRef(null);
  const [menu, setMenu] = useState(false);
  const [conScroll, setConScroll] = useState(false);
  const [activa, setActiva] = useState("");
  const [variante, setVariante] = useState(VARIANTES[0]);
  const [paquete, setPaquete] = useState(null);
  const [legal, setLegal] = useState(null);
  const [abierta, setAbierta] = useState(0);
  const cerrarCheckout = useCallback(() => setPaquete(null), []);
  const cerrarLegal = useCallback(() => setLegal(null), []);

  const avance = Math.min(100, (CAMPANA.recaudado / CAMPANA.meta) * 100);
  const metaMax = METAS[METAS.length - 1].monto;
  const siguiente = METAS.find((m) => m.monto > CAMPANA.recaudado);
  const marca = TEXTOS.marca;

  // Barra con efecto al bajar y sección activa
  useEffect(() => {
    const alBajar = () => setConScroll(window.scrollY > 80);
    alBajar();
    window.addEventListener("scroll", alBajar, { passive: true });
    const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActiva(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    ORDEN_SECCIONES.forEach((s) => { const el = document.getElementById(s); if (el) obs.observe(el); });
    return () => { window.removeEventListener("scroll", alBajar); obs.disconnect(); };
  }, []);

  // Animaciones cinematográficas con GSAP + ScrollTrigger. Con movimiento
  // reducido no se anima nada: todo queda en su estado final.
  useEffect(() => {
    if (reducido()) return undefined;
    let ctx;
    let cancelado = false;
    let limpiar = () => {};
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelado || !raiz.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        // Hero: las líneas del titular suben desde su máscara
        gsap.from("[data-linea]", { yPercent: 115, duration: 1.2, ease: "expo.out", stagger: 0.12, delay: 0.15 });
        gsap.from("[data-hero-sube]", { y: 24, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.6 });
        gsap.from("[data-hero-visor]", { scale: 0.85, opacity: 0, duration: 1.6, ease: "expo.out", delay: 0.2 });
        // El visor del hero se aleja y se desvanece al bajar
        gsap.to("[data-hero-visor]", { yPercent: 12, scale: 0.92, opacity: 0.35, ease: "none", scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true } });
        // Cinta de texto que avanza con el scroll
        gsap.to("[data-cinta]", { xPercent: -30, ease: "none", scrollTrigger: { trigger: "[data-cinta]", start: "top bottom", end: "bottom top", scrub: true } });
        // Entradas por sección
        gsap.utils.toArray("[data-sube]").forEach((el) => {
          gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
        });
        gsap.utils.toArray("[data-grupo]").forEach((grupo) => {
          gsap.from(grupo.children, { y: 40, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: grupo, start: "top 85%" } });
        });
        // Campaña: barra de progreso y contadores
        gsap.from("[data-progreso]", { scaleX: 0, transformOrigin: "left center", duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: "[data-progreso]", start: "top 85%" } });
        gsap.utils.toArray("[data-cuenta]").forEach((el) => {
          const final = Number(el.dataset.cuenta);
          const formato = el.dataset.formato;
          const obj = { v: 0 };
          gsap.to(obj, {
            v: final, duration: 1.8, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 90%" },
            onUpdate: () => { el.textContent = formato === "pesos" ? pesos(obj.v) : formato === "pct" ? `${Math.round(obj.v)}%` : Math.round(obj.v).toLocaleString("es-MX"); },
          });
        });
        // Metas y proceso: las líneas se dibujan
        gsap.from("[data-metas-relleno]", { scaleX: 0, transformOrigin: "left center", duration: 2, ease: "power2.out", scrollTrigger: { trigger: "[data-metas-relleno]", start: "top 85%" } });
        gsap.from("[data-proceso-linea]", { scaleY: 0, transformOrigin: "top center", ease: "none", scrollTrigger: { trigger: "[data-proceso]", start: "top 70%", end: "bottom 60%", scrub: true } });
        // CTA final: el titular gigante entra con escala
        gsap.from("[data-cta]", { scale: 0.9, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: "[data-cta]", start: "top 85%" } });
      }, raiz);
      // El visor 3D, las imágenes y las fuentes cambian el alto de la página
      // al cargar: se recalculan las posiciones para que ninguna animación
      // quede sin dispararse (y su elemento invisible)
      const recalcular = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(recalcular);
      window.addEventListener("load", recalcular);
      setTimeout(recalcular, 1500);
      setTimeout(recalcular, 4000);
      limpiar = () => window.removeEventListener("load", recalcular);
    })();
    return () => { cancelado = true; limpiar(); ctx?.revert(); };
  }, []);

  const navegar = (destino) => { setMenu(false); ir(destino); };

  return (
    <TemaCampana.Provider value={temaClase}>
    <div ref={raiz} className={`${styles.landing} ${temaClase} ${fuentes}`}>
      <div className={styles.fondoBarraSitio} aria-hidden="true" />

      {/* Navegación */}
      <div className={`${styles.barra} ${conScroll ? styles.barraScroll : ""}`}>
        <button type="button" className={styles.marca} onClick={() => window.scrollTo({ top: 0, behavior: reducido() ? "auto" : "smooth" })} aria-label={`Ir al inicio de ${marca.nombre}`}>
          {marca.nombre}<sup>{marca.sup}</sup>
        </button>
        <nav id="art-menu" aria-label={`Secciones de ${marca.nombre}`} className={`${styles.nav} ${menu ? styles.navAbierta : ""}`}>
          {SECCIONES.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={activa === s.id ? styles.navActiva : ""} aria-current={activa === s.id ? "true" : undefined} onClick={(e) => { e.preventDefault(); navegar(s.id); }}>{s.texto}</a>
          ))}
        </nav>
        <button type="button" className={styles.barraCta} onClick={() => navegar("recompensas")}>Reservar</button>
        <button type="button" className={styles.barraMenu} aria-expanded={menu} aria-controls="art-menu" aria-label={menu ? "Cerrar menú" : "Abrir menú"} onClick={() => setMenu((v) => !v)}>
          <Icono nombre={menu ? "x" : "menu"} size={20} />
        </button>
      </div>

      {/* 01 — Hero inmersivo */}
      <section className={styles.hero} data-hero aria-labelledby="art-titulo">
        <div className={styles.heroTexto}>
          <ul className={styles.etiquetas} data-hero-sube>
            {ARTIFACT.etiquetas.map((e) => <li key={e}>{e}</li>)}
          </ul>
          <h1 id="art-titulo" className={styles.heroTitulo}>
            {TEXTOS.heroLineas.map((l) => (
              <span key={l.texto} className={`${styles.mascara} ${l.acento ? styles.lineaLima : ""}`}><span data-linea>{l.texto}</span></span>
            ))}
          </h1>
          <p className={styles.heroSub} data-hero-sube><em>{ARTIFACT.subtitulo}</em></p>
          <div className={styles.heroBotones} data-hero-sube>
            <button type="button" className={styles.botonLima} onClick={() => ir("pieza")}>{TEXTOS.botonExplorar}</button>
            <button type="button" className={styles.botonLinea} onClick={() => ir("recompensas")}>{TEXTOS.botonReservar}</button>
          </div>
        </div>
        {/* Centro: la pieza protagonista (3D o imagen) */}
        <div className={`${styles.heroVisor} ${modelo3d ? "" : styles.heroVisorImagen}`} data-hero-visor>
          {modelo3d ? (
            <Figura3D variante={VARIANTES[0]} modo="hero" glb={ARTIFACT.modeloGLB} vista={[0.45, 0.24]} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ARTIFACT.heroImagen} alt={ARTIFACT.heroImagenAlt} fetchPriority="high" />
          )}
          {TEXTOS.heroPista && <span className={styles.heroPista} aria-hidden="true">{TEXTOS.heroPista}</span>}
        </div>
        {/* Derecha: la aportación, como en la página de un proyecto de
            Kickstarter (progreso, aportado, patrocinadores, días y botón) */}
        <aside className={styles.aporte} aria-label="Estado de la campaña" data-hero-sube>
          <div className={styles.aporteBarra} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(avance)} aria-label="Avance de la campaña">
            <i style={{ width: `${avance}%` }} />
          </div>
          <div className={styles.aporteDato}>
            <strong className={styles.aporteMonto}>{pesos(CAMPANA.recaudado)}</strong>
            <small>aportados de una meta de {pesos(CAMPANA.meta)}</small>
          </div>
          <div className={styles.aporteDato}>
            <strong>{CAMPANA.patrocinadores}</strong>
            <small>patrocinadores</small>
          </div>
          <div className={styles.aporteDato}>
            <strong><DiasRestantes cierre={CAMPANA.cierre} /></strong>
            <small>días restantes</small>
          </div>
          <button type="button" className={styles.botonLima} onClick={() => ir("recompensas")}>Apoya este proyecto</button>
          <p className={styles.aporteNota}>Preventa con recompensas, no es una inversión. Desde {pesos(PAQUETES[0].precio)} MXN.</p>
          <Demo />
        </aside>
      </section>

      <div className={styles.cinta} aria-hidden="true"><span data-cinta>{TEXTOS.cinta}</span></div>

      {/* Después del hero, como en Kickstarter: la historia a la izquierda y
          los paquetes en un panel a la derecha (sólo escritorio) */}
      <div className={styles.cuerpo}>
      <div className={styles.historia}>

      {/* 02 — Origen */}
      <section id="origen" className={styles.seccion}>
        <div className={styles.origen}>
          <div className={styles.origenTexto}>
            <span className={styles.numero} data-sube>{TEXTOS.origen.numero}</span>
            <h2 className={styles.tituloGigante} data-sube>{ORIGEN.titulo}</h2>
            <div className={styles.parrafos} data-grupo>
              {ORIGEN.parrafos.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
            </div>
            <dl className={styles.rasgos} data-grupo>
              {ORIGEN.rasgos.map((r) => <div key={r.titulo}><dt>{r.titulo}</dt><dd>{r.texto}</dd></div>)}
            </dl>
          </div>
          <figure className={styles.origenBoceto} data-sube>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ORIGEN.imagen} alt={ORIGEN.imagenAlt} loading="lazy" />
            <figcaption>{ORIGEN.imagenPie}</figcaption>
          </figure>
        </div>
      </section>

      {/* 03 — Explora la pieza */}
      <section id="pieza" className={styles.seccion}>
        <div className={styles.encabezado} data-sube>
          <span className={styles.numero}>{TEXTOS.pieza.numero}</span>
          <h2 className={styles.tituloGrande}><Titulo t={TEXTOS.pieza.titulo} /></h2>
        </div>
        <div className={styles.pieza}>
          <div className={`${styles.visor360} ${modelo3d ? "" : styles.visorImagen}`} data-sube>
            {modelo3d ? (
              <Figura3D variante={variante} modo="explorar" glb={ARTIFACT.modeloGLB} vista={[0.3, 0.2]} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={variante.id} src={variante.imagen} alt={variante.imagenAlt} loading="lazy" />
            )}
            <span className={styles.visorAyuda}><Icono nombre={modelo3d ? "cambio" : "info"} size={14} /> {TEXTOS.pieza.ayuda}</span>
            <span className={styles.visorVariante}>{variante.nombre}</span>
          </div>
          <div className={styles.piezaInfo}>
            <fieldset className={styles.variantes} data-sube>
              <legend>{TEXTOS.pieza.leyenda}</legend>
              {VARIANTES.map((v) => (
                <label key={v.id} className={variante.id === v.id ? styles.varianteActiva : ""}>
                  <input type="radio" name="variante" value={v.id} checked={variante.id === v.id} onChange={() => setVariante(v)} />
                  {v.imagen ? (
                    <i className={styles.varianteMiniatura} style={{ backgroundImage: `url("${v.imagen}")` }} />
                  ) : (
                    <i style={{ background: v.cuerpo, boxShadow: `inset 0 0 0 3px ${v.acento}` }} />
                  )}
                  <span><b>{v.nombre}</b><small>{v.detalle}</small></span>
                </label>
              ))}
            </fieldset>
            <dl className={styles.ficha} data-grupo>
              {FICHA.map((f) => (
                <div key={f.titulo}><dt>{f.titulo}</dt><dd>{f.valor}</dd><small>{f.detalle}</small></div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 04 — Campaña */}
      <section id="campana" className={`${styles.seccion} ${styles.seccionCampana}`}>
        <div className={styles.campana}>
          <div className={styles.encabezado} data-sube>
            <span className={styles.numero}>04 — Campaña de financiamiento</span>
            <h2 className={styles.tituloGrande}><Titulo t={TEXTOS.campana.titulo} /></h2>
            <Demo texto="Cifras demostrativas hasta conectar datos reales" />
          </div>
          <div className={styles.campanaPanel}>
            <div className={styles.recaudado}>
              <small>Recaudado</small>
              <strong data-cuenta={CAMPANA.recaudado} data-formato="pesos">{pesos(CAMPANA.recaudado)}</strong>
              <span>de {pesos(CAMPANA.meta)} de meta</span>
            </div>
            <div className={styles.progreso} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(avance)} aria-label="Avance de la campaña">
              <i data-progreso style={{ width: `${avance}%` }} />
              <b style={{ left: `${avance}%` }}>{Math.round(avance)}%</b>
            </div>
            <div className={styles.campanaDatos}>
              <div><strong data-cuenta={Math.round(avance)} data-formato="pct">{Math.round(avance)}%</strong><small>Avance</small></div>
              <div><strong data-cuenta={CAMPANA.patrocinadores}>{CAMPANA.patrocinadores}</strong><small>Patrocinadores</small></div>
              <div><strong>{pesos(CAMPANA.meta - CAMPANA.recaudado)}</strong><small>Para la meta</small></div>
            </div>
            <div className={styles.cierre}>
              <small>Termina en</small>
              <Regresivo cierre={CAMPANA.cierre} />
            </div>
            <button type="button" className={styles.botonLima} onClick={() => ir("recompensas")}>Elegir mi recompensa</button>
          </div>
        </div>
      </section>

      {/* 05 — Recompensas */}
      <section id="recompensas" className={`${styles.seccion} ${styles.seccionRecompensas}`}>
        <div className={styles.encabezado} data-sube>
          <span className={styles.numero}>05 — Paquetes de recompensas</span>
          <h2 className={styles.tituloGrande}><Titulo t={TEXTOS.recompensas.titulo} /></h2>
          <p className={styles.nota}>Son recompensas de preventa: productos y experiencias, no acciones ni instrumentos de inversión. El pago es una simulación por ahora.</p>
        </div>
        <Paquetes paquetes={PAQUETES} onElegir={setPaquete} />
      </section>

      {/* 06 — Metas desbloqueables */}
      <section id="metas" className={styles.seccion}>
        <div className={styles.encabezado} data-sube>
          <span className={styles.numero}>06 — Metas desbloqueables</span>
          <h2 className={styles.tituloGrande}>Cada meta <em>desbloquea</em> algo nuevo.</h2>
          {siguiente && <p className={styles.nota}>Próxima meta: {siguiente.titulo} — faltan {pesos(siguiente.monto - CAMPANA.recaudado)}.</p>}
        </div>
        <div className={styles.metas}>
          <div className={styles.metasPista} aria-hidden="true">
            <i data-metas-relleno style={{ width: `${(CAMPANA.recaudado / metaMax) * 100}%` }} />
          </div>
          <ol data-grupo>
            {METAS.map((m) => {
              const lograda = CAMPANA.recaudado >= m.monto;
              const proxima = m === siguiente;
              return (
                <li key={m.monto} className={lograda ? styles.metaLograda : proxima ? styles.metaProxima : ""} style={{ "--pos": `${(m.monto / metaMax) * 100}%` }}>
                  <span className={styles.metaPunto}>{lograda ? <Icono nombre="check" size={14} /> : <Icono nombre={proxima ? "flecha" : "candado"} size={12} />}</span>
                  <strong>{pesos(m.monto)}</strong>
                  <p>{m.titulo}</p>
                  <small>{lograda ? "Desbloqueada" : proxima ? "Próxima" : "Bloqueada"}</small>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 07 — Galería */}
      <section id="galeria" className={styles.seccion}>
        <div className={styles.encabezado} data-sube>
          <span className={styles.numero}>07 — Galería</span>
          <h2 className={styles.tituloGrande}><Titulo t={TEXTOS.galeria.titulo} /></h2>
        </div>
        <Galeria items={GALERIA} />
      </section>

      {/* 08 — Proceso */}
      <section id="proceso" className={styles.seccion}>
        <div className={styles.encabezado} data-sube>
          <span className={styles.numero}>{TEXTOS.proceso.numero}</span>
          <h2 className={styles.tituloGrande}><Titulo t={TEXTOS.proceso.titulo} /></h2>
          <Demo texto="Estados y fechas estimadas, editables" />
        </div>
        <div className={styles.proceso} data-proceso>
          <span className={styles.procesoLinea} data-proceso-linea aria-hidden="true" />
          <ol>
          {FABRICACION.map((f, k) => (
            <li key={f.etapa} className={styles[`estado_${f.estado.replace("-", "")}`]} data-sube>
              <span className={styles.procesoPunto}>{f.estado === "completado" ? <Icono nombre="check" size={14} /> : String(k + 1).padStart(2, "0")}</span>
              <div>
                <small>{f.fecha} · {f.estado === "completado" ? "Completado" : f.estado === "en-curso" ? "En curso" : "Pendiente"}</small>
                <strong>{f.etapa}</strong>
                <p>{f.texto}</p>
              </div>
            </li>
          ))}
          </ol>
        </div>
      </section>

      {/* 09 — Sobre el artista */}
      <section id="artista" className={styles.seccion}>
        <div className={styles.artista}>
          <div data-sube>
            <span className={styles.numero}>09 — Sobre el artista</span>
            <h2 className={styles.tituloGigante}>{ARTISTA.nombre}</h2>
            <small className={styles.rol}>{ARTISTA.rol}</small>
          </div>
          <div className={styles.artistaTexto}>
            <div className={styles.parrafos} data-grupo>{ARTISTA.bio.map((b) => <p key={b.slice(0, 20)}>{b}</p>)}</div>
            <blockquote data-sube>“{ARTISTA.filosofia}”</blockquote>
            <div className={styles.otros} data-grupo>
              {ARTISTA.proyectos.map((p) => (
                <Link key={p.titulo} href={p.href}><strong>{p.titulo}</strong><small>{p.texto}</small><Icono nombre="flecha" size={16} /></Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10 — Comunidad */}
      <section id="comunidad" className={styles.seccion}>
        <div className={styles.comunidad}>
          <div className={styles.encabezado} data-sube>
            <span className={styles.numero}>{TEXTOS.comunidad.numero}</span>
            <h2 className={styles.tituloGrande}><Titulo t={TEXTOS.comunidad.titulo} /></h2>
            <p className={styles.nota}>{TEXTOS.comunidad.texto}</p>
          </div>
          <div data-sube><Comunidad nombre={marca.nombre} campana={id} /></div>
        </div>
      </section>

      {/* 11 — Preguntas frecuentes */}
      <section id="faq" className={styles.seccion}>
        <div className={styles.encabezado} data-sube>
          <span className={styles.numero}>11 — Preguntas frecuentes</span>
          <h2 className={styles.tituloGrande}><Titulo t={TEXTOS.faq.titulo} /></h2>
        </div>
        <div className={styles.faq} data-grupo>
          {PREGUNTAS.map((q, k) => (
            <div key={q.p} className={`${styles.pregunta} ${abierta === k ? styles.preguntaAbierta : ""}`}>
              <h3>
                <button type="button" id={`art-faq-${k}`} aria-expanded={abierta === k} aria-controls={`art-faq-r-${k}`} onClick={() => setAbierta(abierta === k ? -1 : k)}>
                  <span>{String(k + 1).padStart(2, "0")}</span>{q.p}<i aria-hidden="true" />
                </button>
              </h3>
              <div id={`art-faq-r-${k}`} role="region" aria-labelledby={`art-faq-${k}`} hidden={abierta !== k} className={styles.respuesta}>
                <p>{q.r}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      </div>

      <aside id="recompensas-panel" className={styles.panelRecompensas} aria-labelledby="art-panel-titulo">
        <div className={styles.panelCabecera}>
          <span className={styles.numero}>Paquetes de recompensas</span>
          <h2 id="art-panel-titulo"><Titulo t={TEXTOS.recompensas.titulo} /></h2>
          <p>Recompensas de preventa, no inversión. Pago simulado por ahora.</p>
        </div>
        <Paquetes paquetes={PAQUETES} onElegir={setPaquete} compacto />
      </aside>
      </div>

      {/* 12 — CTA final */}
      <section className={styles.ctaFinal}>
        <h2 data-cta><Titulo t={TEXTOS.cta.titulo} /></h2>
        <button type="button" className={styles.botonLimaGrande} onClick={() => ir("recompensas")}>{TEXTOS.cta.boton}</button>
      </section>

      {/* Aviso legal de la campaña. El footer es el del sitio (layout). */}
      <section className={styles.pie} aria-label="Aviso legal de la campaña">
        <p className={styles.pieAvisoTexto}>{ARTIFACT.subnombre} · {ARTIFACT.nombreNota}. Campaña de preventa con recompensas, no de inversión. Las cifras de la campaña son demostrativas y no se cobra dinero real.</p>
        <div className={styles.pieLegal}>
          {DOCUMENTOS_LEGALES.map((d) => <button key={d} type="button" onClick={() => setLegal(d)}>{d}</button>)}
        </div>
        <div className={styles.pieFinal}>
          <span>Contacto: {ARTIFACT.contacto.correo} <small>({ARTIFACT.contacto.nota})</small></span>
          <Link href="/grow/proyectos">← Volver a Grow · Proyectos</Link>
        </div>
      </section>

      {paquete && <Checkout paquete={paquete} onCerrar={cerrarCheckout} />}
      {legal && (
        <Modal titulo={legal} etiqueta="En preparación" onCerrar={cerrarLegal}>
          <p>Este documento se publicará antes de habilitar pagos reales. Mientras tanto, la campaña funciona sólo como demostración y no se cobra dinero.</p>
          <button type="button" className={styles.botonLima} onClick={cerrarLegal}>Entendido</button>
        </Modal>
      )}
    </div>
    </TemaCampana.Provider>
  );
}

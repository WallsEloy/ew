"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./SesionesFotos.module.css";

// Segundos sin tocar ninguna foto para que una sesión abierta se vuelva a plegar.
const ESPERA_PLEGADO = 5000;
// Duración del vuelo de cada foto entre su montón y la cuadrícula.
const DURACION = 650;
// Fotos que se alcanzan a ver en cada montón; las demás viajan escondidas.
const VISIBLES_EN_PILA = 5;

// Giro y desplazamiento fijos por foto para que el montón se vea "a mano"
// pero no cambie entre renders. La de arriba va derecha.
const desorden = (index) => ({
  giro: index === 0 ? 0 : ((index * 37) % 15) - 7,
  x: index === 0 ? 0 : (((index * 53) % 21) - 10) * 0.4,
  y: index === 0 ? 0 : (((index * 29) % 13) - 6) * 0.4,
});

const reducirMovimiento = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/*
 * Sesiones de fotos (galería de Fotografía). Cada sesión es un montón de fotos
 * y todos los montones van uno al lado del otro, en las casillas de la primera
 * fila. Al tocar un montón sus fotos vuelan a su lugar en una cuadrícula que se
 * abre debajo; tras 5 s sin tocar ninguna foto regresan solas a su montón.
 */
export default function SesionesFotos({ sesiones = [], sueltas = [], onClick, pausado = false }) {
  const pilasRef = useRef([]);
  // Índice de sesión -> "abierta" | "cerrando"
  const [estados, setEstados] = useState({});

  const abrir = (k) => setEstados((e) => (e[k] ? e : { ...e, [k]: "abierta" }));
  const cerrar = (k) =>
    setEstados((e) => (e[k] === "abierta" ? { ...e, [k]: "cerrando" } : e));
  const quitar = (k) =>
    setEstados(({ [k]: _quitada, ...resto }) => resto);

  return (
    <div className={styles.sesiones}>
      {/* Fotos fuera de los montones: arriba, siempre a la vista y completas */}
      {sueltas.map((post, index) => (
        <button
          key={post.id}
          type="button"
          className={styles.suelta}
          onClick={() => onClick?.(sueltas, index)}
        >
          <img src={post.image} alt={post.title || post.caption || ""} decoding="async" />
        </button>
      ))}

      <div className={styles.pilas}>
        {sesiones.map((sesion, k) => (
          <button
            key={sesion.nombre || k}
            ref={(el) => {
              pilasRef.current[k] = el;
            }}
            type="button"
            className={`${styles.pila} ${estados[k] ? styles.pilaVacia : ""}`}
            onClick={(event) => {
              event.currentTarget.blur(); // sin contorno de foco sobre el montón vacío
              abrir(k);
            }}
            aria-expanded={Boolean(estados[k])}
            aria-label={`Ver la sesión ${sesion.nombre} (${sesion.posts.length} fotos)`}
          >
            {sesion.posts.slice(0, VISIBLES_EN_PILA).map((post, i) => {
              const { giro, x, y } = desorden(i);
              return (
                <img
                  key={post.id}
                  src={post.image}
                  alt=""
                  className={styles.carta}
                  style={{
                    transform: `translate(${x}px, ${y}px) rotate(${giro}deg)`,
                    zIndex: VISIBLES_EN_PILA - i,
                  }}
                  decoding="async"
                />
              );
            })}
          </button>
        ))}
      </div>

      {sesiones.map((sesion, k) =>
        estados[k] ? (
          <Cuadricula
            key={sesion.nombre || k}
            posts={sesion.posts}
            pila={() => pilasRef.current[k]}
            cerrando={estados[k] === "cerrando"}
            pausado={pausado}
            onCerrar={() => cerrar(k)}
            onCerrada={() => quitar(k)}
            onClick={(index) => onClick?.(sesion.posts, index)}
          />
        ) : null,
      )}
    </div>
  );
}

// Cuadrícula de una sesión abierta. Mide en el momento de abrir y de cerrar
// dónde está su montón, así el vuelo cuadra aunque la página se haya movido.
function Cuadricula({ posts, pila, cerrando, pausado, onCerrar, onCerrada, onClick }) {
  const marcoRef = useRef(null);
  const gridRef = useRef(null);
  const [toques, setToques] = useState(0);

  // Transform de cada foto para quedar encima de la casilla de su montón
  const haciaPila = () => {
    const destino = pila()?.getBoundingClientRect();
    if (!destino || !gridRef.current) return [];
    return Array.from(gridRef.current.children).map((el, i) => {
      el.style.transition = "none";
      el.style.transform = "none";
      const r = el.getBoundingClientRect();
      el.style.transition = "";
      const { giro, x, y } = desorden(i);
      const dx = destino.left + destino.width / 2 - (r.left + r.width / 2) + x;
      const dy = destino.top + destino.height / 2 - (r.top + r.height / 2) + y;
      return {
        el,
        i,
        transform: `translate(${dx}px, ${dy}px) rotate(${giro}deg) scale(${destino.width / r.width})`,
        oculta: i >= VISIBLES_EN_PILA,
      };
    });
  };

  // Al abrir: las fotos salen del montón y vuelan a su casilla
  useLayoutEffect(() => {
    const marco = marcoRef.current;
    if (!marco || reducirMovimiento()) return undefined;

    const fotos = haciaPila();
    const alto = marco.scrollHeight;
    marco.classList.add(styles.volando);
    fotos.forEach(({ el, i, transform, oculta }) => {
      el.style.transition = "none";
      el.style.transform = transform;
      el.style.opacity = oculta ? "0" : "1";
      el.style.zIndex = String(posts.length - i);
    });
    marco.style.height = "0px";
    marco.getBoundingClientRect(); // fija el punto de partida antes de animar

    const cuadro = requestAnimationFrame(() => {
      marco.classList.remove(styles.volando);
      marco.style.height = `${alto}px`;
      fotos.forEach(({ el, i }) => {
        el.style.transition = "";
        el.style.transitionDelay = `${Math.min(i, 12) * 25}ms`;
        el.style.transform = "";
        el.style.opacity = "";
      });
    });
    const fin = setTimeout(() => {
      marco.style.height = "";
      fotos.forEach(({ el }) => {
        el.style.transitionDelay = "";
        el.style.zIndex = "";
      });
    }, DURACION + 400);

    return () => {
      cancelAnimationFrame(cuadro);
      clearTimeout(fin);
    };
    // Solo al montarse: es la animación de apertura
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Al cerrar: cada foto regresa a su montón y la cuadrícula se recoge
  useEffect(() => {
    if (!cerrando) return undefined;
    const marco = marcoRef.current;
    if (!marco || reducirMovimiento()) {
      onCerrada();
      return undefined;
    }

    const fotos = haciaPila();
    marco.style.height = `${marco.offsetHeight}px`;
    marco.getBoundingClientRect();
    marco.classList.add(styles.volando);
    fotos.forEach(({ el, i, transform, oculta }) => {
      el.style.transitionDelay = `${Math.min(posts.length - 1 - i, 12) * 20}ms`;
      el.style.zIndex = String(posts.length - i);
      el.style.transform = transform;
      el.style.opacity = oculta ? "0" : "1";
    });
    marco.style.height = "0px";

    const fin = setTimeout(onCerrada, DURACION + 350);
    return () => clearTimeout(fin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cerrando]);

  // Abierta, se vuelve a plegar tras 5 s sin tocar ninguna foto. Cada toque
  // reinicia la cuenta, y con una foto abierta en grande (`pausado`) no corre.
  useEffect(() => {
    if (cerrando || pausado) return undefined;
    const temporizador = setTimeout(onCerrar, ESPERA_PLEGADO);
    return () => clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cerrando, pausado, toques]);

  return (
    <div ref={marcoRef} className={styles.marco}>
      <div
        ref={gridRef}
        className={styles.grid}
        onPointerDown={() => setToques((n) => n + 1)}
      >
        {posts.map((post, index) => (
          <div
            key={post.id}
            onClick={() => !cerrando && onClick(index)}
            className={`${styles.foto} ${post.isHorizontal ? styles.fotoHorizontal : ""}`}
          >
            <img
              src={post.image}
              alt={post.title || post.caption || ""}
              loading={index < 6 ? "eager" : "lazy"}
              decoding="async"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

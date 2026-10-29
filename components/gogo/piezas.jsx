"use client";

import { useEffect, useId, useRef, useState } from "react";
import Icono from "./Icono";
import styles from "./gogo.module.css";

// Ícono de ayuda con una explicación. Se abre con el mouse, con el foco del
// teclado o con un toque, y se cierra con Escape.
export function Ayuda({ texto }) {
  const id = useId();
  const [abierta, setAbierta] = useState(false);
  return (
    <span className={styles.ayuda} onMouseEnter={() => setAbierta(true)} onMouseLeave={() => setAbierta(false)}>
      <button
        type="button"
        aria-label="Más información"
        aria-describedby={id}
        aria-expanded={abierta}
        onFocus={() => setAbierta(true)}
        onBlur={() => setAbierta(false)}
        onClick={() => setAbierta((v) => !v)}
        onKeyDown={(e) => e.key === "Escape" && setAbierta(false)}
      >
        <Icono nombre="info" size={15} />
      </button>
      <span id={id} role="tooltip" className={`${styles.ayudaTexto} ${abierta ? styles.ayudaAbierta : ""}`}>{texto}</span>
    </span>
  );
}

// Número que se anima hasta su valor. Sólo se usa con cifras simuladas.
export function Contador({ valor, formato = (n) => n.toFixed(0), duracion = 600, className }) {
  const [mostrado, setMostrado] = useState(valor);
  const desde = useRef(valor);
  useEffect(() => {
    const reducido = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducido) { setMostrado(valor); desde.current = valor; return undefined; }
    const inicio = performance.now();
    const origen = desde.current;
    let cuadro;
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / duracion);
      const suave = 1 - Math.pow(1 - t, 3);
      const actual = origen + (valor - origen) * suave;
      setMostrado(actual);
      desde.current = actual;
      if (t < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [valor, duracion]);
  return <strong className={className}>{formato(mostrado)}</strong>;
}

// Activa la animación de entrada de todo lo marcado con data-revelar dentro
// del contenedor, cuando entra en pantalla.
export function useRevelar(ref) {
  useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return undefined;
    const elementos = raiz.querySelectorAll("[data-revelar]");
    if (!("IntersectionObserver" in window)) {
      elementos.forEach((el) => el.setAttribute("data-visible", ""));
      return undefined;
    }
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.setAttribute("data-visible", "");
          observador.unobserve(entrada.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    elementos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, [ref]);
}

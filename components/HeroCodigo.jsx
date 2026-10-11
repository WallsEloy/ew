"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./HeroCodigo.module.css";

/*
 * Hero del área Web (Diseño): solo código que se escribe solo, letra por letra,
 * con colores de sintaxis y cursor parpadeante. La presentación del área (título,
 * descripción y número de proyectos) es parte del propio código, como datos. Al terminar espera, se borra y vuelve a empezar.
 */

// Cada línea es una lista de [tipo, texto]; el tipo da el color
function crearCodigo(titulo, proyectos) {
  return [
    [["kw", "import"], ["tx", " { "], ["fn", "Marca"], ["tx", " } "], ["kw", "from"], ["st", ' "@/eloy-walls"'], ["tx", ";"]],
    [],
    [["kw", "export const"], ["tx", " area = {"]],
    [["tx", "  categoria: "], ["st", '"Desarrollo web"'], ["tx", ","]],
    [["tx", "  titulo: "], ["st", `"${titulo}"`], ["tx", ","]],
    [["tx", "  descripcion:"]],
    [["tx", "    "], ["st", '"Sitios y aplicaciones a la medida: rápidos, "'], ["tx", " +"]],
    [["tx", "    "], ["st", '"responsivos y con la identidad de cada marca "'], ["tx", " +"]],
    [["tx", "    "], ["st", '"en cada línea de código."'], ["tx", ","]],
    [["tx", "  proyectos: "], ["nu", String(proyectos)], ["tx", ","]],
    [["tx", "  experiencia: ["], ["st", '"rápida"'], ["tx", ", "], ["st", '"responsiva"'], ["tx", ", "], ["st", '"única"'], ["tx", "],"]],
    [["tx", "};"]],
    [],
    [["kw", "export default function"], ["fn", " Sitio"], ["tx", "() {"]],
    [["tx", "  "], ["kw", "return"], ["tx", " "], ["tg", "<Marca"], ["at", " area"], ["tx", "={area}"], ["tg", ">"], ["tx", "Ideas que se vuelven web"], ["tg", "</Marca>"], ["tx", ";"]],
    [["tx", "}"]],
  ];
}

// Tiempo en que se escribe todo el código (ms)
const DURACION_ESCRITURA = 4700;

const contar = (codigo) => codigo.reduce((n, linea) => n + linea.reduce((m, [, t]) => m + t.length, 0) + 1, 0);

// Recorta el código a los primeros `n` caracteres, respetando colores y líneas
function visible(codigo, n) {
  const out = [];
  let resto = n;
  for (const linea of codigo) {
    if (resto <= 0) break;
    const partes = [];
    for (const [tipo, texto] of linea) {
      if (resto <= 0) break;
      partes.push([tipo, texto.slice(0, resto)]);
      resto -= texto.length;
    }
    out.push(partes);
    resto -= 1; // salto de línea
  }
  return out;
}

export default function HeroCodigo({ titulo = "Web", proyectos = 0 }) {
  const codigo = useMemo(() => crearCodigo(titulo, proyectos), [titulo, proyectos]);
  const total = useMemo(() => contar(codigo), [codigo]);
  const [n, setN] = useState(0);

  // Máquina de escritura: escribe, espera, borra y vuelve a empezar. El avance
  // vive en una variable local (no en el actualizador de setN) para que el
  // doble render de desarrollo no duplique los temporizadores.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(total);
      return undefined;
    }
    // Pausa media entre pasos para escribir todo en DURACION_ESCRITURA
    const espera = DURACION_ESCRITURA / Math.ceil(total / 4);
    let inicio = null;
    let actual = 0;
    let fase = "escribe";
    let t;
    const paso = () => {
      if (fase === "escribe") {
        if (actual >= total) {
          fase = "borra";
          t = setTimeout(paso, 3200);
          return;
        }
        // Avanza según el reloj: así termina justo en DURACION_ESCRITURA aunque
        // el navegador retrase los temporizadores. La espera variable entre
        // pasos da el ritmo irregular de tecleo.
        if (inicio === null) inicio = performance.now();
        const meta = Math.ceil((total * (performance.now() - inicio)) / DURACION_ESCRITURA);
        actual = Math.min(total, Math.max(actual + 1, meta));
        t = setTimeout(paso, espera * (0.7 + Math.random() * 0.6));
      } else {
        if (actual <= 0) {
          fase = "escribe";
          inicio = null;
          t = setTimeout(paso, 500);
          return;
        }
        actual = Math.max(0, actual - 4);
        t = setTimeout(paso, 6);
      }
      setN(actual);
    };
    t = setTimeout(paso, 600);
    return () => clearTimeout(t);
  }, [total]);

  const lineas = visible(codigo, n);

  return (
    <section className={styles.hero} aria-labelledby="hero-codigo-titulo">
      {/* Texto real para buscadores y lectores de pantalla (el código es decorativo) */}
      <div className={styles.soloLectores}>
        <h1 id="hero-codigo-titulo">{titulo}</h1>
        <p>
          Desarrollo web: sitios y aplicaciones a la medida, rápidos, responsivos y con la identidad de cada marca.
          {proyectos > 0 && ` ${proyectos} ${proyectos === 1 ? "proyecto" : "proyectos"}.`}
        </p>
      </div>

      <pre className={styles.codigo} style={{ "--lineas": codigo.length }} aria-hidden="true">
        {codigo.map((_, i) => {
          const partes = lineas[i];
          const esUltima = i === lineas.length - 1 || (lineas.length === 0 && i === 0);
          return (
            <div key={i} className={styles.linea}>
              <span className={styles.num}>{i + 1}</span>
              <span>
                {partes?.map(([tipo, texto], j) => (
                  <span key={j} className={styles[tipo]}>
                    {texto}
                  </span>
                ))}
                {esUltima && <span className={styles.cursor} />}
              </span>
            </div>
          );
        })}
      </pre>
    </section>
  );
}

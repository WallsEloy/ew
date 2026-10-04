"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

function hexToRgb(hex) {
  const value = parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

// Conversión directa RGB → CMYK (sin perfil de color): es una referencia; para
// imprenta conviene usar los valores del archivo de diseño original.
function rgbToCmyk([r, g, b]) {
  const k = 1 - Math.max(r, g, b) / 255;
  if (k === 1) return [0, 0, 0, 100];
  const channel = (value) => Math.round(((1 - value / 255 - k) / (1 - k)) * 100);
  return [channel(r), channel(g), channel(b), Math.round(k * 100)];
}

// Panel de paleta: las franjas crecen escalonadas la primera vez que el panel
// entra en pantalla. Con "reducir movimiento" se muestran ya abiertas (CSS).
export default function ColorPanel({ colors }) {
  const panelRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={panelRef}
      className={`${styles.palette} ${visible ? styles.paletteVisible : ""}`}
      aria-label="Paleta de color del proyecto"
    >
      {colors.map((color, index) => {
        // Un gradiente muestra sus paradas (color y posición) en lugar de un solo código
        if (color.gradient) {
          const stops = color.gradient.map((hex, stop) => [hex, Math.round((stop / (color.gradient.length - 1)) * 100)]);
          return (
            <div
              className={styles.swatch}
              key={color.name}
              style={{
                "--swatch": `linear-gradient(90deg, ${stops.map(([hex, at]) => `${hex} ${at}%`).join(", ")})`,
                "--swatch-ink": color.ink,
                "--delay": `${index * 140}ms`,
              }}
            >
              <div className={styles.swatchLabel}>
                <strong>{color.name}</strong>
                <dl className={styles.swatchCodes}>
                  {stops.map(([hex, at]) => (
                    <div key={hex}><dt>{at}%</dt><dd>{hex.toUpperCase()}</dd></div>
                  ))}
                  <div><dt>Ángulo</dt><dd>90° lineal</dd></div>
                </dl>
              </div>
            </div>
          );
        }

        const rgb = hexToRgb(color.hex);
        const cmyk = rgbToCmyk(rgb);
        return (
          <div
            className={styles.swatch}
            key={color.hex}
            style={{ "--swatch": color.hex, "--swatch-ink": color.ink, "--delay": `${index * 140}ms` }}
          >
            <div className={styles.swatchLabel}>
              <strong>{color.name}</strong>
              <dl className={styles.swatchCodes}>
                <div><dt>HEX</dt><dd>{color.hex.toUpperCase()}</dd></div>
                <div><dt>RGB</dt><dd>{rgb.join(" · ")}</dd></div>
                <div><dt>CMYK</dt><dd>{cmyk.join(" · ")}</dd></div>
              </dl>
            </div>
          </div>
        );
      })}
    </section>
  );
}

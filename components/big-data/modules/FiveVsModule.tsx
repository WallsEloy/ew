"use client";

import ModuleShell from "../core/ModuleShell";
import { useDeviceTier, usePortrait } from "../core/env";
import { StepDriver, StepList, TextDriver } from "../core/Steps";
import { createProgress, fadeInOut, range, smooth, type ModuleProgress } from "../core/progress";
import { scaledCount } from "../bigDataConfig";
import SceneRig from "../three/SceneRig";
import ParticleMorph, { type MorphData } from "../three/ParticleMorph";
import { LabelLayer, LabelProjector, useLabelRefs, type LabelItem } from "../three/Labels";
import {
  barChartPoint, chaosCloud, fillColors, gauss, inSphere, perParticle, positions, rng, TAU, type Rand,
} from "../three/shapes";

/**
 * Módulo 05 (antes 05 + 06): las 5 V del Big Data junto con el procesamiento.
 * Cada etapa une una V con un paso del procesamiento:
 *   Volume + Raw data      → nube que crece (contador)
 *   Velocity + Filter      → giro rápido; algunas partículas se vuelven rojas y se descartan
 *   Variety + Normalize    → primero la rejilla (normalizar), luego los 6 formatos
 *   Veracity + Analyze     → primero se apartan los datos sospechosos, luego aparecen ondas (patrones)
 *   Value + Information    → gráfica de barras
 */

const progress = createProgress();
const ID = "five-vs";

const STEPS = ["Volume · Raw data", "Velocity · Filter", "Variety · Normalize", "Veracity · Analyze", "Value · Information"];
const NOTES = [
  "Volume y Raw data: enormes cantidades de información que llegan tal cual, desordenadas, duplicadas e incompletas. Cada segundo se suman miles de registros.",
  "Velocity y Filter: los datos se generan y deben procesarse a gran velocidad; mientras tanto se descartan los registros erróneos, vacíos o duplicados (en rojo).",
  "Variety y Normalize: texto, imágenes, ventas, eventos, ubicaciones y sensores. Primero se llevan a un mismo formato y escala; después se distingue cada tipo.",
  "Veracity y Analyze: no todos los datos son confiables, así que se apartan los dudosos; al comparar el resto aparecen patrones y tendencias.",
  "Value e Information: los datos organizados forman una estructura clara, lista para usarse y con valor para decidir.",
];

// ───────── Línea de tiempo (progreso de scroll 0–1) ─────────

/** Etapa activa (0–4) para las píldoras, los textos y el número grande. */
const STEP_BOUNDS = [0.2, 0.4, 0.65, 0.87];
const stepOf = (p: ModuleProgress) => STEP_BOUNDS.filter((b) => p.stage >= b).length;

/**
 * Forma (estado del sistema de partículas) según el scroll. Entre cada par de
 * claves la forma se mantiene un rato y luego se transforma en la siguiente.
 *   0 nube · 1 nube (velocidad) · 2 rejilla · 3 formatos · 4 sospechosos aparte · 5 ondas · 6 barras
 */
const SHAPE_KEYS: [number, number][] = [
  [0.0, 0], [0.2, 0], [0.24, 1], [0.4, 1], [0.45, 2], [0.53, 2], [0.58, 3], [0.65, 3],
  [0.7, 4], [0.77, 4], [0.82, 5], [0.87, 5], [0.93, 6], [1, 6],
];
function shapeOf(p: ModuleProgress) {
  const v = p.stage;
  for (let i = 1; i < SHAPE_KEYS.length; i++) {
    const [p0, s0] = SHAPE_KEYS[i - 1];
    const [p1, s1] = SHAPE_KEYS[i];
    if (v <= p1) return s0 + (s1 - s0) * smooth((v - p0) / (p1 - p0 || 1));
  }
  return SHAPE_KEYS[SHAPE_KEYS.length - 1][1];
}

// ───────── Formas ─────────

// Variedad: seis tipos de datos, cada uno con su forma.
// Escritorio: cuadrícula 3 × 2. Móvil: 2 columnas × 3 filas.
const TYPES = ["texto", "imágenes", "ventas", "eventos", "ubicaciones", "sensores"];
type Cell = (k: number) => [number, number];
const CELL_WIDE: Cell = (k) => [[-2.8, 0, 2.8][k % 3], k < 3 ? 1.15 : -1.2];
const CELL_TALL: Cell = (k) => [k % 2 === 0 ? -1.45 : 1.45, [2.35, 0.1, -2.15][Math.floor(k / 2)]];

function typeShape(k: number, r: Rand, CELL: Cell): [number, number, number] {
  const [cx, cy] = CELL(k);
  let x = 0, y = 0;
  switch (k) {
    case 0: { // texto: renglones
      const row = Math.floor(r() * 5);
      const len = [1.5, 1.2, 1.55, 0.9, 1.3][row];
      x = -0.78 + r() * len; y = 0.42 - row * 0.21; break;
    }
    case 1: // imágenes: bloque lleno
      x = (r() - 0.5) * 1.4; y = (r() - 0.5) * 0.95; break;
    case 2: { // ventas: barras
      const [bx, by] = barChartPoint(r, 5, 1.5, 1.0, -0.5);
      x = bx; y = by; break;
    }
    case 3: { // eventos: anillo
      const a = r() * TAU; const rad = 0.55 + gauss(r) * 0.04;
      x = Math.cos(a) * rad; y = Math.sin(a) * rad; break;
    }
    case 4: { // ubicaciones: puntos agrupados como en un mapa
      const pins: [number, number][] = [[-0.45, 0.2], [0.35, 0.3], [0.1, -0.3]];
      const [px, py] = pins[Math.floor(r() * 3)];
      x = px + gauss(r) * 0.16; y = py + gauss(r) * 0.16; break;
    }
    default: { // sensores: señal
      const t = r();
      x = -0.8 + t * 1.6; y = Math.sin(t * TAU * 2) * 0.32 + gauss(r) * 0.02;
    }
  }
  return [cx + x, cy + y, gauss(r) * 0.08];
}

/** Proporción de datos descartados en Filter (rojos) y de sospechosos en Veracity. */
const DROP_RATIO = 0.015;
const FLAG_RATIO = 0.08;

const makeBuild = (CELL: Cell, quarantineY: number, width: number) => (count: number): MorphData => {
  const r = rng(61);
  // Cada partícula es normal, descartada (Filter) o sospechosa (Veracity)
  const drops = perParticle(count, () => (r() < DROP_RATIO ? 1 : 0));
  const flags = perParticle(count, (i) => (!drops[i] && r() < FLAG_RATIO / (1 - DROP_RATIO) ? 1 : 0));

  // Volume / Raw data: nube densa que crece
  const cloud = positions(count, () => {
    if (r() < 0.6) return inSphere(r, 2.5, 1.4);
    return chaosCloud(r, 5.6, 4.2, 3);
  });

  // Normalize: rejilla 3D regular
  const cols = 22, rows = 12;
  let slot = 0;
  const lattice = positions(count, (i) => {
    if (drops[i]) return [cloud[i * 3], cloud[i * 3 + 1], cloud[i * 3 + 2]];
    const s = slot++;
    const c = s % cols, rr = Math.floor(s / cols) % rows, d = Math.floor(s / (cols * rows)) % 6;
    const gap = width / cols;
    return [(c - (cols - 1) / 2) * gap, (rr - (rows - 1) / 2) * 0.26, (d - 2.5) * 0.24];
  });

  // Variety: seis formatos
  const variety = positions(count, (i) => typeShape(i % 6, r, CELL));

  // Veracity: los sospechosos se apartan en una franja inferior
  const quarantine = (): [number, number, number] => [-(width / 2) + r() * width, quarantineY + gauss(r) * 0.06, 0];
  const veracity = positions(count, (i) =>
    flags[i] ? quarantine() : [variety[i * 3], variety[i * 3 + 1], variety[i * 3 + 2]]
  );

  // Analyze: tres ondas (patrones); los sospechosos siguen apartados
  const waves = positions(count, (i) => {
    if (flags[i]) return [veracity[i * 3], veracity[i * 3 + 1], 0];
    const band = i % 3;
    const t = r();
    const x = -(width / 2) + t * width;
    const y = (band - 1) * 1.15 + Math.sin(t * TAU * (1 + band * 0.5) + band) * 0.42 + gauss(r) * 0.05;
    return [x, y, gauss(r) * 0.12];
  });

  // Value / Information: gráfica de barras ascendente
  const value = positions(count, (i) =>
    flags[i] ? [veracity[i * 3], veracity[i * 3 + 1], 0] : barChartPoint(r, 8, width, 3.7, -2.05)
  );

  return {
    states: [cloud, cloud, lattice, variety, veracity, waves, value],
    colors: fillColors(count, () => 1.4 + r() * 1.2),
    colors2: fillColors(count, (i) => [0, 1, 2, 3, 1.5, 2.5][i % 6]),
    sizes: perParticle(count, (i) => [0.7, 1.5, 1.0, 2.0, 1.2, 0.6][i % 6] * (0.7 + r() * 0.6)),
    flags,
    drops,
  };
};

const QUARANTINE_WIDE = -2.7;
const QUARANTINE_TALL = -3.75;
const buildWide = makeBuild(CELL_WIDE, QUARANTINE_WIDE, 6.2);
const buildTall = makeBuild(CELL_TALL, QUARANTINE_TALL, 5.8);

// ───────── Textos sobre la escena ─────────

// "Volume": de 1,000 a 1,000,000 en escala logarítmica
const volumeText = (p: ModuleProgress) => {
  const v = Math.pow(10, 3 + 3 * range(p.stage, 0.0, 0.17));
  const unit = Math.pow(10, Math.floor(Math.log10(v)) - 1);
  return (Math.round(v / unit) * unit).toLocaleString("es-MX");
};

const bigNumber = (p: ModuleProgress) => {
  switch (stepOf(p)) {
    case 0: return volumeText(p);
    case 1: return `×${Math.round(1 + 49 * range(p.stage, 0.2, 0.33))} eventos/s`;
    case 2: return "6 formatos";
    case 3: return "8 % dudosos";
    default: return "+ valor";
  }
};

const makeLabels = (CELL: Cell, quarantineY: number): LabelItem[] => [
  ...TYPES.map((text, k) => {
    const [cx, cy] = CELL(k);
    return { text, position: [cx, cy + 0.82, 0] as [number, number, number], className: "bd-label--plain" };
  }),
  { text: "datos dudosos", position: [0, quarantineY - 0.35, 0] },
  { text: "descartados", position: [0, 2.9, 0] },
];
const LABELS_WIDE = makeLabels(CELL_WIDE, QUARANTINE_WIDE);
const LABELS_TALL = makeLabels(CELL_TALL, QUARANTINE_TALL);

// Descarte más largo: los rojos se ven un buen rato antes de salir despedidos
const dropOf = (p: ModuleProgress) => range(p.stage, 0.23, 0.39);

const labelOpacity = (i: number) => {
  const sh = shapeOf(progress);
  const f = fadeInOut(progress.view);
  // Tipos: visibles mientras los datos forman los 6 formatos (también en Veracity)
  if (i < TYPES.length) return range(sh, 2.6, 3) * (1 - range(sh, 4.3, 4.8)) * f;
  // "datos dudosos": desde Veracity hasta el final
  if (i === TYPES.length) return range(sh, 3.6, 4) * f;
  // "descartados": solo mientras salen despedidos los rojos
  const d = dropOf(progress);
  return range(d, 0.05, 0.3) * (1 - range(d, 0.75, 1)) * f;
};

export default function FiveVsModule() {
  const tier = useDeviceTier();
  const labels = useLabelRefs();
  const portrait = usePortrait();
  const LABELS = portrait ? LABELS_TALL : LABELS_WIDE;

  return (
    <ModuleShell
      id={ID}
      index="05"
      eyebrow="Las 5 V del Big Data · Procesamiento"
      title="De datos crudos a valor"
      description={<p>Antes de generar valor, los datos deben limpiarse, transformarse y analizarse.</p>}
      layout="wide"
      fullBleed
      height={440}
      progress={progress}
      aside={<StepList steps={STEPS} />}
      scene={
        <SceneRig
          fitWidth={9.2}
          fitHeight={6.6}
          progress={progress}
          parallax={0.5}
          portrait={{ fit: [6.8, 9] }}
          // Volume: la cámara se acerca al círculo a medida que sube el contador
          // y en Velocity vuelve al encuadre normal
          zoom={(p) => {
            const vol = range(p.stage, 0.03, 0.17);
            const back = range(p.stage, 0.2, 0.3);
            // En escritorio menos zoom: el área de la escena es baja y recortaría el círculo
            return 1 - (portrait ? 0.45 : 0.3) * vol * (1 - back);
          }}
        >
          <ParticleMorph
            build={portrait ? buildTall : buildWide}
            count={scaledCount(16000, tier)}
            progress={progress}
            drive={(p) => {
              const sh = shapeOf(p);
              // Velocity: acelera y frena dentro de su etapa
              // Velocity: el giro acelera a la par que el contador "×eventos/s" (mismo tramo, 0.2–0.33)
              // y frena al salir de la etapa
              const ramp = Math.min(1, Math.max(0, (p.stage - 0.2) / 0.13));
              const speed = (ramp * ramp) * (1 - range(p.stage, 0.36, 0.42));
              // Veracity: los sospechosos se marcan (tiemblan, parpadean, en rojo) y se apartan
              const veracity = range(sh, 3.3, 3.7);
              // Volume: el círculo y cada partícula crecen a la par que el contador
              // (mismo tramo que volumeText); después vuelven poco a poco al tamaño normal
              const vol = range(p.stage, 0.0, 0.17);
              const settle = range(p.stage, 0.22, 0.32);
              return {
                spread: 0.32 + 0.68 * vol,
                // Velocity · Filter: puntos más grandes para que se noten (vuelven a 1 en Variety)
                pointScale:
                  ((0.45 + 1.05 * vol) * (1 - settle) + settle) *
                  (1 + 1.6 * range(p.stage, 0.2, 0.26) * (1 - range(p.stage, 0.4, 0.46))),
                stage: sh,
                reveal: 0.004 + 0.996 * Math.pow(range(p.stage, 0.0, 0.17), 1.6),
                swirl: 0.08 + speed * 3.6,
                swirlMix: 1 - range(sh, 1.1, 1.8),
                drift: 0.4 + speed * 2.4,
                noise: 0.05 + speed * 0.08 - range(sh, 1.4, 2) * 0.04,
                sizeVar: 0.3 + 0.7 * range(sh, 2.4, 3),
                colorMix: range(sh, 2.4, 3),
                drop: dropOf(p),
                flagJitter: veracity * (1 - range(sh, 3.85, 4)),
                flagBlink: veracity,
                flagColor: veracity,
                flagSize: veracity * 0.4,
                flagFade: range(sh, 5.4, 5.95) * 0.7,
                fade: fadeInOut(p.view),
              };
            }}
          />
          <LabelProjector items={LABELS} refs={labels} opacity={labelOpacity} />
          <StepDriver scope={ID} progress={progress} stageOf={stepOf} notes={NOTES} />
          <TextDriver selector={`#${ID} .bd-big-number`} progress={progress} text={bigNumber} />
        </SceneRig>
      }
      overlay={
        <>
          <LabelLayer items={LABELS} refs={labels} />
          <div className="bd-big-number">1,000</div>
        </>
      }
    />
  );
}

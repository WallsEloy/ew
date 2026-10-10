"use client";

import ModuleShell from "../core/ModuleShell";
import { useDeviceTier, usePortrait } from "../core/env";
import { createProgress, fadeInOut, range } from "../core/progress";
import { scaledCount } from "../bigDataConfig";
import SceneRig from "../three/SceneRig";
import ParticleMorph, { type MorphData } from "../three/ParticleMorph";
import ParticleStream from "../three/ParticleStream";
import { LabelLayer, LabelProjector, useLabelRefs, type LabelItem } from "../three/Labels";
import { fillColors, inSphere, perParticle, positions, rng } from "../three/shapes";

const progress = createProgress();

const NAMES = ["Web", "Apps", "CRM", "Ventas", "Redes sociales", "Sensores"];
const SOURCE_COLORS = [1, 2, 3, 1, 3, 2];
type Vec3 = [number, number, number];

interface Layout {
  sources: Vec3[];
  target: Vec3;
  labels: LabelItem[];
  offset: Vec3;
  fit: [number, number];
  /** Curvatura de los flujos (ParticleStream). */
  bend: number;
}

function makeLayout(
  sources: Vec3[], target: Vec3, labelOf: (s: Vec3) => Vec3, dataLabel: Vec3, offset: Vec3, fit: [number, number], bend: number
): Layout {
  return {
    sources,
    target,
    offset,
    fit,
    bend,
    labels: [
      ...NAMES.map((text, i) => ({ text, position: labelOf(sources[i]) })),
      { text: "DATA", position: dataLabel, className: "bd-label--strong" },
    ],
  };
}

// Escritorio: las 6 fuentes alineadas en una fila arriba → los flujos bajan hasta DATA.
const WIDE = makeLayout(
  NAMES.map((_, i) => [-5 + i * 2, 3, 0]),
  [0, -1.3, 0],
  (s) => [s[0], s[1] + 0.5, s[2]],
  [0, -3.6, 0],
  [0, 0.2, 0],
  [12.4, 8.2],
  0
);

// Móvil: dos filas de 3 fuentes alineadas en horizontal → los flujos bajan hasta DATA.
// La fila de arriba va más alta y más abierta para que sus flujos pasen entre
// las etiquetas de la segunda fila en lugar de juntarse con ellas.
const TALL = makeLayout(
  // Segunda fila más abierta (4): con 2.6 "Redes sociales" se encimaba con sus vecinas
  NAMES.map((_, i) => (i < 3 ? [(i % 3) * 3 - 3, 5.1, 0] : [(i % 3) * 4 - 4, 2.3, 0])),
  [0, -2.5, 0],
  (s) => [s[0], s[1] + 0.45, s[2]],
  [0, -5, 0],
  [0, -0.3, 0],
  // Alto 14.2 (antes 12.6): con la escena ampliada en móvil, la fila de arriba se cortaba
  [8, 14.2],
  0
);

/** Núcleo donde se acumulan los datos: crece a medida que llegan. */
const buildCore = (count: number): MorphData => {
  const r = rng(21);
  return {
    states: [positions(count, () => inSphere(r, 0.75, 2.2))],
    colors: fillColors(count, () => r() * 3),
    sizes: perParticle(count, () => 0.5 + Math.pow(r(), 3) * 1.5),
  };
};

const labelOpacity = (i: number) => {
  const f = fadeInOut(progress.view);
  if (i === NAMES.length) return range(progress.stage, 0.35, 0.55) * f;
  return range(progress.stage, 0.02 + i * 0.05, 0.12 + i * 0.05) * f;
};

export default function DataStreamsModule() {
  const tier = useDeviceTier();
  const labels = useLabelRefs();
  const L = usePortrait() ? TALL : WIDE;

  return (
    <ModuleShell
      id="data-streams"
      index="02"
      eyebrow="Data Streams"
      title="Los datos nunca llegan de un solo lugar"
      description={
        <p>
          Cada interacción genera información. Cuando múltiples sistemas producen datos constantemente aparecen
          los Data Streams.
        </p>
      }
      layout="wide"
      height={180}
      progress={progress}
      scene={
        <SceneRig fitWidth={L.fit[0]} fitHeight={L.fit[1]} progress={progress} parallax={0.6}>
          <group position={L.offset}>
            <ParticleStream
              sources={L.sources}
              target={L.target}
              sourceColors={SOURCE_COLORS}
              count={scaledCount(6000, tier)}
              progress={progress}
              spread={0.45}
              bend={L.bend}
              drive={(p) => ({
                flow: 0.08 + range(p.stage, 0.05, 0.75) * 0.92,
                speed: 0.8 + range(p.stage, 0.3, 0.9) * 1.2,
                fade: fadeInOut(p.view),
              })}
            />
            <group position={L.target}>
              <ParticleMorph
                build={buildCore}
                count={scaledCount(2600, tier)}
                progress={progress}
                drive={(p) => {
                  // DATA crece con el scroll: más partículas, más grande y puntos más gruesos
                  const g = range(p.stage, 0.05, 0.95);
                  return {
                    noise: 0.05,
                    drift: 0.5,
                    swirl: 0.25,
                    reveal: 0.05 + g * 0.95,
                    spread: 0.3 + 2.2 * g,
                    pointScale: 0.7 + 0.8 * g,
                    fade: fadeInOut(p.view),
                  };
                }}
              />
            </group>
            <LabelProjector items={L.labels} refs={labels} opacity={labelOpacity} />
          </group>
        </SceneRig>
      }
      overlay={<LabelLayer items={L.labels} refs={labels} />}
    />
  );
}

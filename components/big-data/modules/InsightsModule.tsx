"use client";

import ModuleShell from "../core/ModuleShell";
import { useDeviceTier } from "../core/env";
import { StepDriver, StepList, TextDriver } from "../core/Steps";
import { createProgress, fadeInOut, heldStage, range, type ModuleProgress } from "../core/progress";
import { scaledCount } from "../bigDataConfig";
import SceneRig from "../three/SceneRig";
import ParticleMorph, { type MorphData } from "../three/ParticleMorph";
import { chaosCloud, fillColors, gauss, perParticle, positions, rng, TAU, trendPoint } from "../three/shapes";

const progress = createProgress();
const ID = "insights";

const STEPS = ["Data", "Pattern", "Insight", "Decision"];
const NOTES = [
  "Data: miles de registros sin orden aparente.",
  "Pattern: al analizarlos aparecen comportamientos que se repiten.",
  "Insight: el patrón revela algo útil, por ejemplo una tendencia de crecimiento.",
  "Decision: con esa información se elige el siguiente paso con menos incertidumbre.",
];

const stageOf = (p: ModuleProgress) => heldStage(p.stage, 4, 0.5);

/** Flecha ascendente: el cuerpo en diagonal y la punta en el extremo. */
function arrowPoint(r: () => number): [number, number, number] {
  const from = [-2.8, -1.7], to = [2.4, 1.6];
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  const nx = -uy, ny = ux;
  if (r() < 0.7) {
    const t = r() * 0.86;
    const w = (r() - 0.5) * 0.36;
    return [from[0] + dx * t + nx * w, from[1] + dy * t + ny * w, gauss(r) * 0.06];
  }
  // Punta: triángulo
  const a = r(), b = r() * (1 - a);
  const back = 1.1, half = 0.75;
  const bx = to[0] - ux * back, by = to[1] - uy * back;
  const p1 = [bx + nx * half, by + ny * half], p2 = [bx - nx * half, by - ny * half];
  return [to[0] + (p1[0] - to[0]) * a + (p2[0] - to[0]) * b, to[1] + (p1[1] - to[1]) * a + (p2[1] - to[1]) * b, gauss(r) * 0.05];
}

const buildInsights = (count: number): MorphData => {
  const r = rng(101);
  return {
    states: [
      positions(count, () => chaosCloud(r, 7, 4.4, 3)),
      positions(count, (i) => {
        // Cuatro cintas onduladas: comportamientos que se repiten
        const band = i % 4;
        const t = r();
        return [
          -3.2 + t * 6.4,
          (band - 1.5) * 0.95 + Math.sin(t * TAU * 1.5 + band * 0.9) * 0.35 + gauss(r) * 0.04,
          gauss(r) * 0.15,
        ];
      }),
      positions(count, () => trendPoint(r, 6.2, 3.5, -1.9)),
      positions(count, () => arrowPoint(r)),
    ],
    colors: fillColors(count, () => r() * 3),
    colors2: fillColors(count, () => 1 + r() * 1.2),
    sizes: perParticle(count, () => 0.6 + Math.pow(r(), 3) * 1.2),
  };
};

export default function InsightsModule() {
  const tier = useDeviceTier();

  return (
    <ModuleShell
      id={ID}
      index="08"
      eyebrow="Insights"
      title="Del caos a una decisión"
      description={
        <p>
          El objetivo de Big Data no es acumular información. Es encontrar patrones que permitan tomar mejores
          decisiones.
        </p>
      }
      layout="wide"
      height={280}
      progress={progress}
      aside={<StepList steps={STEPS} />}
      scene={
        <SceneRig fitWidth={7.6} fitHeight={5.2} progress={progress} parallax={0.6} portrait={{ scale: [0.62, 1.55] }}>
          <ParticleMorph
            build={buildInsights}
            count={scaledCount(10000, tier)}
            progress={progress}
            drive={(p) => {
              const st = stageOf(p);
              return {
                stage: st,
                noise: 0.12 * (1 - range(st, 0.3, 1)) + 0.012,
                drift: 0.5,
                swirl: 0.06 * (1 - range(st, 0.2, 0.8)),
                swirlMix: 1 - range(st, 0.2, 0.8),
                colorMix: range(st, 1.5, 2),
                fade: fadeInOut(p.view),
              };
            }}
          />
          <StepDriver scope={ID} progress={progress} stageOf={stageOf} notes={NOTES} />
          <TextDriver
            selector={`#${ID} .bd-big-number`}
            progress={progress}
            opacity={(p) => range(stageOf(p), 1.6, 2) * fadeInOut(p.view)}
          />
        </SceneRig>
      }
      overlay={<div className="bd-big-number" style={{ opacity: 0 }}>+38 %</div>}
    />
  );
}

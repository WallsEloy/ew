"use client";

import { useEffect, useMemo, useState } from "react";

import ModuleShell from "../core/ModuleShell";
import { useDeviceTier } from "../core/env";
import { StepDriver, StepList } from "../core/Steps";
import { createProgress, fadeInOut, heldStage, range, type ModuleProgress } from "../core/progress";
import { scaledCount } from "../bigDataConfig";
import SceneRig from "../three/SceneRig";
import ParticleMorph, { type MorphData } from "../three/ParticleMorph";
import { fillColors, gauss, inSphere, perParticle, positions, rng, TAU } from "../three/shapes";

const progress = createProgress();
const ID = "final-transformation";

const STEPS = ["Data", "Processing", "Patterns", "Insights", "Intelligence"];
const NOTES = [
  "Data: millones de puntos dispersos.",
  "Processing: se reúnen, se limpian y se ordenan.",
  "Patterns: aparece una estructura.",
  "Insights: la estructura empieza a decir algo.",
  "Intelligence: información convertida en decisiones.",
];

const stageOf = (p: ModuleProgress) => heldStage(p.stage, 5, 0.45);

const buildFinal = (count: number): MorphData => {
  const r = rng(111);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const sphere = positions(count, (i) => {
    // Esfera de Fibonacci: reparto perfectamente uniforme (orden)
    const y = 1 - ((i + 0.5) / count) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = i * golden;
    return [Math.cos(th) * rad * 2.1, y * 2.1, Math.sin(th) * rad * 2.1];
  });
  return {
    states: [
      // Dispersión total
      positions(count, () => {
        const [x, y, z] = inSphere(r, 1, 0.3);
        const k = 4 + r() * 4;
        return [x * k * 1.4, y * k * 0.8, z * k];
      }),
      // Vórtice de procesamiento
      positions(count, () => {
        const a = r() * TAU;
        const rad = 0.6 + Math.pow(r(), 0.6) * 2.4;
        return [Math.cos(a) * rad, gauss(r) * 0.12 * rad, Math.sin(a) * rad];
      }),
      sphere,
      // Hélice ascendente
      positions(count, (i) => {
        const t = r();
        const strand = i % 2;
        const a = t * TAU * 3 + strand * Math.PI;
        return [Math.cos(a) * 1.5 + gauss(r) * 0.08, -2.2 + t * 4.4, Math.sin(a) * 1.5 + gauss(r) * 0.08];
      }),
      // Inteligencia: el isotipo (se reemplaza al cargar el logo; esfera densa mientras tanto)
      positions(count, () => inSphere(r, 1.6, 2)),
    ],
    colors: fillColors(count, () => r() * 3),
    colors2: fillColors(count, () => 1.6 + r() * 1.4),
    sizes: perParticle(count, () => 0.6 + Math.pow(r(), 3) * 1.2),
  };
};

/**
 * Muestrea el isotipo EW (/SVG/ew_isotipo.svg) y devuelve posiciones 3D para
 * `count` partículas. El isotipo es una pieza sólida (contorno crema y relleno
 * negro), así que se toman los píxeles oscuros: las letras EW y el marco.
 */
function useLogoPoints(count: number) {
  const [points, setPoints] = useState<Float32Array | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const w = 720;
      const h = Math.round((w * img.naturalHeight) / img.naturalWidth) || 164;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      const iconW = w;
      const data = ctx.getImageData(0, 0, iconW, h).data;
      const hits: [number, number][] = [];
      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < iconW; x += 1) {
          const i = (y * iconW + x) * 4;
          const luz = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (data[i + 3] > 120 && luz < 110) hits.push([x, y]);
        }
      }
      if (!hits.length) return;
      const r = rng(112);
      const scale = 4.6 / iconW;
      const out = positions(count, () => {
        const [x, y] = hits[Math.floor(r() * hits.length)];
        return [(x - iconW / 2) * scale + gauss(r) * 0.02, (h / 2 - y) * scale + gauss(r) * 0.02, gauss(r) * 0.12];
      });
      setPoints(out);
    };
    img.src = "/SVG/ew_isotipo.svg";
    return () => {
      cancelled = true;
    };
  }, [count]);

  return points;
}

export default function FinalTransformationModule() {
  const tier = useDeviceTier();
  const count = scaledCount(14000, tier);
  const logo = useLogoPoints(count);
  const lateState = useMemo(() => ({ index: 4, positions: logo }), [logo]);

  return (
    <ModuleShell
      id={ID}
      index="09"
      eyebrow="Transformación final"
      title="De datos a inteligencia"
      description={
        <p>
          Todo el recorrido en una sola secuencia: datos que se procesan, forman patrones, generan insights y se
          convierten en inteligencia para decidir.
        </p>
      }
      layout="wide"
      height={320}
      progress={progress}
      aside={<StepList steps={STEPS} />}
      scene={
        <SceneRig fitWidth={6.6} fitHeight={5.2} progress={progress} parallax={0.6}>
          <ParticleMorph
            build={buildFinal}
            count={count}
            progress={progress}
            lateState={lateState}
            drive={(p) => {
              const st = stageOf(p);
              const vortex = range(st, 0.4, 1) * (1 - range(st, 1.4, 1.9));
              return {
                stage: st,
                noise: 0.1 * (1 - range(st, 0.5, 1.2)) + 0.012,
                drift: 0.45,
                swirl: 0.05 + vortex * 1.2,
                swirlMix: 1 - range(st, 1.4, 1.9),
                colorMix: range(st, 3.4, 4),
                fade: fadeInOut(p.view),
              };
            }}
          />
          <StepDriver scope={ID} progress={progress} stageOf={stageOf} notes={NOTES} />
        </SceneRig>
      }
    />
  );
}

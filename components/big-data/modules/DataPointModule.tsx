"use client";

import * as THREE from "three";

import ModuleShell from "../core/ModuleShell";
import { useDeviceTier } from "../core/env";
import { createProgress, fadeInOut, range, type ModuleProgress } from "../core/progress";
import { scaledCount } from "../bigDataConfig";
import SceneRig from "../three/SceneRig";
import ParticleMorph, { type MorphData } from "../three/ParticleMorph";
import ParticleInflow from "../three/ParticleInflow";
import ParticleGraph from "../three/ParticleGraph";
import { LabelLayer, LabelProjector, useLabelRefs, type LabelItem } from "../three/Labels";
import { fillColors } from "../three/shapes";

const progress = createProgress();

const LABELS: LabelItem[] = ["compra", "clic", "ubicación", "edad", "tiempo", "interacción"].map((text, i, all) => {
  const a = (i / all.length) * Math.PI * 2 + 0.3;
  return { text, position: [Math.cos(a) * 2.4, Math.sin(a) * 1.7, Math.sin(a * 2) * 0.4] };
});

// Líneas punteadas del punto central a cada etiqueta (los trazos avanzan hacia el centro)
const CONNECTORS = new Float32Array(LABELS.flatMap((l) => [0, 0, 0, l.position[0] * 0.82, l.position[1] * 0.82, l.position[2] * 0.82]));

// Color del punto central
const CORE_COLOR = new THREE.Color("#7b3fe4");
/** Radio (unidades de escena) del círculo central: ahí desaparecen los puntos. */
const CORE_RADIUS = 0.36;
/** Segundos que tarda cada punto en llegar al centro [mín, máx]: animación lenta. */
const INFLOW_DURATION: [number, number] = [22, 40];

/** El Data Point: un círculo violeta sólido, con pulso. */
const buildCore = (): MorphData => ({
  states: [new Float32Array([0, 0, 0])],
  colors: fillColors(1, () => CORE_COLOR),
  sizes: new Float32Array([1]),
});

const labelOpacity = (i: number) => range(progress.stage, 0.12 + i * 0.07, 0.24 + i * 0.07) * fadeInOut(progress.view);

export default function DataPointModule() {
  const tier = useDeviceTier();
  const labels = useLabelRefs();

  return (
    <ModuleShell
      id="data-point"
      index="01"
      eyebrow="Data Point"
      title="Todo comienza con un Data Point"
      description={
        <p>
          Un Data Point es una observación individual: una compra, un clic, una ubicación, una lectura o
          cualquier evento que pueda convertirse en información.
        </p>
      }
      height={170}
      progress={progress}
      scene={
        <SceneRig fitWidth={6.4} fitHeight={4.6} progress={progress} portrait={{ rotate: true }}>
          {/* Puntos que viajan lentamente hacia el centro y desaparecen en él */}
          <ParticleInflow
            count={scaledCount(1400, tier)}
            progress={progress}
            fade={(p) => fadeInOut(p.view)}
            coreRadius={CORE_RADIUS}
            duration={INFLOW_DURATION}
            size={2.6}
          />
          <ParticleGraph
            segments={CONNECTORS}
            progress={progress}
            drive={(p) => ({ reveal: range(p.stage, 0.1, 0.55), opacity: fadeInOut(p.view) })}
            dashed={{ dash: 0.11, gap: 0.08, speed: 0.25 }}
          />
          {/* El círculo va después para quedar encima de los puntos que llegan */}
          <ParticleMorph
            build={buildCore}
            count={1}
            progress={progress}
            size={44}
            solid
            drive={(p: ModuleProgress, t) => ({
              // Sin deriva: el punto queda fijo en el centro
              noise: 0,
              sizeVar: 0.85 + Math.sin(t * 1.6) * 0.15,
              fade: fadeInOut(p.view),
            })}
          />
          <LabelProjector items={LABELS} refs={labels} opacity={labelOpacity} />
        </SceneRig>
      }
      overlay={<LabelLayer items={LABELS} refs={labels} />}
    />
  );
}

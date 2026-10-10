"use client";

import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import ModuleShell from "../core/ModuleShell";
import { motion, useDeviceTier } from "../core/env";
import { createProgress, fadeInOut, range } from "../core/progress";
import { BIG_DATA_CONFIG, particleBlending, scaledCount } from "../bigDataConfig";
import SceneRig from "../three/SceneRig";
import { viewRect } from "../core/viewRegistry";
import { LabelLayer, LabelProjector, useLabelRefs, type LabelItem } from "../three/Labels";
import ParticleRings from "../../saturn/ParticleRings";
import SaturnCore from "../../saturn/SaturnCore";

const progress = createProgress();
const DEG = Math.PI / 180;

const PLANET_RADIUS = 1.2;
const RING_INNER = 1.3;
const RING_OUTER = 2.6;
const LIGHT: [number, number, number] = [-6, 3, 4];

// Cada anillo representa una fuente: etiquetas repartidas por radio y ángulo
const SOURCES = ["CRM", "Web", "Ads", "Social", "Ventas", "IoT", "Apps"];
const LABELS: LabelItem[] = SOURCES.map((text, i) => {
  const t = i / (SOURCES.length - 1);
  const r = PLANET_RADIUS * (RING_INNER + 0.1 + t * (RING_OUTER - RING_INNER - 0.15));
  const a = -0.4 + i * 0.95;
  return { text, position: [Math.cos(a) * r, 0, Math.sin(a) * r] };
});

/** Inclina el sistema con el scroll: de canto → vista principal → desde arriba. */
function Tilt({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const s = progress.stage;
    const tilt = 4 + range(s, 0.0, 0.45) * 22 + range(s, 0.6, 1) * 22;
    g.rotation.x += (tilt * DEG - g.rotation.x) * 0.08;
    const scale = 0.82 + range(s, 0, 0.45) * 0.18;
    g.scale.setScalar(g.scale.x + (scale - g.scale.x) * 0.08);
  });
  return (
    <group rotation={[0, 0, -12 * DEG]}>
      <group ref={ref} rotation={[4 * DEG, 0, 0]}>
        {children}
      </group>
    </group>
  );
}

/** Rectángulo de la vista del módulo (efecto táctil en móvil). */
const touchRect = () => viewRect(progress);

const labelOpacity = (i: number) => range(progress.stage, 0.25 + i * 0.05, 0.35 + i * 0.05) * fadeInOut(progress.view);

export default function BigDataModule() {
  const tier = useDeviceTier();
  const labels = useLabelRefs();
  const cfg = BIG_DATA_CONFIG;
  const motionScale = motion.reduced ? 0.25 : 1;

  return (
    <ModuleShell
      id="big-data"
      index="03"
      eyebrow="Big Data"
      title="Cuando los datos crecen, aparece Big Data"
      description={
        <p>
          Big Data surge cuando el volumen, velocidad y diversidad de la información superan las capacidades de
          procesamiento tradicionales.
        </p>
      }
      height={200}
      progress={progress}
      scene={
        <SceneRig fitWidth={7.4} fitHeight={5} progress={progress}>
          <Tilt>
            <SaturnCore
              radius={PLANET_RADIUS}
              particleCount={scaledCount(8000, tier)}
              colors={cfg.particleColor}
              rimColor={cfg.rimColor}
              atmosphereColor={cfg.atmosphereColor}
              glowIntensity={cfg.planetGlow}
              spin={0.08}
              lightDirection={LIGHT}
              segments={tier === "mobile" ? 32 : 48}
              motion={motionScale}
              blending={particleBlending}
              size={cfg.theme === "light" ? 2.4 : 1.3}
              // Sobre blanco la esfera necesita más cuerpo para leerse como planeta
              opacity={cfg.alphaBoost * (cfg.theme === "light" ? 1.8 : 1)}
              solid={false}
              avoid={null}
              avoidReach={1}
              touchRect={touchRect}
            />
            <ParticleRings
              count={cfg.orbitParticles[tier]}
              ringCount={cfg.orbitCount}
              planetRadius={PLANET_RADIUS}
              inner={RING_INNER}
              outer={RING_OUTER}
              bandGap={0.4}
              speed={cfg.orbitSpeed}
              size={1.2}
              colors={cfg.particleColor}
              motion={motionScale}
              blending={particleBlending}
              opacity={cfg.alphaBoost}
              solid={false}
              avoid={null}
              avoidReach={1}
              touchRect={touchRect}
            />
            <LabelProjector items={LABELS} refs={labels} opacity={labelOpacity} />
          </Tilt>
        </SceneRig>
      }
      overlay={<LabelLayer items={LABELS} refs={labels} />}
    />
  );
}

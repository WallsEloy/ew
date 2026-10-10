"use client";

import ModuleShell from "../core/ModuleShell";
import { useDeviceTier, usePortrait } from "../core/env";
import { createProgress, fadeInOut, range } from "../core/progress";
import { BIG_DATA_CONFIG, scaledCount } from "../bigDataConfig";
import SceneRig from "../three/SceneRig";
import ParticleMorph, { type MorphData } from "../three/ParticleMorph";
import { LabelLayer, LabelProjector, useLabelRefs, type LabelItem } from "../three/Labels";
import { fillColors, gauss, inSphere, perParticle, positions, rng, TAU } from "../three/shapes";

const progress = createProgress();

const NAMES = [
  "Cluster A · Clientes frecuentes",
  "Cluster B · Clientes nuevos",
  "Cluster C · Clientes en riesgo",
  "Cluster D · Clientes de alto valor",
  "Cluster E · Clientes ocasionales",
  "Cluster F · Clientes inactivos",
];
const COUNT = Math.min(Math.max(BIG_DATA_CONFIG.clusterCount, 2), NAMES.length);

type Vec3 = [number, number, number];
const CLUSTER_COLORS = [1, 2, 3, 0, 1.5, 2.5];

// Escritorio: centros repartidos en una elipse para que cada grupo ocupe su zona
const CENTERS_WIDE: Vec3[] = Array.from({ length: COUNT }, (_, k) => {
  const a = (k / COUNT) * TAU + Math.PI / 4;
  return [Math.cos(a) * 2.7, Math.sin(a) * 1.35, Math.sin(a * 2) * 0.5];
});
// Móvil: grupos en columna a la izquierda, etiquetas a su derecha
const CENTERS_TALL: Vec3[] = Array.from({ length: COUNT }, (_, k) => [-1.35, 2.6 - (k * 5.2) / (COUNT - 1), 0]);

const makeBuild = (CENTERS: Vec3[], cloud: Vec3, spreadBase: number) => (count: number): MorphData => {
  const r = rng(81);
  return {
    states: [
      positions(count, () => {
        const [x, y, z] = inSphere(r, 2.9, 0.8);
        return [x * cloud[0], y * cloud[1], z * cloud[2]];
      }),
      positions(count, (i) => {
        const c = CENTERS[i % COUNT];
        // Grupo compacto con algo de dispersión (datos parecidos, no idénticos)
        const spread = spreadBase + (i % COUNT) * 0.04;
        return [c[0] + gauss(r) * spread, c[1] + gauss(r) * spread * 0.85, c[2] + gauss(r) * spread];
      }),
    ],
    colors: fillColors(count, () => 0.3 + r() * 0.6),
    colors2: fillColors(count, (i) => CLUSTER_COLORS[i % COUNT]),
    sizes: perParticle(count, () => 0.6 + Math.pow(r(), 3) * 1.3),
  };
};

const buildWide = makeBuild(CENTERS_WIDE, [1, 1, 1], 0.42);
const buildTall = makeBuild(CENTERS_TALL, [0.6, 1.15, 0.6], 0.26);

const LABELS_WIDE: LabelItem[] = CENTERS_WIDE.map((c, k) => ({
  text: NAMES[k],
  position: [c[0], c[1] + (c[1] >= 0 ? 0.95 : -0.95), c[2]],
}));
// Las etiquetas arrancan a la derecha de su grupo (alineadas al inicio): centradas,
// eran tan anchas que tapaban las partículas y el grupo parecía desaparecer
const LABELS_TALL: LabelItem[] = CENTERS_TALL.map((c, k) => ({
  text: NAMES[k],
  position: [c[0] + 0.62, c[1], c[2]],
  align: "start",
}));

const gather = () => range(progress.stage, 0.12, 0.7);
const labelOpacity = (i: number) => range(progress.stage, 0.62 + i * 0.04, 0.74 + i * 0.04) * fadeInOut(progress.view);

export default function ClusteringModule() {
  const tier = useDeviceTier();
  const labels = useLabelRefs();
  const portrait = usePortrait();
  const LABELS = portrait ? LABELS_TALL : LABELS_WIDE;

  return (
    <ModuleShell
      id="clustering"
      index="06"
      eyebrow="Clustering"
      title="Los datos parecidos se agrupan solos"
      description={
        <p>
          Los algoritmos pueden encontrar similitudes entre miles de Data Points y formar grupos automáticamente.
        </p>
      }
      layout="wide"
      height={230}
      progress={progress}
      scene={
        <SceneRig fitWidth={8.6} fitHeight={5.4} progress={progress} parallax={0.7} portrait={{ fit: [4.4, 7.2] }}>
          <ParticleMorph
            build={portrait ? buildTall : buildWide}
            count={scaledCount(9000, tier)}
            progress={progress}
            drive={(p) => ({
              stage: gather(),
              noise: 0.05,
              drift: 0.45,
              swirl: 0.04 * (1 - gather()),
              swirlMix: 1 - gather(),
              colorMix: range(p.stage, 0.3, 0.8),
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

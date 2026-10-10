"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import ModuleShell from "../core/ModuleShell";
import { motion, useDeviceTier, usePortrait } from "../core/env";
import { createProgress, fadeInOut, range } from "../core/progress";
import { scaledCount } from "../bigDataConfig";
import SceneRig from "../three/SceneRig";
import ParticleMorph, { type MorphData } from "../three/ParticleMorph";
import ParticleGraph from "../three/ParticleGraph";
import { LabelLayer, LabelProjector, useLabelRefs, type LabelItem } from "../three/Labels";
import { fillColors, gauss, inSphere, perParticle, rng } from "../three/shapes";

const progress = createProgress();

const HUB_NAMES = ["comportamiento", "recomendaciones", "relaciones sociales", "correlaciones", "fraude", "patrones"];
type Vec3 = [number, number, number];
const HUBS_WIDE: Vec3[] = [
  [0, 0, 0], [-2.1, 1.1, 0.6], [2.0, 1.2, -0.5], [-1.8, -1.3, -0.4], [2.2, -1.1, 0.5], [0.2, 1.9, -1.0],
];
// Móvil: la misma red girada a lo alto (x e y intercambiados)
const HUBS_TALL: Vec3[] = HUBS_WIDE.map(([x, y, z]) => [y * 0.95, x * 1.15, z]);

interface Graph {
  nodes: Float32Array;
  hubOf: number[];
  /** 1 si el nodo es un hub. */
  isHub: Uint8Array;
  segments: Float32Array;
}

/**
 * Grafo: nodos alrededor de 6 hubs; cada nodo se conecta a sus 3 vecinos más
 * cercanos y a su hub (no todos con todos). Los nodos se ordenan del centro
 * hacia fuera para que la red crezca progresivamente.
 */
function buildGraph(count: number, HUBS: Vec3[], spread: [number, number]): Graph {
  const r = rng(91);
  const pts: { p: [number, number, number]; hub: number }[] = [];
  for (let i = 0; i < count; i++) {
    const hub = i < HUBS.length ? i : Math.floor(r() * HUBS.length);
    const h = HUBS[hub];
    const p: [number, number, number] =
      i < HUBS.length ? [...h] : r() < 0.82
        ? [h[0] + gauss(r) * spread[0], h[1] + gauss(r) * spread[1], h[2] + gauss(r) * 0.6]
        : inSphere(r, 3, 1);
    pts.push({ p, hub });
  }
  pts.sort((a, b) => Math.hypot(...a.p) - Math.hypot(...b.p));

  const n = pts.length;
  const nodes = new Float32Array(n * 3);
  pts.forEach((pt, i) => nodes.set(pt.p, i * 3));

  const seg: number[] = [];
  const seen = new Set<string>();
  const link = (a: number, b: number) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a === b || seen.has(key)) return;
    seen.add(key);
    seg.push(...pts[a].p, ...pts[b].p);
  };
  const hubIndex = HUBS.map((h) => pts.findIndex((pt) => pt.p[0] === h[0] && pt.p[1] === h[1] && pt.p[2] === h[2]));
  for (let a = 0; a < n; a++) {
    const near: [number, number][] = [];
    for (let b = 0; b < n; b++) {
      if (a === b) continue;
      const d = Math.hypot(pts[a].p[0] - pts[b].p[0], pts[a].p[1] - pts[b].p[1], pts[a].p[2] - pts[b].p[2]);
      if (d < 0.9) near.push([d, b]);
    }
    // Cada nodo se une a sus 3 vecinos más cercanos
    near.sort((x, y) => x[0] - y[0]).slice(0, 3).forEach(([, b]) => link(a, b));
    if (r() < 0.5 && hubIndex[pts[a].hub] >= 0) link(a, hubIndex[pts[a].hub]);
  }
  // Algunos puentes entre hubs: relaciones entre comunidades
  [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 5], [3, 4]].forEach(([x, y]) => link(hubIndex[x], hubIndex[y]));

  const isHub = new Uint8Array(n);
  hubIndex.forEach((i) => {
    if (i >= 0) isHub[i] = 1;
  });
  return { nodes, hubOf: pts.map((p) => p.hub), isHub, segments: new Float32Array(seg) };
}

/** Giro lento de toda la red: en horizontal (eje Y) y en vertical (eje X). */
function Spin({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(delta, 0.1) * (motion.reduced ? 0.125 : 1);
    g.rotation.y += dt * 0.08;
    g.rotation.x += dt * 0.05;
  });
  return <group ref={ref}>{children}</group>;
}

const makeLabels = (HUBS: Vec3[]): LabelItem[] => HUBS.map((h, i) => ({ text: HUB_NAMES[i], position: [h[0], h[1] + 0.45, h[2]] }));
const LABELS_WIDE = makeLabels(HUBS_WIDE);
const LABELS_TALL = makeLabels(HUBS_TALL);
const labelOpacity = (i: number) => range(progress.stage, 0.45 + i * 0.05, 0.55 + i * 0.05) * fadeInOut(progress.view);

export default function RelationshipsModule() {
  const tier = useDeviceTier();
  const labels = useLabelRefs();
  const count = scaledCount(900, tier);
  const portrait = usePortrait();
  const LABELS = portrait ? LABELS_TALL : LABELS_WIDE;
  const graph = useMemo(
    () => (portrait ? buildGraph(count, HUBS_TALL, [0.55, 0.7]) : buildGraph(count, HUBS_WIDE, [0.75, 0.6])),
    [count, portrait]
  );

  const buildNodes = useMemo(
    () => (): MorphData => {
      const n = graph.nodes.length / 3;
      const r = rng(92);
      return {
        states: [graph.nodes],
        colors: fillColors(n, (i) => (graph.isHub[i] ? 3 : 1 + (graph.hubOf[i] % 3))),
        sizes: perParticle(n, (i) => (graph.isHub[i] ? 2.6 : 1 + r() * 0.8)),
        // Los nodos aparecen del centro hacia fuera, junto con sus conexiones
        order: perParticle(n, (i) => i / n),
      };
    },
    [graph]
  );

  return (
    <ModuleShell
      id="relationships"
      index="07"
      eyebrow="Relaciones entre datos"
      title="El valor está en las conexiones"
      description={
        <p>
          Un dato aislado puede decir poco. Su relación con otros datos puede revelar patrones importantes.
        </p>
      }
      layout="wide"
      fullBleed
      height={210}
      progress={progress}
      scene={
        <SceneRig fitWidth={6.8} fitHeight={5.4} progress={progress} tilt={[8, 0]} portrait={{ fit: [4.8, 6.8] }}>
          <Spin>
            <ParticleMorph
              build={buildNodes}
              count={count}
              progress={progress}
              size={3.4}
              drive={(p) => ({ noise: 0.02, drift: 0.4, reveal: 0.03 + range(p.stage, 0.05, 0.75) * 0.97, fade: fadeInOut(p.view) })}
            />
            <ParticleGraph
              segments={graph.segments}
              progress={progress}
              drive={(p) => ({ reveal: range(p.stage, 0.08, 0.85), opacity: 0.4 * fadeInOut(p.view) })}
            />
            <LabelProjector items={LABELS} refs={labels} opacity={labelOpacity} />
          </Spin>
        </SceneRig>
      }
      overlay={<LabelLayer items={LABELS} refs={labels} />}
    />
  );
}

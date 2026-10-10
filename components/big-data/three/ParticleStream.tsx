"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { BIG_DATA_CONFIG, particleBlending } from "../bigDataConfig";
import { motion } from "../core/env";
import type { ModuleProgress } from "../core/progress";
import { viewRect } from "../core/viewRegistry";
import { createTouchUniforms, touchGlsl, updateTouch } from "@/lib/touchAttract";
import { glowFragment, paletteGlsl, pointSizeGlsl } from "../shaders/particles";
import { rng } from "./shapes";

/**
 * Flujos de partículas desde varias fuentes hacia un destino. Cada partícula
 * recorre una curva (con carril, velocidad y ondulación propios) y vuelve a
 * empezar: el recorrido se calcula entero en el vertex shader.
 */

const MAX_SOURCES = 8;

const vertexShader = /* glsl */ `
  ${touchGlsl}
  ${pointSizeGlsl}
  ${paletteGlsl}
  uniform float uClock;
  uniform float uFlow;
  uniform float uFade;
  uniform float uBend;
  uniform vec3 uFrom[${MAX_SOURCES}];
  uniform vec3 uTo;

  attribute float aSource;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aLane;
  attribute float aSize;
  attribute float aColor;
  attribute float aOrder;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 a = uFrom[int(aSource)];
    vec3 b = uTo;
    float t = fract(aPhase + uClock * aSpeed);

    // Curva cuadrática con control desplazado: trayectorias que convergen
    vec3 mid = (a + b) * 0.5;
    vec3 dir = normalize(b - a);
    vec3 side = normalize(cross(dir, vec3(0.0, 0.0, 1.0)) + vec3(0.0001));
    vec3 ctrl = mid + side * uBend * (a.y - b.y) * 0.35;
    vec3 p = mix(mix(a, ctrl, t), mix(ctrl, b, t), t);

    // Carril propio que se estrecha al llegar + pequeña ondulación
    float lane = aLane * (1.0 - t * 0.85);
    p += side * lane + vec3(0.0, 0.0, aLane * 0.6 * (1.0 - t));
    p += side * sin(t * 18.0 + aPhase * 40.0) * 0.04;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = touchAttract(projectionMatrix * mv, fract(aPhase * 7.0));
    gl_PointSize = pointSize(aSize, mv);

    float vis = 1.0 - smoothstep(uFlow - 0.02, uFlow, aOrder);
    float ends = smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.9, 1.0, t));
    vColor = palette(aColor);
    vAlpha = vis * ends * uFade * (0.55 + 0.45 * fract(aPhase * 13.7));
  }
`;

export interface StreamDrive {
  /** 0–1: proporción de partículas activas. */
  flow: number;
  /** Multiplicador de velocidad. */
  speed?: number;
  fade?: number;
}

export interface ParticleStreamProps {
  sources: [number, number, number][];
  target: [number, number, number];
  count: number;
  progress: ModuleProgress;
  drive: (p: ModuleProgress) => StreamDrive;
  /** Índice de color (0–3) por fuente. */
  sourceColors?: number[];
  /** Ancho del carril de cada flujo. */
  spread?: number;
  /** Curvatura de las trayectorias. */
  bend?: number;
  size?: number;
  seed?: number;
}

export default function ParticleStream({
  sources, target, count, progress, drive, sourceColors, spread = 0.35, bend = 1, size = 1, seed = 7,
}: ParticleStreamProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dpr = useThree((s) => s.viewport.dpr);
  const clock = useRef(0);

  const geometry = useMemo(() => {
    const r = rng(seed);
    const n = count;
    const k = Math.min(sources.length, MAX_SOURCES);
    const attr = (len: number) => new Float32Array(len);
    const src = attr(n), phase = attr(n), speed = attr(n), lane = attr(n), sz = attr(n), col = attr(n), order = attr(n);
    for (let i = 0; i < n; i++) {
      const s = i % k;
      src[i] = s;
      phase[i] = r();
      // Cada fuente tiene su ritmo; cada partícula, una variación
      speed[i] = (0.08 + (s % 3) * 0.035) * (0.75 + r() * 0.5);
      lane[i] = (r() - 0.5) * spread * (0.6 + (s % 2) * 0.6);
      sz[i] = 0.6 + Math.pow(r(), 3) * 1.6;
      col[i] = sourceColors?.[s] ?? (s % 4);
      order[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aSource", new THREE.BufferAttribute(src, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    g.setAttribute("aLane", new THREE.BufferAttribute(lane, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 1));
    g.setAttribute("aOrder", new THREE.BufferAttribute(order, 1));
    return g;
  }, [count, sources.length, spread, seed, sourceColors]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(() => {
    const from = Array.from({ length: MAX_SOURCES }, () => new THREE.Vector3());
    const pal = BIG_DATA_CONFIG.particleColor.map((c) => new THREE.Color(c));
    return {
      uClock: { value: 0 }, uFlow: { value: 0 }, uFade: { value: 1 }, uBend: { value: 1 },
      uFrom: { value: from }, uTo: { value: new THREE.Vector3() },
      uC0: { value: pal[0] }, uC1: { value: pal[1] }, uC2: { value: pal[2] }, uC3: { value: pal[3] },
      uSize: { value: 1 }, uPixelRatio: { value: 1 }, uGlow: { value: BIG_DATA_CONFIG.glowIntensity }, uAlphaBoost: { value: BIG_DATA_CONFIG.alphaBoost },
      ...createTouchUniforms(),
    };
  }, []);

  // Atracción hacia el dedo en móvil (src/lib/touchAttract.ts)
  const touch = useRef({ strength: 0 });

  useFrame((_, delta) => {
    const u = materialRef.current?.uniforms;
    if (!u) return;
    updateTouch(u, touch.current, () => viewRect(progress), Math.min(delta, 0.1));
    const d = drive(progress);
    const speed = (d.speed ?? 1) * BIG_DATA_CONFIG.animationSpeed * (motion.reduced ? 0.15 : 1);
    clock.current += Math.min(delta, 0.1) * speed;
    u.uClock.value = clock.current;
    u.uFlow.value = d.flow;
    u.uFade.value = d.fade ?? 1;
    u.uBend.value = bend;
    (u.uFrom.value as THREE.Vector3[]).forEach((v, i) => {
      const s = sources[Math.min(i, sources.length - 1)];
      v.set(s[0], s[1], s[2]);
    });
    (u.uTo.value as THREE.Vector3).set(...target);
    u.uSize.value = size * BIG_DATA_CONFIG.particleSize;
    u.uPixelRatio.value = dpr;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={glowFragment}
        transparent
        depthWrite={false}
        blending={particleBlending}
      />
    </points>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { BIG_DATA_CONFIG, particleBlending } from "../bigDataConfig";
import type { ModuleProgress } from "../core/progress";
import { viewRect } from "../core/viewRegistry";
import { createTouchUniforms, touchGlsl, updateTouch } from "@/lib/touchAttract";
import { motion } from "../core/env";
import { glowFragment, pointSizeGlsl, solidFragment } from "../shaders/particles";
import { rng } from "./shapes";

/**
 * Sistema de partículas que se transforma entre hasta 8 formas ("estados").
 * Todo el movimiento ocurre en el shader: un solo THREE.Points por sistema.
 */

export interface MorphData {
  /** 1 a 8 arrays de posiciones (x, y, z por partícula). */
  states: Float32Array[];
  /** Color base RGB por partícula. */
  colors: Float32Array;
  /** Color alternativo RGB (se mezcla con `colorMix`). Por defecto = colors. */
  colors2?: Float32Array;
  /** Tamaño relativo por partícula (se aplica con `sizeVar`). */
  sizes?: Float32Array;
  /** 0/1 por partícula: marca datos "especiales" (erróneos, filtrados…). */
  flags?: Float32Array;
  /** 0/1 por partícula: datos que se descartan (se vuelven rojos, salen despedidos y desaparecen con `drop`). */
  drops?: Float32Array;
  /** 0→1 orden de aparición (con `reveal`). Por defecto aleatorio. */
  order?: Float32Array;
}

/** Valores que un módulo controla en cada frame. */
export interface MorphDrive {
  stage?: number;
  noise?: number;
  drift?: number;
  swirl?: number;
  /** 0–1: cuánto del giro acumulado se aplica (0 = formas sin rotar). */
  swirlMix?: number;
  reveal?: number;
  colorMix?: number;
  sizeVar?: number;
  fade?: number;
  flagJitter?: number;
  flagBlink?: number;
  flagFade?: number;
  flagColor?: number;
  flagSize?: number;
  /** 0–1: avance del descarte de las partículas marcadas en `drops`. */
  drop?: number;
  /** Escala de la forma completa (1 = tamaño normal). */
  spread?: number;
  /** Multiplicador del tamaño de cada partícula (1 = normal). */
  pointScale?: number;
}

const DEFAULT_DRIVE: Required<MorphDrive> = {
  stage: 0, noise: 0.04, drift: 0.4, swirl: 0, swirlMix: 1, reveal: 1, colorMix: 0, sizeVar: 1, fade: 1,
  flagJitter: 0, flagBlink: 0, flagFade: 0, flagColor: 0, flagSize: 0, drop: 0, spread: 1, pointScale: 1,
};

/**
 * Máximo de estados. Cada estado es un atributo vec3 y la tarjeta gráfica
 * admite pocos atributos (16 en muchos equipos): por eso tamaño, semilla,
 * orden y tipo van empaquetados en un solo vec4 (aMeta).
 */
const MAX_STATES = 8;

const vertexShader = /* glsl */ `
  ${touchGlsl}
  ${pointSizeGlsl}
  uniform float uTime;
  uniform float uPhase;
  uniform float uSwirlAngle;
  uniform float uSwirlMix;
  uniform float uStage;
  uniform float uLast;
  uniform float uNoise;
  uniform float uReveal;
  uniform float uColorMix;
  uniform float uSizeVar;
  uniform float uFade;
  uniform float uFlagJitter;
  uniform float uFlagBlink;
  uniform float uFlagFade;
  uniform float uFlagColor;
  uniform float uFlagSize;
  uniform float uDrop;
  uniform float uSpread;
  uniform float uPointScale;
  uniform vec3 uErr;

  attribute vec3 aS0;
  attribute vec3 aS1;
  attribute vec3 aS2;
  attribute vec3 aS3;
  attribute vec3 aS4;
  attribute vec3 aS5;
  attribute vec3 aS6;
  attribute vec3 aS7;
  attribute vec3 aColor;
  attribute vec3 aColor2;
  // x: tamaño · y: semilla · z: orden de aparición · w: tipo (0 normal, 1 sospechoso, 2 descartado)
  attribute vec4 aMeta;

  varying vec3 vColor;
  varying float vAlpha;

  vec3 pick(float i) {
    if (i < 0.5) return aS0;
    if (i < 1.5) return aS1;
    if (i < 2.5) return aS2;
    if (i < 3.5) return aS3;
    if (i < 4.5) return aS4;
    if (i < 5.5) return aS5;
    if (i < 6.5) return aS6;
    return aS7;
  }

  void main() {
    float aSize = aMeta.x;
    float aSeed = aMeta.y;
    float aOrder = aMeta.z;
    float aFlag = step(0.5, aMeta.w) * (1.0 - step(1.5, aMeta.w));
    float aDrop = step(1.5, aMeta.w);

    // Transición escalonada: cada partícula sale con un pequeño retraso propio
    float s = clamp(uStage, 0.0, uLast);
    float i0 = min(floor(s), max(uLast - 1.0, 0.0));
    float f = s - i0;
    float d = aSeed * 0.4;
    f = smoothstep(d, d + 0.6, f);
    vec3 p = mix(pick(i0), pick(min(i0 + 1.0, uLast)), f) * uSpread;

    // Giro alrededor del eje Y (velocidad distinta por partícula)
    float ang = mod(uSwirlAngle * (0.45 + aSeed), 6.2831853) * uSwirlMix;
    float c = cos(ang), sn = sin(ang);
    p.xz = mat2(c, -sn, sn, c) * p.xz;

    // Deriva suave para que nada se vea estático
    p += vec3(
      sin(uPhase + aSeed * 40.0),
      cos(uPhase * 1.3 + aSeed * 23.0),
      sin(uPhase * 0.7 + aSeed * 11.0)
    ) * uNoise * (0.4 + aSeed);

    // Datos descartados: salen despedidos hacia fuera
    float dropT = aDrop * uDrop;
    vec2 away = normalize(p.xy + vec2(aSeed - 0.5, fract(aSeed * 13.7) - 0.5) * 0.6 + 0.0001);
    p.xy += away * dropT * dropT * (1.6 + aSeed * 1.4);

    // Datos erróneos: temblor
    p.xy += aFlag * uFlagJitter * vec2(sin(uTime * 9.0 + aSeed * 91.0), cos(uTime * 11.0 + aSeed * 37.0)) * 0.16;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = touchAttract(projectionMatrix * mv, aSeed);

    float vis = 1.0 - smoothstep(uReveal - 0.015, uReveal, aOrder);
    float blink = mix(1.0, 0.2 + 0.8 * step(0.45, fract(uTime * 2.7 + aSeed * 7.0)), aFlag * uFlagBlink);
    // Descartados: en cuanto se vuelven rojos crecen para que se noten
    float dropOn = aDrop * clamp(uDrop * 4.0, 0.0, 1.0);
    float sz = mix(1.0, aSize, uSizeVar) * (1.0 + aFlag * uFlagSize) * (1.0 + dropOn * 0.6);
    gl_PointSize = pointSize(sz, mv) * (0.3 + 0.7 * vis) * uPointScale;

    vColor = mix(aColor, aColor2, uColorMix);
    vColor = mix(vColor, uErr, aFlag * uFlagColor);
    vColor = mix(vColor, uErr, dropOn);
    // Mientras son rojos van opacos al 100 %; desaparecen solo al final del recorrido
    float dropAlpha = 1.0 - aDrop * smoothstep(0.6, 1.0, uDrop);
    float baseAlpha = mix(0.6 + 0.4 * fract(aSeed * 7.31), 1.6, dropOn);
    vAlpha = vis * uFade * (1.0 - aFlag * uFlagFade) * dropAlpha * blink * baseAlpha;
  }
`;

export interface ParticleMorphProps {
  /** Genera los datos. Debe ser estable (definido fuera del componente o memoizado). */
  build: (count: number) => MorphData;
  count: number;
  progress: ModuleProgress;
  /** Calcula los valores de este frame a partir del progreso. */
  drive: (p: ModuleProgress, time: number) => MorphDrive;
  size?: number;
  /** true: círculos sólidos de borde nítido, sin resplandor. */
  solid?: boolean;
  /** Sustituye un estado cuando sus posiciones llegan después (p. ej. muestreadas de una imagen). */
  lateState?: { index: number; positions: Float32Array | null };
}

export default function ParticleMorph({ build, count, progress, drive, size = 1, solid = false, lateState }: ParticleMorphProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dpr = useThree((s) => s.viewport.dpr);
  const acc = useRef({ phase: 0, swirl: 0 });

  const geometry = useMemo(() => {
    const data = build(count);
    const n = data.colors.length / 3;
    const states = data.states.slice(0, MAX_STATES);
    while (states.length < MAX_STATES) states.push(states[states.length - 1]);

    const r = rng(n * 31 + 7);
    const seed = new Float32Array(n);
    const order = data.order ?? new Float32Array(n);
    for (let i = 0; i < n; i++) {
      seed[i] = r();
      if (!data.order) order[i] = r();
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(states[0], 3));
    states.forEach((s, i) => g.setAttribute(`aS${i}`, new THREE.BufferAttribute(s, 3)));
    g.setAttribute("aColor", new THREE.BufferAttribute(data.colors, 3));
    g.setAttribute("aColor2", new THREE.BufferAttribute(data.colors2 ?? data.colors, 3));
    const meta = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      meta[i * 4] = data.sizes ? data.sizes[i] : 1;
      meta[i * 4 + 1] = seed[i];
      meta[i * 4 + 2] = order[i];
      meta[i * 4 + 3] = data.drops?.[i] ? 2 : data.flags?.[i] ? 1 : 0;
    }
    g.setAttribute("aMeta", new THREE.BufferAttribute(meta, 4));
    g.userData.last = Math.min(data.states.length, MAX_STATES) - 1;
    return g;
  }, [build, count]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    if (!lateState?.positions) return;
    const attr = geometry.getAttribute(`aS${lateState.index}`) as THREE.BufferAttribute;
    const src = lateState.positions;
    // Mismo array puede estar compartido con otros estados: se crea uno nuevo
    const next = new Float32Array(attr.count * 3);
    for (let i = 0; i < next.length; i++) next[i] = src[i % src.length];
    geometry.setAttribute(`aS${lateState.index}`, new THREE.BufferAttribute(next, 3));
  }, [geometry, lateState]);

  // Valores iniciales; luego se actualizan vía materialRef (ver README del hero: StrictMode)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 }, uPhase: { value: 0 }, uSwirlAngle: { value: 0 }, uSwirlMix: { value: 1 },
      uStage: { value: 0 }, uLast: { value: 0 }, uNoise: { value: 0 }, uReveal: { value: 1 },
      uColorMix: { value: 0 }, uSizeVar: { value: 1 }, uFade: { value: 1 },
      uFlagJitter: { value: 0 }, uFlagBlink: { value: 0 }, uFlagFade: { value: 0 },
      uFlagColor: { value: 0 }, uFlagSize: { value: 0 }, uDrop: { value: 0 }, uSpread: { value: 1 }, uPointScale: { value: 1 },
      uErr: { value: new THREE.Color(BIG_DATA_CONFIG.errorColor) },
      uSize: { value: 1 }, uPixelRatio: { value: 1 }, uGlow: { value: BIG_DATA_CONFIG.glowIntensity }, uAlphaBoost: { value: BIG_DATA_CONFIG.alphaBoost },
      ...createTouchUniforms(),
    }),
    []
  );

  // Atracción hacia el dedo en móvil (src/lib/touchAttract.ts)
  const touch = useRef({ strength: 0 });

  useFrame((state, delta) => {
    const u = materialRef.current?.uniforms;
    if (!u) return;
    updateTouch(u, touch.current, () => viewRect(progress), Math.min(delta, 0.1));
    const dt = Math.min(delta, 0.1) * BIG_DATA_CONFIG.animationSpeed;
    const d = { ...DEFAULT_DRIVE, ...drive(progress, state.clock.elapsedTime) };
    const calm = motion.reduced ? 0.15 : 1;

    acc.current.phase += dt * d.drift * calm;
    acc.current.swirl += dt * d.swirl * calm;

    u.uTime.value = motion.reduced ? 0 : state.clock.elapsedTime;
    u.uPhase.value = acc.current.phase;
    u.uSwirlAngle.value = acc.current.swirl;
    u.uSwirlMix.value = d.swirlMix;
    u.uStage.value = d.stage;
    u.uLast.value = geometry.userData.last;
    u.uNoise.value = d.noise * (motion.reduced ? 0.3 : 1);
    u.uReveal.value = d.reveal;
    u.uColorMix.value = d.colorMix;
    u.uSizeVar.value = d.sizeVar;
    u.uFade.value = d.fade;
    u.uFlagJitter.value = motion.reduced ? 0 : d.flagJitter;
    u.uFlagBlink.value = motion.reduced ? 0 : d.flagBlink;
    u.uFlagFade.value = d.flagFade;
    u.uFlagColor.value = d.flagColor;
    u.uFlagSize.value = d.flagSize;
    u.uDrop.value = d.drop;
    u.uSpread.value = d.spread;
    u.uPointScale.value = d.pointScale;
    u.uSize.value = size * BIG_DATA_CONFIG.particleSize;
    u.uPixelRatio.value = dpr;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={solid ? solidFragment : glowFragment}
        transparent
        depthWrite={false}
        blending={particleBlending}
      />
    </points>
  );
}

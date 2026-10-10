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
 * Flujo continuo hacia el centro: cada partícula parte del borde, avanza
 * lentamente hacia el centro, desaparece al llegar y vuelve a aparecer fuera.
 * Como cada una va desfasada, siempre hay puntos entrando y saliendo.
 * Todo el recorrido se calcula en el vertex shader.
 */

const vertexShader = /* glsl */ `
  ${touchGlsl}
  ${pointSizeGlsl}
  ${paletteGlsl}
  uniform float uClock;
  uniform float uFade;
  uniform float uCoreR;
  uniform float uSwirl;

  attribute vec3 aDir;
  attribute float aR;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aColor;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float t = fract(aPhase + uClock * aSpeed);
    // Se acelera un poco al acercarse, como atraído por el centro
    float r = aR * (1.0 - t * t * (0.6 + 0.4 * t));
    // Ligero giro en espiral mientras se acerca
    float a = uSwirl * t;
    float c = cos(a), s = sin(a);
    vec3 d = vec3(c * aDir.x - s * aDir.y, s * aDir.x + c * aDir.y, aDir.z);
    vec3 p = d * r;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = touchAttract(projectionMatrix * mv, fract(aPhase * 7.0));
    // Se encoge al final: parece que el centro lo absorbe
    float shrink = smoothstep(uCoreR * 0.9, uCoreR * 2.2, r);
    gl_PointSize = pointSize(aSize, mv) * (0.35 + 0.65 * shrink);

    float appear = smoothstep(0.0, 0.15, t);
    float vanish = smoothstep(uCoreR, uCoreR * 1.9, r);
    vColor = palette(aColor);
    vAlpha = appear * vanish * uFade * (0.6 + 0.4 * fract(aPhase * 13.7));
  }
`;

const DEFAULT_DURATION: [number, number] = [18, 34];

export interface ParticleInflowProps {
  count: number;
  progress: ModuleProgress;
  /** Opacidad global (entrada/salida del módulo). */
  fade: (p: ModuleProgress) => number;
  /** Radio del círculo central donde desaparecen los puntos. */
  coreRadius: number;
  /** Radio máximo de partida. */
  radius?: number;
  /** Segundos que tarda un punto en llegar al centro [mín, máx]. */
  duration?: [number, number];
  size?: number;
  seed?: number;
}

export default function ParticleInflow({
  count, progress, fade, coreRadius, radius = 4.2, duration = DEFAULT_DURATION, size = 1, seed = 13,
}: ParticleInflowProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dpr = useThree((s) => s.viewport.dpr);
  const clock = useRef(0);
  const [dMin, dMax] = duration;

  const geometry = useMemo(() => {
    const r = rng(seed);
    const dir = new Float32Array(count * 3);
    const startR = new Float32Array(count);
    const phase = new Float32Array(count);
    const speed = new Float32Array(count);
    const sz = new Float32Array(count);
    const col = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Dirección aleatoria, algo aplanada en profundidad
      const u = r() * 2 - 1;
      const th = r() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      dir.set([Math.cos(th) * s, u, Math.sin(th) * s * 0.5], i * 3);
      startR[i] = radius * (0.45 + 0.55 * Math.sqrt(r()));
      phase[i] = r();
      speed[i] = 1 / (dMin + r() * (dMax - dMin));
      sz[i] = 0.5 + Math.pow(r(), 3) * 1.2;
      col[i] = 1 + r() * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aDir", new THREE.BufferAttribute(dir, 3));
    g.setAttribute("aR", new THREE.BufferAttribute(startR, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 1));
    return g;
  }, [count, radius, dMin, dMax, seed]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Valores iniciales; luego se actualizan vía materialRef (ver README: StrictMode)
  const uniforms = useMemo(() => {
    const pal = BIG_DATA_CONFIG.particleColor.map((c) => new THREE.Color(c));
    return {
      uClock: { value: 0 }, uFade: { value: 1 }, uCoreR: { value: 0.3 }, uSwirl: { value: 0.9 },
      uC0: { value: pal[0] }, uC1: { value: pal[1] }, uC2: { value: pal[2] }, uC3: { value: pal[3] },
      uSize: { value: 1 }, uPixelRatio: { value: 1 },
      uGlow: { value: BIG_DATA_CONFIG.glowIntensity }, uAlphaBoost: { value: BIG_DATA_CONFIG.alphaBoost },
      ...createTouchUniforms(),
    };
  }, []);

  // Atracción hacia el dedo en móvil (src/lib/touchAttract.ts)
  const touch = useRef({ strength: 0 });

  useFrame((_, delta) => {
    const u = materialRef.current?.uniforms;
    if (!u) return;
    updateTouch(u, touch.current, () => viewRect(progress), Math.min(delta, 0.1));
    const speed = BIG_DATA_CONFIG.animationSpeed * (motion.reduced ? 0.2 : 1);
    clock.current += Math.min(delta, 0.1) * speed;
    u.uClock.value = clock.current;
    u.uFade.value = fade(progress);
    u.uCoreR.value = coreRadius;
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

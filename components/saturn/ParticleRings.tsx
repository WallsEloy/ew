"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { avoidGlsl, createAvoidUniforms, updateAvoidUniforms, type AvoidZone } from "./avoid";
import { createTouchUniforms, touchGlsl, updateTouch } from "@/lib/touchAttract";

export interface ParticleRingsProps {
  count: number;
  ringCount: number;
  planetRadius: number;
  /** Radio interior/exterior en múltiplos del radio del planeta. */
  inner: number;
  outer: number;
  /** Hueco entre bandas, como fracción del ancho de cada banda (0 = pegadas). */
  bandGap: number;
  speed: number;
  size: number;
  colors: [string, string, string, string];
  /** 0 congela el movimiento (prefers-reduced-motion). */
  motion: number;
  /** Fondo oscuro: AdditiveBlending (suma luz). Fondo claro: NormalBlending. */
  blending: THREE.Blending;
  /** Multiplicador de opacidad de las partículas. */
  opacity: number;
  /** true: todas las partículas 100% opacas; false: transparencia variable. */
  solid: boolean;
  /** Zona de texto que las partículas esquivan (null = desactivado). */
  avoid: AvoidZone | null;
  /** Alcance de la esquiva, en radios de la elipse del texto. */
  avoidReach: number;
  /**
   * Rectángulo en pantalla donde se dibuja la escena. Si se pasa, en móvil
   * las partículas se dirigen hacia el dedo (src/lib/touchAttract.ts).
   */
  touchRect?: () => DOMRect | null;
}

// PRNG determinista: el mismo patrón de anillos en cada carga.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Band {
  inner: number;
  outer: number;
  density: number;
  brightness: number;
}

// Zonas inspiradas en Saturno (t = 0 borde interior, 1 borde exterior):
// anillo C tenue, B denso y brillante, división de Cassini, A con la división
// de Encke, y el anillo F fino al exterior.
const ZONES = [
  { from: 0.0, to: 0.19, weight: 0.18, density: 0.35, brightness: 0.5 },
  { from: 0.21, to: 0.55, weight: 0.36, density: 1.0, brightness: 1.0 },
  { from: 0.575, to: 0.6, weight: 0.03, density: 0.06, brightness: 0.4 },
  { from: 0.62, to: 0.84, weight: 0.29, density: 0.7, brightness: 0.8 },
  { from: 0.86, to: 0.9, weight: 0.08, density: 0.55, brightness: 0.75 },
  { from: 0.955, to: 0.968, weight: 0.06, density: 0.9, brightness: 1.1 },
];

function buildBands(ringCount: number, rIn: number, rOut: number, bandGap: number, rand: () => number): Band[] {
  const bands: Band[] = [];
  const span = rOut - rIn;

  ZONES.forEach((zone) => {
    const n = Math.max(1, Math.round(ringCount * zone.weight));
    // Cortes aleatorios dentro de la zona: bandas de anchos distintos
    const cuts = Array.from({ length: n - 1 }, () => rand()).sort();
    const edges = [0, ...cuts, 1];

    for (let i = 0; i < n; i++) {
      const a = zone.from + (zone.to - zone.from) * edges[i];
      const b = zone.from + (zone.to - zone.from) * edges[i + 1];
      // Hueco alrededor de cada banda; varía para que no sea uniforme
      const gap = Math.min((b - a) * 0.9, (b - a) * bandGap * (0.5 + rand()));
      bands.push({
        inner: rIn + span * (a + gap / 2),
        outer: rIn + span * (b - gap / 2),
        density: zone.density * (0.6 + rand() * 0.7),
        brightness: zone.brightness * (0.75 + rand() * 0.4),
      });
    }
  });

  return bands;
}

// Aproximación gaussiana barata (suma de uniformes).
const gauss = (rand: () => number) => (rand() + rand() + rand() + rand() - 2) / 2;

function buildGeometry(props: Pick<ParticleRingsProps, "count" | "ringCount" | "planetRadius" | "inner" | "outer" | "bandGap">) {
  const rand = mulberry32(1337);
  const rIn = props.planetRadius * props.inner;
  const rOut = props.planetRadius * props.outer;
  const bands = buildBands(props.ringCount, rIn, rOut, props.bandGap, rand);

  // Reparto de partículas proporcional a densidad × área de cada banda
  const weights = bands.map((b) => b.density * (b.outer * b.outer - b.inner * b.inner));
  const total = weights.reduce((s, w) => s + w, 0);

  const count = props.count;
  const position = new Float32Array(count * 3);
  const aRadius = new Float32Array(count);
  const aAngle = new Float32Array(count);
  const aSpeed = new Float32Array(count);
  const aSize = new Float32Array(count);
  const aHeight = new Float32Array(count);
  const aBrightness = new Float32Array(count);
  const aColor = new Float32Array(count);
  const aOffset = new Float32Array(count);

  let p = 0;
  bands.forEach((band, bi) => {
    const n = bi === bands.length - 1 ? count - p : Math.round((weights[bi] / total) * count);

    for (let k = 0; k < n && p < count; k++, p++) {
      const t = rand();
      // Bordes de banda difusos: nada de círculos perfectos
      const r = band.inner + (band.outer - band.inner) * t + gauss(rand) * 0.006 * rOut;
      const angle = rand() * Math.PI * 2;
      const dust = rand() < 0.04; // polvo fuera del plano
      const sparkle = rand() < 0.02; // destellos más grandes

      aRadius[p] = r;
      aAngle[p] = angle;
      // Velocidad kepleriana (ω ∝ r^-1.5) con variación individual
      aSpeed[p] = 0.11 * Math.pow(rIn / r, 1.5) * (0.92 + rand() * 0.16);
      aHeight[p] = gauss(rand) * (dust ? 0.09 : 0.014) * rOut * 0.25;
      aSize[p] = (0.55 + Math.pow(rand(), 3) * 2.0) * (sparkle ? 2.2 : 1);
      aBrightness[p] = band.brightness * (0.35 + rand() * 0.65) * (sparkle ? 1.5 : 1) * (dust ? 0.5 : 1);

      // 0 blanco · 1 cyan · 2 azul · 3 violeta. Interior más frío, exterior más violeta.
      const tr = (r - rIn) / (rOut - rIn);
      aColor[p] = sparkle ? 0 : Math.min(3, Math.max(0, 0.6 + tr * 2.2 + gauss(rand) * 0.9));
      aOffset[p] = rand();

      position[p * 3] = Math.cos(angle) * r;
      position[p * 3 + 1] = aHeight[p];
      position[p * 3 + 2] = Math.sin(angle) * r;
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aRadius", new THREE.BufferAttribute(aRadius, 1));
  geometry.setAttribute("aAngle", new THREE.BufferAttribute(aAngle, 1));
  geometry.setAttribute("aSpeed", new THREE.BufferAttribute(aSpeed, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(aSize, 1));
  geometry.setAttribute("aHeight", new THREE.BufferAttribute(aHeight, 1));
  geometry.setAttribute("aBrightness", new THREE.BufferAttribute(aBrightness, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(aColor, 1));
  geometry.setAttribute("aOffset", new THREE.BufferAttribute(aOffset, 1));
  geometry.setDrawRange(0, p);
  return geometry;
}

const vertexShader = /* glsl */ `
  ${touchGlsl}
  ${avoidGlsl}
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uOpacity;
  uniform vec3 uC0;
  uniform vec3 uC1;
  uniform vec3 uC2;
  uniform vec3 uC3;

  attribute float aRadius;
  attribute float aAngle;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aHeight;
  attribute float aBrightness;
  attribute float aColor;
  attribute float aOffset;

  varying vec3 vColor;
  varying float vAlpha;

  vec3 palette(float m) {
    vec3 c = mix(uC0, uC1, clamp(m, 0.0, 1.0));
    c = mix(c, uC2, clamp(m - 1.0, 0.0, 1.0));
    return mix(c, uC3, clamp(m - 2.0, 0.0, 1.0));
  }

  void main() {
    float phase = aOffset * 6.2831;
    float angle = aAngle + uTime * aSpeed;

    // Perturbaciones: órbitas ligeramente excéntricas y "respiración" del radio
    float r = aRadius
      + sin(angle * 2.0 + phase) * 0.008 * aRadius
      + sin(uTime * 0.35 + phase) * 0.01;
    float y = aHeight + sin(angle * 3.0 + phase) * 0.004;

    vec3 pos = vec3(cos(angle) * r, y, sin(angle) * r);
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vec4 mv = viewMatrix * world;
    gl_Position = touchAttract(avoidText(projectionMatrix * mv), aOffset);

    // Tope proporcional al tamaño configurado: evita manchas grandes en primer plano
    // 10.0: escala calibrada para círculos sólidos (el tamaño visible equivale al de antes con borde difuso)
    gl_PointSize = min(aSize * uSize * uPixelRatio * (10.0 / -mv.z), 2.8 * uSize * uPixelRatio);

    // Profundidad: la parte trasera del anillo algo más tenue
    float depth = 0.6 + 0.4 * smoothstep(-4.0, 4.0, world.z);
    float twinkle = 0.82 + 0.18 * sin(uTime * (1.2 + aOffset * 2.0) + phase * 7.0);

    vColor = palette(aColor);
    vAlpha = aBrightness * depth * twinkle * uOpacity;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  uniform float uSolid;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    // Círculo sólido con borde nítido: solo ~1px de suavizado para evitar dientes
    float aa = fwidth(d);
    float disc = 1.0 - smoothstep(0.5 - aa, 0.5, d);
    gl_FragColor = vec4(vColor, disc * mix(clamp(vAlpha, 0.0, 1.0), 1.0, uSolid));
  }
`;

export default function ParticleRings(props: ParticleRingsProps) {
  const { count, ringCount, planetRadius, inner, outer, bandGap, speed, size, colors, motion, blending, opacity, solid, avoid, avoidReach, touchRect } = props;
  const touch = useRef({ strength: 0 });
  const dpr = useThree((s) => s.viewport.dpr);
  const canvasSize = useThree((s) => s.size);

  const geometry = useMemo(
    () => buildGeometry({ count, ringCount, planetRadius, inner, outer, bandGap }),
    [count, ringCount, planetRadius, inner, outer, bandGap]
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Valores iniciales. Después se actualizan siempre a través del material
  // (materialRef): en desarrollo, StrictMode puede dejar al material con otra
  // copia de este objeto y las actualizaciones no le llegarían.
  const initialUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size },
      uOpacity: { value: opacity },
      uSolid: { value: solid ? 1 : 0 },
      ...createAvoidUniforms(),
      ...createTouchUniforms(),
      uPixelRatio: { value: dpr },
      uC0: { value: new THREE.Color(colors[0]) },
      uC1: { value: new THREE.Color(colors[1]) },
      uC2: { value: new THREE.Color(colors[2]) },
      uC3: { value: new THREE.Color(colors[3]) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    const u = materialRef.current?.uniforms;
    if (!u) return;
    u.uSize.value = size;
    u.uOpacity.value = opacity;
    u.uSolid.value = solid ? 1 : 0;
    u.uPixelRatio.value = dpr;
    colors.forEach((c, i) => (u[`uC${i}`].value as THREE.Color).set(c));
  }, [size, opacity, solid, dpr, colors]);

  useEffect(() => {
    const u = materialRef.current?.uniforms;
    if (u) updateAvoidUniforms(u, avoid, canvasSize, avoidReach);
  }, [avoid, canvasSize, avoidReach]);

  useFrame((_, delta) => {
    const u = materialRef.current?.uniforms;
    if (!u) return;
    // delta acotado: evita saltos al volver de otra pestaña
    u.uTime.value += Math.min(delta, 0.1) * speed * motion;
    if (touchRect) updateTouch(u, touch.current, touchRect, Math.min(delta, 0.1));
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={initialUniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={blending}
      />
    </points>
  );
}

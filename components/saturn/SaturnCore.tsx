"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { avoidGlsl, createAvoidUniforms, updateAvoidUniforms, type AvoidZone } from "./avoid";
import { createTouchUniforms, touchGlsl, updateTouch } from "@/lib/touchAttract";

export interface SaturnCoreProps {
  radius: number;
  /** Partículas que forman la superficie del planeta. */
  particleCount: number;
  /** Paleta de las partículas (misma que los anillos). */
  colors: [string, string, string, string];
  rimColor: string;
  atmosphereColor: string;
  glowIntensity: number;
  /** Rotación propia en rad/s. */
  spin: number;
  /** Dirección (mundo) de la luz principal: ese lado del planeta brilla más. */
  lightDirection: [number, number, number];
  segments: number;
  motion: number;
  /** Additive sobre fondo oscuro, normal sobre fondo claro. */
  blending: THREE.Blending;
  size: number;
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

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Puntos repartidos uniformemente sobre la esfera (espiral de Fibonacci) con
 * un poco de desorden, agrupados en franjas de latitud como las de Saturno.
 */
function buildPlanetGeometry(count: number, radius: number) {
  const rand = mulberry32(4242);
  const golden = Math.PI * (3 - Math.sqrt(5));

  const position = new Float32Array(count * 3);
  const aSize = new Float32Array(count);
  const aBrightness = new Float32Array(count);
  const aColor = new Float32Array(count);
  const aOffset = new Float32Array(count);

  let p = 0;
  for (let i = 0; i < count; i++) {
    const y = 1 - ((i + 0.5) / count) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = i * golden + (rand() - 0.5) * 0.04;
    const lat = Math.asin(y);

    // Franjas: densidad y tono varían con la latitud
    const band = 0.5 + 0.5 * Math.sin(lat * 9 + Math.sin(lat * 23) * 0.6);
    if (rand() > 0.55 + band * 0.45) continue;

    // Capa fina con algo de grosor para que no parezca una malla perfecta
    const r = radius * (1 + (rand() - 0.3) * 0.025);
    position[p * 3] = Math.cos(theta) * ring * r;
    position[p * 3 + 1] = y * r;
    position[p * 3 + 2] = Math.sin(theta) * ring * r;

    aSize[p] = 0.75 + Math.pow(rand(), 3) * 1.6;
    aBrightness[p] = (0.45 + band * 0.55) * (0.6 + rand() * 0.4);
    // Polos más fríos (cyan/azul), ecuador con más violeta
    aColor[p] = Math.min(3, Math.max(0, 0.8 + band * 1.2 + (1 - Math.abs(y)) * 0.6 + (rand() - 0.5) * 0.8));
    aOffset[p] = rand();
    p++;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(aSize, 1));
  geometry.setAttribute("aBrightness", new THREE.BufferAttribute(aBrightness, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(aColor, 1));
  geometry.setAttribute("aOffset", new THREE.BufferAttribute(aOffset, 1));
  geometry.setDrawRange(0, p);
  return geometry;
}

const planetVertex = /* glsl */ `
  ${touchGlsl}
  ${avoidGlsl}
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uOpacity;
  uniform vec3 uLightDir;
  uniform vec3 uRim;
  uniform vec3 uC0;
  uniform vec3 uC1;
  uniform vec3 uC2;
  uniform vec3 uC3;

  attribute float aSize;
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
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 center = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vec3 n = normalize(world.xyz - center);
    vec3 viewDir = normalize(cameraPosition - world.xyz);

    // Lado iluminado más brillante + borde (fresnel) resaltado
    float lit = 0.45 + 0.55 * smoothstep(-0.35, 1.0, dot(n, uLightDir));
    float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 2.5);
    float twinkle = 0.85 + 0.15 * sin(uTime * (1.0 + aOffset * 2.0) + aOffset * 40.0);

    vec4 mv = viewMatrix * world;
    gl_Position = touchAttract(avoidText(projectionMatrix * mv), aOffset);
    gl_PointSize = min(aSize * uSize * uPixelRatio * (10.0 / -mv.z), 2.6 * uSize * uPixelRatio);

    vColor = mix(palette(aColor), uRim, rim * 0.6);
    // En el contorno las partículas se apilan por la proyección: se aclaran ahí
    // en lugar de reforzarse, para que no se vean unas sobre otras
    vAlpha = aBrightness * lit * (1.0 - rim * 0.55) * twinkle * uOpacity;
  }
`;

const pointFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  uniform float uSolid;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    // Círculo sólido con borde nítido (mismo trazo que los anillos)
    float aa = fwidth(d);
    float disc = 1.0 - smoothstep(0.5 - aa, 0.5, d);
    gl_FragColor = vec4(vColor, disc * mix(clamp(vAlpha, 0.0, 1.0), 1.0, uSolid));
  }
`;

const fresnelVertex = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vNormalV;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

// Atmósfera: esfera mayor vista por dentro; máximo junto al planeta y se
// desvanece hacia afuera.
const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uLightDir;
  uniform float uIntensity;
  uniform float uEdge;
  varying vec3 vNormalW;
  varying vec3 vNormalV;

  void main() {
    float x = 1.0 + dot(vNormalV, vec3(0.0, 0.0, 1.0));
    float glow = pow(clamp((1.0 - x) / (1.0 - uEdge), 0.0, 1.0), 2.4);
    float lit = 0.35 + 0.65 * smoothstep(-0.4, 1.0, dot(vNormalW, uLightDir));
    gl_FragColor = vec4(uColor, glow * lit * uIntensity * 0.85);
  }
`;

const ATMOSPHERE_SCALE = 1.25;

export default function SaturnCore(props: SaturnCoreProps) {
  const {
    radius, particleCount, colors, rimColor, atmosphereColor, glowIntensity,
    spin, lightDirection, segments, motion, blending, size, opacity, solid, avoid, avoidReach, touchRect,
  } = props;
  const spinRef = useRef<THREE.Group>(null);
  const touch = useRef({ strength: 0 });
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dpr = useThree((s) => s.viewport.dpr);
  const canvasSize = useThree((s) => s.size);

  const geometry = useMemo(() => buildPlanetGeometry(particleCount, radius), [particleCount, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const lightDir = useMemo(() => new THREE.Vector3(...lightDirection).normalize(), [lightDirection]);

  // Valores iniciales; luego se actualizan a través de materialRef
  // (ver la nota en ParticleRings sobre StrictMode).
  const planetUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size },
      uPixelRatio: { value: dpr },
      uOpacity: { value: opacity },
      uSolid: { value: solid ? 1 : 0 },
      ...createAvoidUniforms(),
      ...createTouchUniforms(),
      uLightDir: { value: lightDir.clone() },
      uRim: { value: new THREE.Color(rimColor) },
      uC0: { value: new THREE.Color(colors[0]) },
      uC1: { value: new THREE.Color(colors[1]) },
      uC2: { value: new THREE.Color(colors[2]) },
      uC3: { value: new THREE.Color(colors[3]) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const u = materialRef.current?.uniforms;
    if (!u) return;
    u.uSize.value = size;
    u.uPixelRatio.value = dpr;
    u.uOpacity.value = opacity;
    u.uSolid.value = solid ? 1 : 0;
    (u.uLightDir.value as THREE.Vector3).copy(lightDir);
    (u.uRim.value as THREE.Color).set(rimColor);
    colors.forEach((c, i) => (u[`uC${i}`].value as THREE.Color).set(c));
  }, [size, dpr, opacity, solid, lightDir, rimColor, colors]);

  // Borde del planeta visto desde dentro de la atmósfera: 1 - sqrt(1 - (1/escala)^2)
  const edge = 1 - Math.sqrt(1 - 1 / (ATMOSPHERE_SCALE * ATMOSPHERE_SCALE));
  const atmosphereUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(atmosphereColor) },
      uLightDir: { value: lightDir },
      uIntensity: { value: glowIntensity },
      uEdge: { value: edge },
    }),
    [atmosphereColor, lightDir, glowIntensity, edge]
  );

  useEffect(() => {
    const u = materialRef.current?.uniforms;
    if (u) updateAvoidUniforms(u, avoid, canvasSize, avoidReach);
  }, [avoid, canvasSize, avoidReach]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1) * motion;
    if (spinRef.current) spinRef.current.rotation.y += dt * spin;
    const u = materialRef.current?.uniforms;
    if (!u) return;
    u.uTime.value += dt;
    if (touchRect) updateTouch(u, touch.current, touchRect, Math.min(delta, 0.1));
  });

  return (
    <group>
      {/* Núcleo invisible: solo escribe profundidad para tapar lo que queda
          detrás del planeta (su cara trasera y los anillos que pasan por detrás) */}
      <mesh renderOrder={-1}>
        <sphereGeometry args={[radius * 0.985, segments, segments]} />
        <meshBasicMaterial colorWrite={false} />
      </mesh>

      {/* Superficie hecha de partículas, girando lentamente */}
      <group ref={spinRef}>
        <points geometry={geometry} frustumCulled={false}>
          <shaderMaterial
            ref={materialRef}
            uniforms={planetUniforms}
            vertexShader={planetVertex}
            fragmentShader={pointFragment}
            transparent
            depthWrite={false}
            blending={blending}
          />
        </points>
      </group>

      {/* Atmósfera / glow (se omite con glowIntensity = 0) */}
      {glowIntensity > 0 && (
      <mesh scale={ATMOSPHERE_SCALE}>
        <sphereGeometry args={[radius, segments, segments]} />
        <shaderMaterial
          uniforms={atmosphereUniforms}
          vertexShader={fresnelVertex}
          fragmentShader={atmosphereFragment}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
          blending={blending}
        />
      </mesh>
      )}
    </group>
  );
}

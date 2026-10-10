"use client";

import { useCallback, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

import ParticleRings from "./ParticleRings";
import SaturnCore from "./SaturnCore";
import type { AvoidZone } from "./avoid";
import { deg, type DeviceTier, type SaturnConfig } from "./config";

export interface SaturnSceneProps {
  config: SaturnConfig;
  tier: DeviceTier;
  /** true en dispositivos táctiles: vaivén automático en vez de mouse. */
  touch: boolean;
  reducedMotion: boolean;
  /** Zona del texto que las partículas esquivan (null = ninguna). */
  avoid: AvoidZone | null;
}

// Luz principal (cyan) desde la izquierda; se usa también para el borde del planeta.
const KEY_LIGHT_POSITION: [number, number, number] = [-6, 3, 4];

/**
 * Encuadre según la proporción de pantalla.
 * - Horizontal: los anillos caben a lo ancho y el planeta se desplaza a la
 *   derecha para dejar sitio al texto.
 * - Vertical (móvil): todo centrado y la cámara se acerca hasta que la esfera
 *   mide `portraitSphereWidth` veces el ancho de pantalla, para que el texto
 *   quepa dentro; los laterales y los anillos se recortan.
 */
function CameraRig({
  ringRadius,
  planetRadius,
  portraitSphereWidth,
}: {
  ringRadius: number;
  planetRadius: number;
  portraitSphereWidth: number;
}) {
  const lookTarget = useRef(new THREE.Vector3());

  useFrame((state) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const { width, height } = state.size;
    const aspect = width / height;
    const tanHalf = Math.tan(deg(camera.fov / 2));
    const portrait = aspect < 1;

    let z: number;
    if (portrait) {
      // Radio proyectado (px) = R / (z · tan(fov/2)) · alto/2  →  despejar z
      const radiusPx = (width * portraitSphereWidth) / 2;
      z = (planetRadius * height) / (2 * tanHalf * radiusPx);
    } else {
      // Distancia para que el anillo exterior quepa a lo ancho
      const fitWidth = (ringRadius * 1.1) / (tanHalf * aspect);
      z = Math.max(9.5, Math.min(fitWidth, 18));
    }

    const panX = aspect > 1.2 ? -ringRadius * 0.32 : 0;
    const panY = 0;

    const k = 0.08;
    camera.position.x += (panX - camera.position.x) * k;
    camera.position.y += (1.4 + panY - camera.position.y) * k;
    camera.position.z += (z - camera.position.z) * k;
    lookTarget.current.x += (panX - lookTarget.current.x) * k;
    lookTarget.current.y += (panY - lookTarget.current.y) * k;
    camera.lookAt(lookTarget.current);
  });

  return null;
}

/** Inclinación base + parallax suave con el mouse (o vaivén automático). */
function ParallaxRig({
  config,
  touch,
  reducedMotion,
  children,
}: Pick<SaturnSceneProps, "config" | "touch" | "reducedMotion"> & { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { mouse, tilt } = config;

  useFrame((state) => {
    if (!group.current) return;
    let px = 0;
    let py = 0;

    if (!reducedMotion && mouse.enabled) {
      if (touch) {
        if (mouse.autoSwayOnTouch) {
          const t = state.clock.elapsedTime;
          px = Math.sin(t * 0.13) * 0.6;
          py = Math.sin(t * 0.09 + 1.3) * 0.4;
        }
      } else {
        px = state.pointer.x;
        py = state.pointer.y;
      }
    }

    const s = deg(mouse.strength);
    const targetX = deg(tilt.x) - py * s;
    const targetY = px * s;
    const targetZ = deg(tilt.z) - px * s * 0.3;
    const k = mouse.damping;

    group.current.rotation.x += (targetX - group.current.rotation.x) * k;
    group.current.rotation.y += (targetY - group.current.rotation.y) * k;
    group.current.rotation.z += (targetZ - group.current.rotation.z) * k;
  });

  return (
    <group ref={group} rotation={[deg(tilt.x), 0, deg(tilt.z)]}>
      {children}
    </group>
  );
}

export default function SaturnScene({ config, tier, touch, reducedMotion, avoid }: SaturnSceneProps) {
  // En móvil las partículas se dirigen al dedo: necesitan saber dónde está el canvas
  const canvasEl = useThree((s) => s.gl.domElement);
  const touchRect = useCallback(() => canvasEl.getBoundingClientRect(), [canvasEl]);
  // Con "reducir movimiento" la escena sigue girando, más despacio
  const motion = reducedMotion ? config.reducedMotionSpeed : 1;
  const light = config.theme === "light";
  const colors = config.colors[config.theme];
  // En fondo blanco el bloom aclararía toda la pantalla y las estrellas no se verían
  const bloomOn = !light && config.bloom.enabled[tier];
  const blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
  // Tamaño propio para móvil (allí la cámara se acerca para agrandar la esfera)
  const particleSize = tier === "mobile" ? config.particleSizeMobile : config.particleSize;
  const avoidReach = config.avoidText.reach;
  const particleOpacity = light ? 1.6 : 1;

  return (
    <>
      <color attach="background" args={[colors.background]} />

      {/* Luces: key cyan lateral, fill violeta opuesta, ambiente mínimo para un centro oscuro */}
      <ambientLight intensity={0.06} />
      <directionalLight position={KEY_LIGHT_POSITION} intensity={2.4} color={colors.keyLight} />
      <directionalLight position={[6, -2, -3]} intensity={1.1} color={colors.fillLight} />

      {!light && (
        <Stars
          radius={60}
          depth={40}
          count={config.stars[tier]}
          factor={3}
          saturation={0}
          fade
          speed={reducedMotion ? 0 : 0.4}
        />
      )}

      <CameraRig
        ringRadius={config.planetRadius * config.ringOuter}
        planetRadius={config.planetRadius}
        portraitSphereWidth={config.portraitSphereWidth}
      />

      <ParallaxRig config={config} touch={touch} reducedMotion={reducedMotion}>
        <SaturnCore
          radius={config.planetRadius}
          particleCount={config.planetParticles[tier]}
          colors={colors.particles}
          rimColor={colors.rim}
          atmosphereColor={colors.atmosphere}
          glowIntensity={config.glowIntensity}
          spin={config.planetSpin}
          lightDirection={KEY_LIGHT_POSITION}
          segments={tier === "mobile" ? 32 : 64}
          motion={motion}
          blending={blending}
          size={particleSize}
          // Sobre blanco la esfera necesita más cuerpo para leerse como planeta
          opacity={light ? particleOpacity * 1.6 : particleOpacity}
          solid={config.solidParticles}
          avoid={avoid}
          avoidReach={avoidReach}
          touchRect={touchRect}
        />
        <ParticleRings
          count={config.particles[tier]}
          ringCount={config.ringCount}
          planetRadius={config.planetRadius}
          inner={config.ringInner}
          outer={config.ringOuter}
          bandGap={config.bandGap}
          speed={config.speed}
          size={particleSize}
          colors={colors.particles}
          motion={motion}
          blending={blending}
          opacity={particleOpacity}
          solid={config.solidParticles}
          avoid={avoid}
          avoidReach={avoidReach}
          touchRect={touchRect}
        />
      </ParallaxRig>

      {bloomOn && (
        <EffectComposer multisampling={0}>
          <Bloom
            mipmapBlur
            intensity={config.bloom.intensity * (tier === "tablet" ? 0.8 : 1)}
            luminanceThreshold={config.bloom.threshold}
            luminanceSmoothing={0.3}
            radius={config.bloom.radius}
          />
        </EffectComposer>
      )}
    </>
  );
}

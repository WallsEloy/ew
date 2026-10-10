"use client";

import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

import { BIG_DATA_CONFIG } from "../bigDataConfig";
import { motion, pointer, usePortrait } from "../core/env";
import type { ModuleProgress } from "../core/progress";

const DEG = Math.PI / 180;

export interface SceneRigProps {
  /** Ancho y alto (unidades de escena) que deben caber completos en la vista. */
  fitWidth: number;
  fitHeight: number;
  progress: ModuleProgress;
  /** Inclinación base del grupo [x, y] en grados. */
  tilt?: [number, number];
  /** Multiplica `mouseInfluence` (0 = sin parallax). */
  parallax?: number;
  /**
   * Cómo se adapta la composición en pantallas verticales (móvil):
   * - rotate: gira la escena 90° (lo que iba de izquierda a derecha va de arriba abajo).
   * - scale: estira la escena [x, y] (p. ej. [0.6, 1.5] la hace más alta y estrecha).
   * - fit: encuadre propio [ancho, alto] (por defecto se calcula solo).
   * - shiftY: sube (+) o baja (−) la escena para dejar sitio a textos superpuestos.
   */
  portrait?: { rotate?: boolean; scale?: [number, number]; fit?: [number, number]; shiftY?: number };
  /** Zoom de cámara según el scroll: 1 = encuadre normal, 0.5 = la mitad de distancia (más cerca). */
  zoom?: (p: ModuleProgress) => number;
  children: ReactNode;
}

/**
 * Cámara propia de cada módulo (encuadra `fitWidth × fitHeight` en cualquier
 * proporción de pantalla) y grupo con parallax suave de mouse o vaivén
 * automático en táctil.
 */
export default function SceneRig({ fitWidth, fitHeight, progress, tilt = [0, 0], parallax = 1, portrait, zoom, children }: SceneRigProps) {
  const vertical = usePortrait();
  const isPortrait = vertical && !!portrait;
  let fitW = fitWidth;
  let fitH = fitHeight;
  if (isPortrait) {
    if (portrait.fit) [fitW, fitH] = portrait.fit;
    else if (portrait.rotate) [fitW, fitH] = [fitHeight, fitWidth];
    else if (portrait.scale) [fitW, fitH] = [fitWidth * portrait.scale[0], fitHeight * portrait.scale[1]];
  }
  const rotZ = isPortrait && portrait.rotate ? -Math.PI / 2 : 0;
  const scale: [number, number, number] = isPortrait && portrait.scale ? [portrait.scale[0], portrait.scale[1], 1] : [1, 1, 1];
  const shiftY = isPortrait ? portrait.shiftY ?? 0 : 0;

  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const cam = camRef.current;
    if (cam) {
      const tanHalf = Math.tan((cam.fov / 2) * DEG);
      const aspect = cam.aspect || 1;
      const z =
        (Math.max(fitH / 2 / tanHalf, fitW / 2 / (tanHalf * aspect)) * (zoom ? zoom(progress) : 1)) /
        (vertical ? BIG_DATA_CONFIG.sceneScalePortrait : BIG_DATA_CONFIG.sceneScale);
      cam.position.z += (z - cam.position.z) * 0.15;
    }

    const g = group.current;
    if (!g) return;
    let px = 0;
    let py = 0;
    if (!motion.reduced) {
      if (pointer.touch) {
        const t = state.clock.elapsedTime;
        px = Math.sin(t * 0.21) * 0.5;
        py = Math.sin(t * 0.15 + 1.2) * 0.35;
      } else {
        px = pointer.x;
        py = pointer.y;
      }
    }
    const s = BIG_DATA_CONFIG.mouseInfluence * parallax * DEG;
    const tx = tilt[0] * DEG - py * s;
    const ty = tilt[1] * DEG + px * s;
    g.rotation.x += (tx - g.rotation.x) * 0.05;
    g.rotation.y += (ty - g.rotation.y) * 0.05;
  });

  return (
    <>
      <PerspectiveCamera ref={camRef} makeDefault fov={40} position={[0, 0, 12]} near={0.1} far={100} />
      <color attach="background" args={[BIG_DATA_CONFIG.backgroundColor]} />
      <group ref={group}>
        <group rotation={[0, 0, rotZ]} scale={scale} position={[0, shiftY, 0]}>
          {children}
        </group>
      </group>
    </>
  );
}

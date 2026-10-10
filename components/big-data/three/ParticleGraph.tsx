"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { BIG_DATA_CONFIG, particleBlending } from "../bigDataConfig";
import { motion } from "../core/env";
import type { ModuleProgress } from "../core/progress";

/**
 * Conexiones entre puntos (aristas de un grafo). Un solo LineSegments; las
 * aristas aparecen en orden según `reveal` (0–1).
 * Con `dashed`, las líneas son punteadas y los trazos avanzan en bucle
 * desde el segundo punto de cada arista hacia el primero.
 */
export interface ParticleGraphProps {
  /** Pares de puntos: [ax, ay, az, bx, by, bz] por arista. */
  segments: Float32Array;
  progress: ModuleProgress;
  drive: (p: ModuleProgress) => { reveal: number; opacity: number };
  color?: string;
  /** Líneas punteadas animadas. dash/gap: largo de trazo y hueco; speed: unidades por segundo. */
  dashed?: { dash: number; gap: number; speed: number };
}

const dashVertex = /* glsl */ `
  attribute float aDist;
  varying float vDist;
  void main() {
    vDist = aDist;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const dashFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uDash;
  uniform float uPeriod;
  uniform float uOffset;
  varying float vDist;
  void main() {
    // El patrón se desplaza con uOffset: los trazos avanzan hacia el inicio de la arista
    if (mod(vDist + uOffset, uPeriod) > uDash) discard;
    gl_FragColor = vec4(uColor, uOpacity);
  }
`;

export default function ParticleGraph({
  segments, progress, drive, color = BIG_DATA_CONFIG.lineColor, dashed,
}: ParticleGraphProps) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const offset = useRef(0);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(segments, 3));
    // Distancia desde el inicio de cada arista (0 en el primer punto)
    const dist = new Float32Array(segments.length / 3);
    for (let i = 0; i < segments.length; i += 6) {
      dist[i / 3] = 0;
      dist[i / 3 + 1] = Math.hypot(segments[i + 3] - segments[i], segments[i + 4] - segments[i + 1], segments[i + 5] - segments[i + 2]);
    }
    g.setAttribute("aDist", new THREE.BufferAttribute(dist, 1));
    return g;
  }, [segments]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const dashUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: 0 },
      uDash: { value: 0.1 },
      uPeriod: { value: 0.2 },
      uOffset: { value: 0 },
    }),
    [color]
  );

  const total = segments.length / 6;

  useFrame((_, delta) => {
    const line = lineRef.current;
    if (!line) return;
    const d = drive(progress);
    line.geometry.setDrawRange(0, Math.floor(total * Math.min(1, Math.max(0, d.reveal))) * 2);
    line.visible = d.opacity > 0.001 && d.reveal > 0.001;
    if (dashed) {
      const u = (line.material as THREE.ShaderMaterial).uniforms;
      offset.current += Math.min(delta, 0.1) * dashed.speed * (motion.reduced ? 0.2 : 1);
      u.uOpacity.value = d.opacity;
      u.uDash.value = dashed.dash;
      u.uPeriod.value = dashed.dash + dashed.gap;
      u.uOffset.value = offset.current;
    } else {
      (line.material as THREE.LineBasicMaterial).opacity = d.opacity;
    }
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry} frustumCulled={false}>
      {dashed ? (
        <shaderMaterial
          uniforms={dashUniforms}
          vertexShader={dashVertex}
          fragmentShader={dashFragment}
          transparent
          depthWrite={false}
          blending={particleBlending}
        />
      ) : (
        <lineBasicMaterial color={color} transparent opacity={0} depthWrite={false} blending={particleBlending} />
      )}
    </lineSegments>
  );
}

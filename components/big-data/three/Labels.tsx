"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Etiquetas HTML que siguen puntos 3D. El texto vive en el DOM (nítido y
 * accesible) y un componente dentro de la escena lo posiciona cada frame.
 *
 * Uso: `const labels = useLabelRefs()` en el módulo; `<LabelLayer>` en la capa
 * HTML y `<LabelProjector>` dentro de la escena, ambos con los mismos `labels`.
 */

export interface LabelItem {
  text: string;
  /** Posición en el espacio del grupo donde se coloca el proyector. */
  position: [number, number, number];
  className?: string;
  /** "start": la etiqueta empieza en el punto (crece a la derecha) en lugar
   *  de centrarse sobre él. Sirve para que no tape lo que tiene al lado. */
  align?: "center" | "start";
}

export type LabelRefs = MutableRefObject<(HTMLElement | null)[]>;

export function useLabelRefs(): LabelRefs {
  return useRef<(HTMLElement | null)[]>([]);
}

export function LabelLayer({ items, refs, className = "" }: { items: LabelItem[]; refs: LabelRefs; className?: string }) {
  return (
    <div className={`bd-labels ${className}`} aria-hidden="true">
      {items.map((item, i) => (
        <span
          key={item.text + i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={`bd-label ${item.className ?? ""}`}
        >
          {item.text}
        </span>
      ))}
    </div>
  );
}

const tmp = new THREE.Vector3();

export function LabelProjector({
  items,
  refs,
  opacity,
}: {
  items: LabelItem[];
  refs: LabelRefs;
  /** Opacidad por etiqueta (0–1) calculada cada frame. */
  opacity?: (index: number) => number;
}) {
  const anchor = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = anchor.current;
    if (!g) return;
    const cam = state.camera;
    // El tamaño real del área de la vista: el elemento padre de la capa de etiquetas
    const host = refs.current[0]?.parentElement;
    const w = host?.clientWidth ?? state.size.width;
    const h = host?.clientHeight ?? state.size.height;

    items.forEach((item, i) => {
      const el = refs.current[i];
      if (!el) return;
      tmp.set(...item.position);
      g.localToWorld(tmp);
      tmp.project(cam);
      const x = (tmp.x * 0.5 + 0.5) * w;
      const y = (-tmp.y * 0.5 + 0.5) * h;
      const ancla = item.align === "start" ? "translate(0, -50%)" : "translate(-50%, -50%)";
      el.style.transform = `${ancla} translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      el.style.opacity = String(opacity ? opacity(i) : 1);
    });
  });

  return <group ref={anchor} />;
}

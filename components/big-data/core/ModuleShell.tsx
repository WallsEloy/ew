"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { View } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import type { ModuleProgress } from "./progress";
import { registerView } from "./viewRegistry";

export interface ModuleShellProps {
  id: string;
  /** "01", "02"… */
  index: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  /** Alto total del módulo en vh. Más alto = más recorrido de scroll para sus estados. */
  height?: number;
  /** split: texto a un lado y escena al otro. wide: texto arriba y escena a lo ancho. */
  layout?: "split" | "wide";
  progress: ModuleProgress;
  /** Contenido 3D (se dibuja en el canvas compartido, recortado a esta vista). */
  scene: ReactNode;
  /** HTML encima de la escena (etiquetas, contadores…). */
  overlay?: ReactNode;
  /** true: el área de la animación ocupa el 100% del ancho de la pantalla (solo layout "wide"). */
  fullBleed?: boolean;
  /** HTML debajo del texto (lista de estados, notas…). */
  aside?: ReactNode;
}

/**
 * Contenedor de cada módulo: escena fija (sticky) mientras se recorre su
 * altura y progreso de scroll suavizado con GSAP ScrollTrigger.
 */
export default function ModuleShell({
  id, index, eyebrow, title, description, height = 150, layout = "split", progress, scene, overlay, aside, fullBleed = false,
}: ModuleShellProps) {
  const outerRef = useRef<HTMLElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerView(progress, viewRef.current);
    return () => registerView(progress, null);
  }, [progress]);
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    // Se registra ya montado (no al importar): ScrollTrigger toca el estilo del
    // <body> y, antes de hidratar, React lo veía como un desajuste.
    gsap.registerPlugin(ScrollTrigger);
    // Suavizado: el valor persigue al scroll en lugar de saltar
    const toStage = gsap.quickTo(progress, "stage", { duration: 0.7, ease: "power2.out" });
    const toView = gsap.quickTo(progress, "view", { duration: 0.5, ease: "power2.out" });

    const stage = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => toStage(self.progress),
    });
    // `view` por tramos fijos de pantalla, no como % de la altura del módulo:
    // 0→0.3 mientras entra, 0.3→0.8 mientras está fijo y 0.8→1 mientras sale.
    // Antes era proporcional a la altura y, en los módulos altos (05 mide
    // 440vh), la escena se desvanecía estando aún a la vista.
    const view = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const vh = window.innerHeight;
        const h = el.offsetHeight;
        const d = self.progress * (h + vh);
        let v;
        if (d < vh) v = 0.3 * (d / vh);
        else if (d < h) v = 0.3 + 0.5 * ((d - vh) / Math.max(1, h - vh));
        else v = 0.8 + 0.2 * ((d - h) / vh);
        toView(v);
      },
    });
    return () => {
      stage.kill();
      view.kill();
    };
  }, [progress]);

  return (
    <section id={id} ref={outerRef} className={`bd-module bd-module--${layout}${fullBleed ? " bd-module--bleed" : ""}`} style={{ height: `${height}vh` }}>
      <div className="bd-sticky">
        <div className="bd-copy">
          <span className="bd-eyebrow">
            <span className="bd-index">{index}</span> {eyebrow}
          </span>
          <h2 className="bd-title">{title}</h2>
          {description && <div className="bd-desc">{description}</div>}
          {aside}
        </div>
        <div className="bd-stage">
          <View ref={viewRef} className="bd-view">
            {scene}
          </View>
          {overlay && <div className="bd-overlay">{overlay}</div>}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";

import type { AvoidZone } from "./avoid";
import SaturnScene from "./SaturnScene";
import { listenTouch } from "@/lib/touchAttract";
import { SATURN_CONFIG, type DeviceTier, type SaturnConfig } from "./config";

function getTier(): DeviceTier {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1200) return "tablet";
  return "desktop";
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function useDeviceTier() {
  const [tier, setTier] = useState<DeviceTier>(getTier);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setTier(getTier()), 250);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return tier;
}

/** Deja de renderizar cuando el hero sale de pantalla (ahorra GPU/batería). */
function useInView(target: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);
  return inView;
}

/**
 * Mide el bloque de texto (los elementos marcados con `data-avoid`) relativo
 * al hero y devuelve la elipse que las partículas deben esquivar.
 * Se recalcula cuando cambia el tamaño del hero o de cualquier elemento
 * (p. ej. cuando carga el logo animado o las fuentes).
 */
function useAvoidZone(hero: RefObject<HTMLElement | null>, config: SaturnConfig): AvoidZone | null {
  const [zone, setZone] = useState<AvoidZone | null>(null);
  const { enabled, portraitOnly, margin, shape } = config.avoidText;

  useEffect(() => {
    const root = hero.current;
    if (!root || !enabled) return;

    const measure = () => {
      const box = root.getBoundingClientRect();
      if (portraitOnly && box.width >= box.height) {
        setZone(null);
        return;
      }
      const items = Array.from(root.querySelectorAll<HTMLElement>("[data-avoid]"))
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.height > 0);
      if (!items.length) {
        setZone(null);
        return;
      }
      const rects = items.map(({ r }) => r);
      const left = Math.min(...rects.map((r) => r.left)) - box.left;
      const right = Math.max(...rects.map((r) => r.right)) - box.left;
      const top = Math.min(...rects.map((r) => r.top)) - box.top;
      const bottom = Math.max(...rects.map((r) => r.bottom)) - box.top;
      const x = (left + right) / 2;
      const y = (top + bottom) / 2;

      if (shape === "circle") {
        // Radio = distancia al punto más lejano del contenido. Las esquinas
        // redondeadas (botones) se acortan para no agrandar el círculo de más.
        let radius = 0;
        for (const { el, r } of items) {
          const rounding = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, r.height / 2);
          const inset = rounding * (1 - Math.SQRT1_2);
          const cx = [r.left + inset, r.right - inset].map((v) => v - box.left - x);
          const cy = [r.top + inset, r.bottom - inset].map((v) => v - box.top - y);
          for (const dx of cx) for (const dy of cy) radius = Math.max(radius, Math.hypot(dx, dy));
        }
        radius += margin;
        setZone({ x, y, rx: radius, ry: radius, shape: "circle" });
      } else {
        // La superelipse ya se ciñe al rectángulo: basta con el margen
        setZone({ x, y, rx: (right - left) / 2 + margin, ry: (bottom - top) / 2 + margin, shape: "rounded" });
      }
    };

    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    root.querySelectorAll("[data-avoid]").forEach((el) => observer.observe(el));
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [hero, enabled, portraitOnly, margin, shape]);

  return enabled ? zone : null;
}

export interface SaturnCanvasProps {
  /** Elemento que recibe los eventos del mouse (el hero completo). */
  eventSource: RefObject<HTMLElement | null>;
  config?: SaturnConfig;
  className?: string;
}

export default function SaturnCanvas({ eventSource, config = SATURN_CONFIG, className }: SaturnCanvasProps) {
  const tier = useDeviceTier();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const touch = useMediaQuery("(hover: none), (pointer: coarse)");
  const inView = useInView(eventSource);
  const avoid = useAvoidZone(eventSource, config);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    listenTouch();
  }, []);

  // Escena estática solo si el movimiento reducido está configurado en 0
  const frameloop = !inView ? "never" : reducedMotion && config.reducedMotionSpeed === 0 ? "demand" : "always";

  return (
    <Canvas
      className={className}
      style={{ opacity: ready ? 1 : 0, transition: "opacity 1.2s ease" }}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      frameloop={frameloop}
      dpr={tier === "mobile" ? [1, 1.5] : [1, 2]}
      camera={{ fov: 38, position: [0, 1.4, 10], near: 0.1, far: 200 }}
      gl={{ antialias: tier !== "mobile", powerPreference: "high-performance", alpha: false }}
      onCreated={() => setReady(true)}
    >
      <SaturnScene config={config} tier={tier} touch={touch} reducedMotion={reducedMotion} avoid={avoid} />
    </Canvas>
  );
}

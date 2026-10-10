"use client";

import { useEffect, useState } from "react";
import type { DeviceTier } from "../bigDataConfig";

function readTier(): DeviceTier {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1200) return "tablet";
  return "desktop";
}

export function useDeviceTier() {
  const [tier, setTier] = useState<DeviceTier>(readTier);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setTier(readTier()), 250);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return tier;
}

/** Pantalla vertical (móvil): misma condición que el CSS de la sección. */
export function usePortrait() {
  return useMediaQuery("(max-aspect-ratio: 1/1)");
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/**
 * Posición del puntero compartida por todas las escenas (-1..1).
 * Un solo listener en window: funciona aunque el texto tape el canvas.
 */
export const pointer = { x: 0, y: 0, touch: false };

/** prefers-reduced-motion, compartido por todas las escenas. */
export const motion = { reduced: false };

let listening = false;
export function listenPointer() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  pointer.touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
  motion.reduced = rm.matches;
  rm.addEventListener("change", () => {
    motion.reduced = rm.matches;
  });
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true }
  );
}

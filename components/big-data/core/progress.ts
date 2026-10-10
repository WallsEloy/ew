/**
 * Progreso de scroll de un módulo. Lo escribe ScrollTrigger y lo leen las
 * escenas en useFrame (un objeto mutable: no provoca renders de React).
 */
export interface ModuleProgress {
  /** 0→1 mientras la escena está fija en pantalla (estados principales). */
  stage: number;
  /** Entrada 0→0.3 (asoma por abajo hasta fijarse), fija 0.3→0.8 y salida
   *  0.8→1 (se va por arriba). Por tramos de pantalla: no depende del alto. */
  view: number;
}

export const createProgress = (): ModuleProgress => ({ stage: 0, view: 0 });

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

/** Mapea `v` del rango [a, b] a 0→1 con suavizado. */
export const range = (v: number, a: number, b: number) => smooth((v - a) / (b - a));

/**
 * Reparte el progreso en `count` estados con pausa: en cada tramo el estado
 * se mantiene `hold` del tiempo y después se transforma hacia el siguiente.
 * Devuelve un valor continuo 0 … count-1 (entrada del shader `uStage`).
 */
export function heldStage(p: number, count: number, hold = 0.55) {
  if (count <= 1) return 0;
  const steps = count - 1;
  const seg = clamp01(p) * steps;
  const i = Math.min(Math.floor(seg), steps - 1);
  const f = seg - i;
  return i + range(f, hold * 0.5, 1 - hold * 0.5);
}

/**
 * Opacidad de entrada/salida a partir de `view`. Aparece mientras el módulo
 * sube del 90 % al 30 % de la pantalla y se desvanece cuando el centro de la
 * escena ya pasó el borde superior, no antes.
 */
export const fadeInOut = (view: number) => range(view, 0.03, 0.21) * (1 - range(view, 0.88, 0.98));

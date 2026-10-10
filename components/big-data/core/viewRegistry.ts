import type { ModuleProgress } from "./progress";

/**
 * Relaciona el progreso de cada módulo con el elemento HTML de su vista 3D.
 * Las escenas lo usan para saber dónde están en pantalla (efecto táctil).
 */
const views = new WeakMap<ModuleProgress, HTMLElement>();

export function registerView(progress: ModuleProgress, el: HTMLElement | null) {
  if (el) views.set(progress, el);
  else views.delete(progress);
}

export function viewRect(progress: ModuleProgress) {
  return views.get(progress)?.getBoundingClientRect() ?? null;
}

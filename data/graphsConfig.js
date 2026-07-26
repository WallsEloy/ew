// Config editable del panel de grafos visuales ("Área dos").
// Solo el TEXTO (título + párrafo) por escena y la CANTIDAD de escenas.
// La geometría de nodos NO es editable: se toma de data/visualGraphs.js.
import { visualGraphScenes } from "./visualGraphs";

export const defaultGraphsConfig = {
  scenes: visualGraphScenes.map((s) => ({ title: s.title, text: s.text })),
};

export function makeBlankScene() {
  return { title: "", text: "" };
}

// Normaliza la config guardada; si no hay escenas válidas, usa los defaults.
export function mergeGraphsConfig(saved) {
  if (!saved || !Array.isArray(saved.scenes)) return defaultGraphsConfig;
  const scenes = saved.scenes
    .filter((s) => s && typeof s === "object")
    .map((s) => ({ title: String(s.title ?? ""), text: String(s.text ?? "") }));
  return { scenes: scenes.length ? scenes : defaultGraphsConfig.scenes };
}

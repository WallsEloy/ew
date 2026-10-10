import * as THREE from "three";
import { BIG_DATA_CONFIG } from "../bigDataConfig";

/** PRNG determinista: mismas formas en cada carga. */
export function rng(seed = 1) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rand = () => number;
export const gauss = (r: Rand) => (r() + r() + r() + r() - 2) / 2;

const paletteColors = BIG_DATA_CONFIG.particleColor.map((c) => new THREE.Color(c));
const errColor = new THREE.Color(BIG_DATA_CONFIG.errorColor);

/** Color de la paleta (0 blanco … 3 violeta) con mezcla continua. */
export function paletteAt(m: number, out = new THREE.Color()) {
  const t = Math.min(3, Math.max(0, m));
  const i = Math.min(2, Math.floor(t));
  return out.copy(paletteColors[i]).lerp(paletteColors[i + 1], t - i);
}

export function fillColors(n: number, pick: (i: number) => number | THREE.Color) {
  const arr = new Float32Array(n * 3);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const v = pick(i);
    const col = typeof v === "number" ? paletteAt(v, c) : v;
    arr[i * 3] = col.r;
    arr[i * 3 + 1] = col.g;
    arr[i * 3 + 2] = col.b;
  }
  return arr;
}

export const errorRgb = errColor;

/** Crea un array de posiciones llamando `fn(i)` → [x, y, z]. */
export function positions(n: number, fn: (i: number) => [number, number, number]) {
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const [x, y, z] = fn(i);
    arr[i * 3] = x;
    arr[i * 3 + 1] = y;
    arr[i * 3 + 2] = z;
  }
  return arr;
}

/** Un valor por partícula. */
export function perParticle(n: number, fn: (i: number) => number) {
  const arr = new Float32Array(n);
  for (let i = 0; i < n; i++) arr[i] = fn(i);
  return arr;
}

/** Punto aleatorio dentro de una esfera (más denso al centro si `bias` > 1). */
export function inSphere(r: Rand, radius: number, bias = 1): [number, number, number] {
  const u = r() * 2 - 1;
  const th = r() * Math.PI * 2;
  const rad = radius * Math.pow(r(), bias / 3);
  const s = Math.sqrt(1 - u * u);
  return [Math.cos(th) * s * rad, u * rad, Math.sin(th) * s * rad];
}

/** Nube caótica: varias manchas y filamentos. */
export function chaosCloud(r: Rand, w: number, h: number, d: number): [number, number, number] {
  if (r() < 0.35) {
    // filamento curvo
    const t = r() * Math.PI * 2;
    const k = Math.floor(r() * 3);
    return [Math.cos(t * (1 + k)) * w * 0.45 + gauss(r) * 0.15, Math.sin(t * 2 + k) * h * 0.35 + gauss(r) * 0.15, gauss(r) * d * 0.5];
  }
  return [gauss(r) * w * 0.5, gauss(r) * h * 0.5, gauss(r) * d * 0.5];
}

/** Rejilla ordenada (filas × columnas) centrada. */
export function gridPoint(i: number, cols: number, rows: number, gap: number, cx = 0, cy = 0, cz = 0): [number, number, number] {
  const c = i % cols;
  const rIdx = Math.floor(i / cols) % rows;
  return [cx + (c - (cols - 1) / 2) * gap, cy - (rIdx - (rows - 1) / 2) * gap, cz];
}

/** Gráfica de barras ascendente formada por puntos. */
export function barChartPoint(r: Rand, bars: number, width: number, height: number, baseY: number): [number, number, number] {
  const b = Math.floor(r() * bars);
  const barW = (width / bars) * 0.62;
  const x = -width / 2 + (b + 0.5) * (width / bars) + (r() - 0.5) * barW;
  const hb = height * (0.18 + 0.82 * Math.pow((b + 1) / bars, 1.15));
  return [x, baseY + r() * hb, (r() - 0.5) * 0.25];
}

/** Línea de tendencia ascendente con área debajo. */
export function trendPoint(r: Rand, width: number, height: number, baseY: number): [number, number, number] {
  const t = r();
  const x = -width / 2 + t * width;
  const y = baseY + height * (0.12 + 0.88 * Math.pow(t, 1.6)) + Math.sin(t * 14) * 0.08;
  if (r() < 0.55) return [x, y + gauss(r) * 0.03, gauss(r) * 0.05];
  return [x, baseY + r() * (y - baseY), (r() - 0.5) * 0.15];
}

export const TAU = Math.PI * 2;

// Configuración de la experiencia Big Data. Cambia aquí cantidades, colores y
// velocidades sin tocar los módulos.

import * as THREE from "three";

export type DeviceTier = "mobile" | "tablet" | "desktop";
export type BigDataTheme = "light" | "dark";

/**
 * Colores por tema. En fondo blanco las partículas no pueden "sumar luz"
 * (AdditiveBlending no se vería): usan mezcla normal y tonos oscuros.
 */
const THEMES = {
  light: {
    /** Fondo de cada escena (y de la sección, en BigData.css). */
    backgroundColor: "#ffffff",
    /** Paleta: tinta, azul cielo, azul, violeta. */
    particleColor: ["#1b1f5e", "#1fa2ff", "#3f6bff", "#7b3fe4"] as [string, string, string, string],
    /** Datos erróneos (Veracity) y filtrados. */
    errorColor: "#e8467a",
    /** Líneas de conexiones y grafos. */
    lineColor: "#4a5cff",
    /** Módulo 03: borde y atmósfera del planeta. */
    rimColor: "#7b3fe4",
    atmosphereColor: "#4d8dff",
    /** Halo del planeta (0 = sin halo; sobre blanco se ve como un disco). */
    planetGlow: 0,
    /** Brillo del halo de cada partícula (0–1.5). */
    glowIntensity: 0.35,
    /** Multiplicador de opacidad (en blanco hace falta más cuerpo). */
    alphaBoost: 1.6,
    blending: "normal" as "normal" | "additive",
  },
  dark: {
    backgroundColor: "#04050d",
    /** Paleta: blanco, cyan, azul, violeta. */
    particleColor: ["#f2f4ff", "#7fe7ff", "#5b8cff", "#a678ff"] as [string, string, string, string],
    errorColor: "#ff7a9a",
    lineColor: "#7fe7ff",
    rimColor: "#7fe7ff",
    atmosphereColor: "#3c7bff",
    planetGlow: 0.6,
    glowIntensity: 1,
    alphaBoost: 1,
    blending: "additive" as "normal" | "additive",
  },
};

/** Tema activo: "light" (fondo blanco) o "dark" (fondo negro). */
const THEME = "dark" as BigDataTheme;

export const BIG_DATA_CONFIG = {
  theme: THEME,
  /** Colores del tema activo (backgroundColor, particleColor, errorColor…). */
  ...THEMES[THEME],
  themes: THEMES,

  /**
   * Densidad global de partículas. 16000 = la cantidad pensada para cada
   * módulo; 8000 reduce todos los módulos a la mitad, 24000 los aumenta 50 %.
   */
  particleCount: 16000,
  /** Multiplicador de partículas por dispositivo. */
  tierMultiplier: { desktop: 1, tablet: 0.7, mobile: 0.4 } as Record<DeviceTier, number>,
  /** Atajo para ajustar solo móvil (se multiplica con tierMultiplier.mobile). */
  mobileParticleMultiplier: 1,

  /** Tamaño base de las partículas. */
  particleSize: 1.6,
  /** Tamaño de las escenas en pantalla: 1 = encuadre original, 1.25 = 25 % más
   *  grandes (la cámara se acerca). Afecta a todos los módulos. */
  sceneScale: 1.25,
  /** Lo mismo en pantallas verticales (móvil): el área ya ocupa todo el ancho,
   *  así que se amplía menos para que las escenas altas no se corten. */
  sceneScalePortrait: 1.15,
  /** Velocidad general de las animaciones ambientales (1 = normal). */
  animationSpeed: 1,
  /** Cuánto inclinan las escenas al mover el mouse (grados). */
  mouseInfluence: 5,

  /** Módulo 03: órbitas (anillos) y su velocidad. */
  orbitCount: 26,
  orbitSpeed: 3,
  orbitParticles: { desktop: 30000, tablet: 20000, mobile: 11000 } as Record<DeviceTier, number>,

  /** Módulo 08: número de clusters. */
  clusterCount: 4,
} as const;

export type BigDataConfig = typeof BIG_DATA_CONFIG;

/** Mezcla de las partículas según el tema. */
export const particleBlending: THREE.Blending =
  BIG_DATA_CONFIG.blending === "additive" ? THREE.AdditiveBlending : THREE.NormalBlending;

/** Cantidad de partículas para un módulo según dispositivo. */
export function scaledCount(base: number, tier: DeviceTier, config: BigDataConfig = BIG_DATA_CONFIG) {
  const mobileExtra = tier === "mobile" ? config.mobileParticleMultiplier : 1;
  const density = config.particleCount / 16000;
  return Math.max(1, Math.round(base * density * config.tierMultiplier[tier] * mobileExtra));
}

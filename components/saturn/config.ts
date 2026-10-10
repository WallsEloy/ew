// Configuración central del hero "Saturno".
// Todo lo ajustable vive aquí: cámbialo y la escena se regenera sola.

export type DeviceTier = "mobile" | "tablet" | "desktop";
export type SaturnTheme = "light" | "dark";

export interface SaturnColors {
  /** Paleta de las partículas (se mezclan entre sí). */
  particles: [string, string, string, string];
  rim: string;
  atmosphere: string;
  keyLight: string;
  fillLight: string;
  background: string;
}

export interface SaturnConfig {
  /**
   * "dark": fondo negro, partículas que suman luz (additive), estrellas y bloom.
   * "light": fondo blanco, partículas oscuras con mezcla normal, sin estrellas ni bloom.
   */
  theme: SaturnTheme;
  /** Partículas de los anillos según dispositivo. */
  particles: Record<DeviceTier, number>;
  /** Partículas que forman la esfera del planeta según dispositivo. */
  planetParticles: Record<DeviceTier, number>;
  /** Estrellas de fondo según dispositivo. */
  stars: Record<DeviceTier, number>;
  /** Número de bandas orbitales (20–35 recomendado). */
  ringCount: number;
  /** Radio del planeta en unidades de escena. */
  planetRadius: number;
  /** Radio interior/exterior de los anillos, en múltiplos del radio del planeta. */
  ringInner: number;
  ringOuter: number;
  /** Hueco entre bandas de los anillos (0 = pegadas, 0.45 = separadas, máx. ~0.9). */
  bandGap: number;
  /** Multiplicador global de velocidad orbital (1 = normal). */
  speed: number;
  /**
   * Velocidad cuando el sistema pide reducir movimiento (p. ej. Windows con
   * "Efectos de animación" apagado). 0 = escena quieta; 0.35 = giro lento.
   */
  reducedMotionSpeed: number;
  /** Rotación propia del planeta (rad/s). */
  planetSpin: number;
  /**
   * En pantallas verticales (móvil), ancho de la esfera respecto al ancho de
   * pantalla. >1 la hace más ancha que la pantalla (los lados se recortan).
   */
  portraitSphereWidth: number;
  /** Inclinación de los anillos y el planeta, en grados. */
  tilt: { x: number; z: number };
  /** Colores por tema. */
  colors: Record<SaturnTheme, SaturnColors>;
  /** Tamaño base de las partículas. */
  particleSize: number;
  /** Tamaño de las partículas en móvil (la cámara está más cerca, conviene algo menor). */
  particleSizeMobile: number;
  /**
   * Las partículas esquivan el bloque de texto (logo, título, botones).
   * margin: px de aire alrededor del texto. reach: grosor de la franja donde
   * se acomodan las partículas apartadas (1.12 = 12% del tamaño del texto).
   */
  avoidText: {
    enabled: boolean;
    portraitOnly: boolean;
    /** "circle": círculo perfecto alrededor del texto. "rounded": rectángulo redondeado ceñido. */
    shape: "circle" | "rounded";
    margin: number;
    reach: number;
  };
  /** true: partículas 100% opacas. false: transparencia variable (brillo, profundidad, destello). */
  solidParticles: boolean;
  /** Intensidad del halo/atmósfera del planeta (0 = sin halo, hasta 2). */
  glowIntensity: number;
  /** Bloom de postprocesado. `enabled` por dispositivo. */
  bloom: {
    enabled: Record<DeviceTier, boolean>;
    intensity: number;
    threshold: number;
    radius: number;
  };
  /** Parallax con el mouse. */
  mouse: {
    enabled: boolean;
    /** Inclinación máxima en grados. */
    strength: number;
    /** Suavizado (0–1). Más bajo = más lento y suave. */
    damping: number;
    /** En dispositivos táctiles se usa un vaivén automático lento. */
    autoSwayOnTouch: boolean;
  };
}

export const SATURN_CONFIG: SaturnConfig = {
  theme: "dark",
  particles: { mobile: 2800, tablet: 5000, desktop: 8000 },
  planetParticles: { mobile: 2200, tablet: 4000, desktop: 6000 },
  stars: { mobile: 1200, tablet: 2000, desktop: 3000 },
  ringCount: 28,
  planetRadius: 1.4,
  ringInner: 1.3,
  ringOuter: 2.55,
  bandGap: 0.45,
  speed: 3.5,
  reducedMotionSpeed: 0.35,
  planetSpin: 0.08,
  portraitSphereWidth: 1.15,
  tilt: { x: 24, z: -12 },
  colors: {
    light: {
      // violeta y azul cielo, alternados para que la mezcla quede en esa gama
      particles: ["#7b3fe4", "#3fb8ff", "#5a2fc2", "#1fa2ff"],
      rim: "#7b3fe4",
      atmosphere: "#4d8dff",
      keyLight: "#4fd8ff",
      fillLight: "#8b5cff",
      background: "#ffffff",
    },
    dark: {
      // blanco, cyan, azul, violeta
      particles: ["#ffffff", "#7fe7ff", "#4d7dff", "#a678ff"],
      rim: "#5fd4ff",
      atmosphere: "#3c7bff",
      keyLight: "#4fd8ff",
      fillLight: "#8b5cff",
      background: "#03040a",
    },
  },
  particleSize: 3,
  particleSizeMobile: 3,
  avoidText: { enabled: false, portraitOnly: true, shape: "circle", margin: 4, reach: 1.12 },
  solidParticles: true,
  glowIntensity: 0,
  bloom: {
    enabled: { mobile: false, tablet: true, desktop: true },
    intensity: 0.55,
    threshold: 0.15,
    radius: 0.6,
  },
  mouse: {
    enabled: true,
    strength: 6,
    damping: 0.04,
    autoSwayOnTouch: true,
  },
};

export const deg = (d: number) => (d * Math.PI) / 180;

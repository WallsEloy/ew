import * as THREE from "three";

/**
 * Atracción táctil para los sistemas de partículas (hero y sección Big Data).
 *
 * En móvil no hay puntero, así que el parallax de mouse no se ve. En su lugar,
 * mientras el dedo toca la pantalla (también al hacer scroll) las partículas
 * se desplazan rápido hacia él; al soltar vuelven a su sitio.
 *
 * El desplazamiento se hace en pantalla, en el vertex shader (`touchGlsl`).
 * Cada escena llama a `updateTouch` en su useFrame con el rectángulo de su
 * vista para convertir la posición del dedo a sus coordenadas.
 */

/** Posición del dedo en píxeles de la ventana. */
export const touchState = { active: false, x: 0, y: 0 };

let listening = false;
export function listenTouch() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const set = (e: TouchEvent) => {
    const t = e.touches[0];
    if (!t || reduced.matches) return;
    touchState.active = true;
    touchState.x = t.clientX;
    touchState.y = t.clientY;
  };
  const end = (e: TouchEvent) => {
    if (e.touches.length === 0) touchState.active = false;
  };
  // passive: no bloquea el scroll
  window.addEventListener("touchstart", set, { passive: true });
  window.addEventListener("touchmove", set, { passive: true });
  window.addEventListener("touchend", end, { passive: true });
  window.addEventListener("touchcancel", end, { passive: true });
}

/** Ajustes del efecto. */
export const TOUCH_CONFIG = {
  /** Atracción que reciben todas las partículas (0–1). */
  base: 0.4,
  /** Atracción extra de las que están cerca del dedo (0–1). */
  near: 0.45,
  /** Qué tan rápido acuden al dedo y qué tan rápido vuelven al soltar. */
  speedIn: 9,
  speedOut: 3.5,
};

/**
 * GLSL: `touchAttract(clip, jitter)` desplaza la posición proyectada hacia el
 * dedo. `jitter` (0–1, por partícula) evita que todas se muevan igual.
 */
export const touchGlsl = /* glsl */ `
  uniform vec3 uTouch;        // xy: dedo en NDC de la vista; z: intensidad 0–1
  uniform float uTouchAspect; // ancho / alto de la vista
  uniform float uTouchBase;
  uniform float uTouchNear;

  vec4 touchAttract(vec4 clip, float jitter) {
    if (uTouch.z < 0.001 || clip.w <= 0.0) return clip;
    vec2 ndc = clip.xy / clip.w;
    vec2 d = uTouch.xy - ndc;
    vec2 da = vec2(d.x * uTouchAspect, d.y);
    float near = exp(-dot(da, da) * 1.6);
    float pull = uTouch.z * (uTouchBase + uTouchNear * near) * (0.7 + 0.3 * jitter);
    ndc += d * pull;
    clip.xy = ndc * clip.w;
    return clip;
  }
`;

export function createTouchUniforms() {
  return {
    uTouch: { value: new THREE.Vector3(0, 0, 0) },
    uTouchAspect: { value: 1 },
    uTouchBase: { value: TOUCH_CONFIG.base },
    uTouchNear: { value: TOUCH_CONFIG.near },
  };
}

/** Estado por material: intensidad actual (sube rápido, baja más despacio). */
export interface TouchDriver {
  strength: number;
}

/**
 * Actualiza los uniforms de un material. `getRect` devuelve el rectángulo en
 * pantalla de la vista/canvas donde se dibuja la escena.
 */
export function updateTouch(
  uniforms: Record<string, THREE.IUniform>,
  driver: TouchDriver,
  getRect: () => DOMRect | null | undefined,
  dt: number
) {
  if (!uniforms.uTouch) return;
  const wantsTouch = touchState.active;
  if (!wantsTouch && driver.strength < 0.001) {
    driver.strength = 0;
    (uniforms.uTouch.value as THREE.Vector3).z = 0;
    return;
  }
  const rect = getRect();
  const target = wantsTouch && rect ? 1 : 0;
  const k = target > driver.strength ? TOUCH_CONFIG.speedIn : TOUCH_CONFIG.speedOut;
  driver.strength += (target - driver.strength) * Math.min(1, dt * k);

  const v = uniforms.uTouch.value as THREE.Vector3;
  if (rect && rect.width > 0 && rect.height > 0) {
    if (wantsTouch) {
      v.x = ((touchState.x - rect.left) / rect.width) * 2 - 1;
      v.y = -(((touchState.y - rect.top) / rect.height) * 2 - 1);
    }
    uniforms.uTouchAspect.value = rect.width / rect.height;
  }
  v.z = driver.strength;
}

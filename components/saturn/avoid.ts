import * as THREE from "three";

/**
 * Zona que las partículas deben esquivar (el bloque de texto del hero), en
 * píxeles CSS relativos a la esquina superior izquierda del canvas.
 */
export interface AvoidZone {
  /** Centro. */
  x: number;
  y: number;
  /** Semiejes del rectángulo redondeado (superelipse) que rodea el texto. */
  rx: number;
  ry: number;
  /** Forma: círculo perfecto o rectángulo redondeado (superelipse). */
  shape: "circle" | "rounded";
}

/** Uniforms que necesita `avoidGlsl`. */
export function createAvoidUniforms() {
  return {
    uAvoid: { value: new THREE.Vector4(0, 0, 1, 1) },
    uViewport: { value: new THREE.Vector2(1, 1) },
    uAvoidOn: { value: 0 },
    uAvoidReach: { value: 1.12 },
    uAvoidShape: { value: 0 },
  };
}

/** Actualiza los uniforms de esquiva en un material ya creado. */
export function updateAvoidUniforms(
  uniforms: Record<string, THREE.IUniform>,
  zone: AvoidZone | null,
  viewport: { width: number; height: number },
  reach: number
) {
  (uniforms.uViewport.value as THREE.Vector2).set(viewport.width, viewport.height);
  uniforms.uAvoidReach.value = reach;
  uniforms.uAvoidOn.value = zone ? 1 : 0;
  if (zone) {
    (uniforms.uAvoid.value as THREE.Vector4).set(zone.x, zone.y, Math.max(zone.rx, 1), Math.max(zone.ry, 1));
    uniforms.uAvoidShape.value = zone.shape === "circle" ? 0 : 1;
  }
}

/**
 * GLSL: desplaza en pantalla las partículas que caen sobre el texto.
 * Forma: círculo perfecto, o superelipse (rectángulo redondeado) ceñida al texto.
 * Solo se mueven las partículas que caen dentro de esa forma: se colocan justo
 * en su borde, en una franja de grosor `reach - 1`; las de fuera no se tocan.
 * Al girar la escena parece que fluyen alrededor del texto.
 */
export const avoidGlsl = /* glsl */ `
  uniform vec4 uAvoid;
  uniform vec2 uViewport;
  uniform float uAvoidOn;
  uniform float uAvoidReach;
  uniform float uAvoidShape;

  vec4 avoidText(vec4 clip) {
    if (uAvoidOn < 0.5 || clip.w <= 0.0) return clip;
    vec2 ndc = clip.xy / clip.w;
    vec2 px = vec2((ndc.x * 0.5 + 0.5) * uViewport.x, (0.5 - ndc.y * 0.5) * uViewport.y);
    vec2 rel = (px - uAvoid.xy) / uAvoid.zw;
    // Círculo: distancia normal. Rectángulo redondeado: norma de superelipse (exp. 4)
    vec2 r2 = rel * rel;
    float d = uAvoidShape < 0.5 ? length(rel) : pow(r2.x * r2.x + r2.y * r2.y, 0.25);
    if (d >= 1.0) return clip;
    vec2 dir = d > 0.0001 ? rel / d : vec2(0.0, -1.0);
    // Las más cercanas al centro quedan algo más afuera, para no apilarlas en una línea
    float nd = 1.0 + (1.0 - d) * (uAvoidReach - 1.0);
    vec2 npx = uAvoid.xy + dir * nd * uAvoid.zw;
    clip.xy = vec2(npx.x / uViewport.x * 2.0 - 1.0, 1.0 - npx.y / uViewport.y * 2.0) * clip.w;
    return clip;
  }
`;

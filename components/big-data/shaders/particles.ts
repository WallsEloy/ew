// GLSL compartido por los sistemas de partículas. Se guardan como strings de
// TypeScript (Next no carga archivos .glsl sin configurar un loader).

/** Tamaño en pantalla con perspectiva y tope proporcional. */
export const pointSizeGlsl = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  float pointSize(float base, vec4 mv) {
    return min(base * uSize * uPixelRatio * (11.0 / -mv.z), 6.0 * uSize * uPixelRatio);
  }
`;

/** Disco con núcleo brillante y halo suave (glow sutil). */
export const glowFragment = /* glsl */ `
  uniform float uGlow;
  uniform float uAlphaBoost;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.12, d);
    float halo = smoothstep(0.5, 0.0, d);
    float a = min(1.0, (core * 0.85 + halo * halo * 0.6 * uGlow) * vAlpha * uAlphaBoost);
    gl_FragColor = vec4(vColor, a);
  }
`;

/** Círculo sólido de borde nítido, sin halo (solo ~1px de antialias). */
export const solidFragment = /* glsl */ `
  uniform float uAlphaBoost;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float aa = fwidth(d);
    float disc = 1.0 - smoothstep(0.5 - aa, 0.5, d);
    gl_FragColor = vec4(vColor, disc * clamp(vAlpha * uAlphaBoost * 2.0, 0.0, 1.0));
  }
`;

/** Paleta continua de 4 colores (0 → 3). */
export const paletteGlsl = /* glsl */ `
  uniform vec3 uC0;
  uniform vec3 uC1;
  uniform vec3 uC2;
  uniform vec3 uC3;
  vec3 palette(float m) {
    vec3 c = mix(uC0, uC1, clamp(m, 0.0, 1.0));
    c = mix(c, uC2, clamp(m - 1.0, 0.0, 1.0));
    return mix(c, uC3, clamp(m - 2.0, 0.0, 1.0));
  }
`;

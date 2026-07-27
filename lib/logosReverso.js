/*
 * Logos que pueden ir en la parte superior del reverso de una tarjeta.
 * Vive aparte (sin dependencias de servidor) porque lo usan las dos orillas:
 * el editor del dashboard para pintar el selector y portfolioServer para
 * normalizar lo que se guarda en portfolio_projects.metadata.logoReverso.
 *
 * Son el mismo logotipo horizontal en dos colores; los originales están en
 * public/humans/LOGO (nombres con espacios, por eso se copiaron a /SVG).
 */
export const LOGOS_REVERSO = [
  { key: "morado", label: "Morado", src: "/SVG/ew_logo_morado.svg" },
  { key: "dorado", label: "Dorado", src: "/SVG/ew_logo_dorado.svg" },
];

// El que se usa cuando la pieza no ha elegido (todas las anteriores a esto).
export const LOGO_REVERSO_DEFECTO = "morado";

// Normaliza una clave: si viene vacía o desconocida, cae en el default.
export function normalizarLogoReverso(key) {
  return LOGOS_REVERSO.some((l) => l.key === key) ? key : LOGO_REVERSO_DEFECTO;
}

// Clave -> ruta del SVG. Siempre devuelve algo pintable.
export function resolveLogoReverso(key) {
  const clave = normalizarLogoReverso(key);
  return LOGOS_REVERSO.find((l) => l.key === clave).src;
}

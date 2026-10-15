// Manifiesto de la app web. `orientation: "portrait"` bloquea la pantalla en
// vertical cuando el sitio se instala ("Añadir a pantalla de inicio"). En el
// navegador normal no se puede bloquear el giro: ahí se muestra el aviso
// .aviso-girar (globals.css) mientras el teléfono está en horizontal.
export default function manifest() {
  return {
    name: "Eloy Walls · Portafolio",
    short_name: "Eloy Walls",
    description: "Portafolio de Eloy Walls: branding, identidad visual, diseño web, desarrollo y fotografía.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [{ src: "/SVG/ew_white.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

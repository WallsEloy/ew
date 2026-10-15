import Navbar from "../components/Navbar";
import MobileDockSpacer from "../components/MobileDockSpacer";
import { getNavConfig } from "../lib/navConfig";
import "./globals.css";

export const metadata = {
  title: {
    default: "Eloy Walls · Portafolio",
    template: "%s | Eloy Walls",
  },
  description:
    "Portafolio de Eloy Walls: branding, identidad visual, diseño web, desarrollo y fotografía.",
};

export default async function RootLayout({ children }) {
  // La config del navbar se lee en el servidor y se cachea con la página: el
  // navbar no hace una petición propia ni parpadea con los valores por defecto.
  const { config: navConfig } = await getNavConfig();
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          background: "#000",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
        className="antialiased"
      >
        <Navbar initialConfig={navConfig} />
        {/* Espaciador solo móvil: reserva la altura del nav fijo (94px) para que
            empuje el contenido hacia abajo y no lo tape. En desktop se oculta. */}
        <div
          aria-hidden="true"
          className="site-mobile-nav-spacer md:hidden h-[94px]"
        />
        {children}
        {/* Espaciador solo móvil: reserva el alto del dock inferior fijo */}
        <MobileDockSpacer />
        {/* Celular en horizontal: el navegador no deja bloquear el giro, así que
            se tapa la página con este aviso hasta volver a vertical (globals.css) */}
        <div className="aviso-girar" role="alert" aria-live="polite">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/SVG/ew_white.svg" alt="" className="aviso-girar__logo" />
          <span className="aviso-girar__telefono" aria-hidden="true" />
          <p>Gira tu teléfono</p>
          <small>El sitio se ve en vertical</small>
        </div>
      </body>
    </html>
  );
}

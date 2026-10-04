"use client";

import { usePathname } from "next/navigation";

// Espaciador solo móvil al final de la página: reserva la altura del dock
// inferior fijo para que el final del contenido quede por encima de él y no
// se tape. No se pinta donde el dock no aparece (dashboard, login, registro).
export default function MobileDockSpacer() {
  const pathname = usePathname();
  if (pathname && (pathname.startsWith("/dashboard") || pathname === "/login" || pathname === "/register")) {
    return null;
  }
  return <div aria-hidden="true" className="site-mobile-dock-spacer md:hidden" />;
}

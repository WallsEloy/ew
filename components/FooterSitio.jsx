"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

// El footer del inicio, en todas las páginas del sitio. El dashboard (panel
// de administración) no lo lleva.
export default function FooterSitio() {
  const ruta = usePathname() || "";
  if (ruta.startsWith("/dashboard")) return null;
  return <Footer />;
}

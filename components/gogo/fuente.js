import { Manrope } from "next/font/google";

// Tipografía de la landing de GoGo Food (sólo se carga en esa página)
export const fuenteGogo = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--fuente-gogo", display: "swap" });

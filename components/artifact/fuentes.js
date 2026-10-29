import { Instrument_Serif, Space_Grotesk } from "next/font/google";

// Tipografías de ARTIFACT: grotesca para los titulares gigantes y una serif
// itálica para los acentos editoriales. Sólo se cargan en esa página.
export const grotesca = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--art-grotesca", display: "swap" });
export const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--art-serif", display: "swap" });

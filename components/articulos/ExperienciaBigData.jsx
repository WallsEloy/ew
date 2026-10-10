import { Dancing_Script, Poppins } from "next/font/google";
import HeroSaturn from "../saturn/HeroSaturn";
import BigDataExperience from "../big-data/BigDataExperience";
import CirculoDataPoint from "../big-data/CirculoDataPoint";
import styles from "./articulos.module.css";

// Tipografías que usan el hero y la sección Big Data (variables CSS
// --font-script y --font-sans). Se cargan solo en esta página.
const script = Dancing_Script({ subsets: ["latin"], weight: ["700"], variable: "--font-script", display: "swap" });
const sans = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });

/*
 * Artículo Big Data de Grow: hero Saturno (planeta y anillos de partículas),
 * el círculo de data points que se dibuja con el scroll y la experiencia de 9
 * módulos, todo sobre negro.
 * Componentes traídos del repositorio Singularix (components/saturn y
 * components/big-data); ver sus README.
 */
export default function ExperienciaBigData({ articulo }) {
  return (
    <main className={`${styles.experiencia} ${script.variable} ${sans.variable}`}>
      <HeroSaturn
        eyebrow={`Grow · ${articulo.categoria}`}
        title="Big Data"
        subtitle={articulo.bajada}
        primaryCta={{ label: "Explorar", href: "#big-data" }}
        secondaryCta={{ label: "Más artículos", href: "/grow/articulos" }}
      />
      <CirculoDataPoint />
      <BigDataExperience />
    </main>
  );
}

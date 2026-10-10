"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

import { SATURN_CONFIG, type SaturnConfig } from "./config";
import "./HeroSaturn.css";

// WebGL solo en el cliente: el texto del hero se renderiza en el servidor
// y el canvas aparece con un fundido cuando está listo.
const SaturnCanvas = dynamic(() => import("./SaturnCanvas"), { ssr: false });

export interface HeroSaturnProps {
  eyebrow?: string;
  /** Usa "\n" para forzar un salto de línea. */
  title?: string;
  subtitle?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** Sobrescribe la configuración de la escena (partículas, colores, etc.). */
  config?: SaturnConfig;
}

export default function HeroSaturn({
  eyebrow = "freedom",
  title = "Creamos\nlibertad",
  subtitle = "Branding, software y campañas para marcas que quieren llegar más lejos.",
  primaryCta = { label: "Ver proyectos", href: "/branding" },
  secondaryCta = { label: "Hablemos", href: "/contacto" },
  config = SATURN_CONFIG,
}: HeroSaturnProps) {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <section ref={heroRef} className={`hero-saturn hero-saturn--${config.theme}`}>
      <SaturnCanvas eventSource={heroRef} config={config} className="hero-saturn__canvas" />

      <div className="hero-saturn__vignette" aria-hidden="true" />

      <div className="hero-saturn__content">
        <div className="hero-saturn__logo" data-avoid>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/SVG/ew_isotipo-azul.svg" alt="Eloy Walls" />
        </div>
        <span className="hero-saturn__eyebrow" data-avoid>{eyebrow}</span>
        <h1 className="hero-saturn__title" data-avoid>{title}</h1>
        <p className="hero-saturn__subtitle" data-avoid>{subtitle}</p>
        <div className="hero-saturn__actions">
          <Link href={primaryCta.href} className="hero-saturn__cta hero-saturn__cta--primary" data-avoid>
            {primaryCta.label}
          </Link>
          <Link href={secondaryCta.href} className="hero-saturn__cta hero-saturn__cta--accent" data-avoid>
            {secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

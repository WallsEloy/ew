"use client";

import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.topSection}>
          {/* Logo & Tagline */}
          <div className={styles.branding}>
            <Link href="/" className={styles.logoLink} aria-label="Ir al inicio">
              <img loading="lazy" decoding="async"
                src="/SVG/ew_crema.svg"
                alt="EW Logo"
                className={styles.logo}
              />
            </Link>
            <p className={styles.tagline}>
              Estudio creativo independiente especializado en diseño interactivo,
              fotografía de autor y desarrollo de experiencias premium.
            </p>
          </div>

          {/* Links Column 1: Galerías */}
          <div className={styles.column}>
            <h3 className={styles.title}>Galerías</h3>
            <ul className={styles.linksList}>
              <li>
                <Link href="/galeria/exposiciones" className={styles.link}>
                  Exposiciones
                </Link>
                <ul className={styles.subLista}>
                  <li>
                    <Link href="/galeria/humans" className={styles.link}>
                      Humans
                    </Link>
                  </li>
                  <li>
                    <Link href="/galeria/anacronismo" className={styles.link}>
                      Anacronismo
                    </Link>
                  </li>
                  <li>
                    <Link href="/galeria/icecream" className={styles.link}>
                      Ice Cream
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link href="/galeria/sketch" className={styles.link}>
                  Sketch
                </Link>
              </li>
              <li>
                <Link href="/galeria/fotografia" className={styles.link}>
                  Fotografía
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Diseño */}
          <div className={styles.column}>
            <h3 className={styles.title}>Diseño & Tech</h3>
            <ul className={styles.linksList}>
              <li>
                <Link href="/diseno" className={styles.link}>
                  Diseño Gráfico
                </Link>
              </li>
              <li>
                <Link href="/diseno" className={styles.link}>
                  Diseño Web
                </Link>
              </li>
              <li>
                <Link href="/coding" className={styles.link}>
                  Coding
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Estudio */}
          <div className={styles.column}>
            <h3 className={styles.title}>Estudio</h3>
            <ul className={styles.linksList}>
              <li>
                <Link href="#" className={styles.link}>
                  Eventos
                </Link>
              </li>
              <li>
                <Link href="/shop" className={styles.link}>
                  Shoping
                </Link>
              </li>
              <li>
                <Link href="/contacto" className={styles.link}>
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & socials */}
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            © {currentYear} EW Portfolio Studio. Todos los derechos reservados.
          </p>

          <div className={styles.rightBox}>
            <div className={styles.socials}>
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Siguenos en Instagram"
              >
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>

              {/* Behance */}
              <a
                href="https://behance.net"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Siguenos en Behance"
              >
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 10h-6v1.5h6V10zm-.266 3c-.426-.957-1.422-1.5-2.609-1.5-1.531 0-2.5 1.055-2.5 2.5 0 1.438.922 2.5 2.531 2.5.969 0 1.953-.453 2.375-1.297h1.969c-.485 1.797-2.188 3.297-4.344 3.297-2.906 0-5.172-2.031-5.172-5.5s2.203-5.5 5.172-5.5c2.406 0 4.141 1.578 4.547 3.984h-1.969-.001zm-3.047 1.234c-.75 0-1.25.438-1.375 1.078h2.703c-.094-.656-.563-1.078-1.328-1.078zM9.047 5c1.453 0 2.594.328 3.266.953.594.547.922 1.344.922 2.297 0 1.25-.672 2.125-1.781 2.594.953.375 1.969 1.141 1.969 2.766 0 .969-.313 1.844-.922 2.453C11.828 16.719 10.438 17 9.047 17H3V5h6.047zm-1.89 4.875h1.766c.859 0 1.375-.359 1.375-1.016s-.469-.984-1.375-.984H7.157v2zm0 4.969h1.797c.922 0 1.484-.391 1.484-1.125s-.563-1.094-1.484-1.094H7.157v2.219z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Siguenos en GitHub"
              >
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
            </div>

            <button
              onClick={handleScrollTop}
              className={styles.scrollTopBtn}
              title="Volver arriba"
              aria-label="Volver al inicio de la página"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

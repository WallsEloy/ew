"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV } from "./dashboardNav";
import styles from "../../app/dashboard/layout.module.css";

// Iconos de línea sencillos (20x20, stroke currentColor).
function NavIcon({ name }) {
  const common = {
    className: styles.navIcon,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
      );
    case "carousel":
      return (
        <svg {...common}>
          <rect x="6" y="6" width="12" height="12" rx="1.5" />
          <path d="M3 9v6M21 9v6" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="m4 18 5-5 4 4 3-3 4 4" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3.5 7 8.5 6 8.5-6" />
        </svg>
      );
    case "shop":
      return (
        <svg {...common}>
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    default:
      return null;
  }
}

function isActive(pathname, item) {
  if (!pathname) return false;
  // Un ítem con hijos solo se resalta en su propia página (los hijos tienen su
  // propio resaltado por startsWith).
  if (item.exact || item.children) return pathname === item.href;
  return pathname.startsWith(item.href);
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Cerrar el drawer al cambiar de ruta.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Barra superior (solo móvil) */}
      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.hamburger}
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/dashboard" aria-label="Dashboard">
          <img src="/SVG/ew_isotipo.svg" alt="EW" className={styles.topbarLogo} />
        </Link>
      </header>

      {/* Overlay del drawer (solo móvil, cuando está abierto) */}
      {open && (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Rail / drawer */}
      <nav
        className={`${styles.rail} ${open ? styles.railOpen : ""}`}
        aria-label="Navegación del dashboard"
      >
        <Link href="/dashboard" className={styles.brand} aria-label="Dashboard">
          <img src="/SVG/ew_white.svg" alt="EW" className={styles.brandLogo} />
        </Link>

        <ul className={styles.nav}>
          {DASHBOARD_NAV.map((item) => {
            if (!item.available) {
              return (
                <li key={item.href}>
                  <span
                    className={`${styles.navItem} ${styles.navItemDisabled}`}
                    aria-disabled="true"
                    title="Próximamente"
                  >
                    <NavIcon name={item.icon} />
                    <span className={styles.navLabel}>{item.label}</span>
                    <span className={styles.soon}>Pronto</span>
                  </span>
                </li>
              );
            }
            const active = isActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <NavIcon name={item.icon} />
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>

                {Array.isArray(item.children) && item.children.length > 0 && (
                  <ul className={styles.navSub}>
                    {item.children.map((child) => {
                      const childActive = isActive(pathname, child);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`${styles.navSubItem} ${
                              childActive ? styles.navItemActive : ""
                            }`}
                            aria-current={childActive ? "page" : undefined}
                          >
                            <span className={styles.navLabel}>{child.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

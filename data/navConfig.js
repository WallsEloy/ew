// Configuración por defecto de los navegadores (nav superior + dock inferior).
// Sirve como FALLBACK si site_settings no tiene la clave 'navbar', y como base
// que consume components/Navbar.jsx. Replica EXACTAMENTE el navbar actual.

// Iconos disponibles para las pills del dock (set dibujado en Navbar.jsx).
export const PILL_ICON_PRESETS = ["tools", "bell", "brush", "case", "message"];

export const defaultNavConfig = {
  logos: {
    desktop: "/SVG/ew.svg",
    mobileIsotipo: "/SVG/ew_isotipo.svg",
  },
  auth: {
    register: { label: "Registro", href: "/register" },
    login: { label: "login", href: "/login" },
  },
  // Dock inferior móvil (pills). iconType: 'preset' (clave del set) | 'image' (URL).
  dock: [
    { label: "Diseño", href: "/diseno", iconType: "image", icon: "/Iconos/Proyectos.svg" },
    { label: "Eventos", href: "/eventos", iconType: "image", icon: "/Iconos/ARTE_iconoRecurso%202.svg" },
    { label: "Galería", href: "/galeria", iconType: "image", icon: "/Iconos/dise%C3%B1oo_iconoRecurso%205.svg" },
    { label: "Coding", href: "/coding", iconType: "image", icon: "/Iconos/portafolio_iconoRecurso%203.svg" },
    { label: "Contacto", href: "/contacto", iconType: "image", icon: "/Iconos/servicios_iconoRecurso%204.svg" },
  ],
  navLinks: [
    {
      label: "Galerias",
      href: "",
      dropdown: [
        { label: "HUMANS", href: "/galeria" },
        { label: "Ice Cream", href: "/galeria" },
        { label: "Sketch", href: "/galeria" },
        { label: "Fotografia", href: "/galeria" },
        { label: "Anacronismo", href: "/galeria" }
      ]
    },
    {
      label: "Diseño",
      href: "",
      dropdown: [
        { label: "Gráfico", href: "/diseno?vista=branding" },
        { label: "Web", href: "/diseno?vista=web" },
        { label: "Coding", href: "/coding" }
      ]
    },
    {
      label: "Grow",
      href: "",
      dropdown: [
        { label: "Opción A", href: "/grow/opcion-a" },
        { label: "Opción B", href: "#" }
      ]
    },
    {
      label: "Eventos",
      href: "",
      dropdown: [
        { label: "Próximos", href: "#" },
        { label: "Pasados", href: "#" }
      ]
    },
    {
      label: "Shoping",
      href: "/shop",
      dropdown: []
    },
    {
      label: "Contacto",
      href: "/contacto",
      dropdown: []
    }
  ],
};

// Pill en blanco para "agregar" desde el dashboard.
export function makeBlankPill() {
  return { label: "", href: "", iconType: "preset", icon: "tools" };
}

export function makeBlankNavLink() {
  return { label: "Nuevo", href: "", dropdown: [] };
}

export function makeBlankDropdownItem() {
  return { label: "Item", href: "#" };
}

// Combina la config guardada (parcial) con los defaults, por si a la BD le
// faltan claves (p. ej. tras añadir campos nuevos). Degradación elegante.
export function mergeNavConfig(saved) {
  if (!saved || typeof saved !== "object") return defaultNavConfig;
  return {
    logos: { ...defaultNavConfig.logos, ...(saved.logos || {}) },
    auth: {
      register: { ...defaultNavConfig.auth.register, ...(saved.auth?.register || {}) },
      login: { ...defaultNavConfig.auth.login, ...(saved.auth?.login || {}) },
    },
    dock: Array.isArray(saved.dock) ? saved.dock : defaultNavConfig.dock,
    navLinks: Array.isArray(saved.navLinks) ? saved.navLinks : defaultNavConfig.navLinks,
  };
}

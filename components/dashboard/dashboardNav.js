// Navegación del dashboard. Fuente única consumida por el sidebar
// (DashboardSidebar.jsx) y la portada (app/dashboard/page.jsx).
// available:false → se muestra como "Próximamente" y no navega.
export const DASHBOARD_NAV = [
  {
    href: "/dashboard",
    label: "Inicio",
    desc: "Resumen del panel de administración.",
    icon: "home",
    available: true,
    exact: true,
  },
  {
    href: "/dashboard/home",
    label: "Home",
    desc: "Paneles de edición del home: carrusel y navegadores.",
    icon: "carousel",
    available: true,
    children: [
      {
        href: "/dashboard/home/carrusel",
        label: "Carrusel",
        desc: "Edita los slides del carrusel: textos, botones, colores, imágenes y orden.",
        available: true,
      },
      {
        href: "/dashboard/home/navegadores",
        label: "Navegadores",
        desc: "Nav superior y dock inferior: logos, botones de auth y accesos.",
        available: true,
      },
      {
        href: "/dashboard/home/area-dos",
        label: "Área dos",
        desc: "Panel de grafos visuales: edita el texto y la cantidad de escenas.",
        available: true,
      },
      {
        href: "/dashboard/home/videos",
        label: "Vídeos",
        desc: "Reemplaza los vídeos de los dos módulos y edita sus textos. El póster se genera solo.",
        available: true,
      },
    ],
  },
  {
    href: "/dashboard/grow",
    label: "Grow",
    desc: "Página general, tarjetas y contenido de sus proyectos.",
    icon: "carousel",
    available: true,
  },
  {
    href: "/dashboard/diseno",
    label: "Diseño",
    desc: "Perfiles de la sección Diseño: nombre, bio, avatar, logo, stats.",
    icon: "grid",
    available: true,
  },
  {
    href: "/dashboard/galeria",
    label: "Galería",
    desc: "Perfiles y piezas de la sección Galería: imágenes, descripción y ficha técnica.",
    icon: "image",
    available: true,
  },
  {
    href: "/dashboard/contacto",
    label: "Contacto",
    desc: "Perfil, historias, redes y acordeones de la página de contacto.",
    icon: "mail",
    available: true,
  },
  {
    href: "/dashboard/shop",
    label: "Tienda",
    desc: "Gestión de la tienda virtual: categorías, productos y precios.",
    icon: "shop",
    available: true,
  },
];

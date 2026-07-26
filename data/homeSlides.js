// Contenido por defecto del carrusel del home.
// Sirve como SEED (para poblar Supabase) y como FALLBACK si la base de datos
// está vacía o no disponible. La forma de cada slide es la que consume
// components/HomeCarousel.jsx.
export const defaultHomeSlides = [
  {
    id: 0,
    title: "Galerias",
    logoText: "HUMANS",
    buttonText: "ver",
    image: "/carrusel/p-1Mesa-de-trabajo-1.webp",
    rightTitle: "OnlyFans",
    rightText:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.",
    rightColor: "#00aff0",
  },
  {
    id: 1,
    title: "Proyectos",
    logoText: "PROJECTS",
    buttonText: "descubrir",
    image: "/carrusel/p-2Mesa-de-trabajo-1.webp",
    rightTitle: "Exclusive",
    rightText:
      "Explora la exclusiva colección de nuestros mejores proyectos, cada uno elaborado con el máximo cuidado y atención al detalle para inspirar tu creatividad.",
    rightColor: "#ff0055",
  },
  {
    id: 2,
    title: "Eventos",
    logoText: "EVENTS",
    buttonText: "asistir",
    image: "/carrusel/p-3Mesa-de-trabajo-1.webp",
    rightTitle: "VIP Pass",
    rightText:
      "Únete a nosotros en nuestros próximos eventos y experimenta de primera mano la atmósfera vibrante de nuestra comunidad enfocada en el arte.",
    rightColor: "#ffd700",
  },
  {
    id: 3,
    title: "Shopping",
    logoText: "STORE",
    buttonText: "comprar",
    image: "/carrusel/p-4Mesa-de-trabajo-1.webp",
    rightTitle: "Merch",
    rightText:
      "Adquiere la última mercancía de nuestras colecciones. Ediciones limitadas disponibles solo para miembros registrados. No te quedes sin la tuya.",
    rightColor: "#ff4500",
  },
  {
    id: 4,
    title: "Contacto",
    logoText: "CONTACT",
    buttonText: "escribir",
    image: "/carrusel/p-6Mesa-de-trabajo-1.webp",
    rightTitle: "Let's Talk",
    rightText:
      "Ponte en contacto con nuestro equipo para consultas de prensa, colaboraciones o cualquier otra pregunta relacionada con nuestro trabajo.",
    rightColor: "#00fa9a",
  },
];

// Campos editables de un slide (para construir formularios y validar).
export const SLIDE_FIELDS = [
  "title",
  "logoText",
  "buttonText",
  "buttonColor",
  "image",
  "rightTitle",
  "rightText",
  "rightColor",
];

// Slide en blanco para "agregar" desde el dashboard.
// buttonColor vacío = usa el color por defecto del tema (amarillo del carrusel).
export function makeBlankSlide() {
  return {
    title: "",
    logoText: "",
    buttonText: "",
    buttonColor: "",
    image: "",
    rightTitle: "",
    rightText: "",
    rightColor: "#00aff0",
  };
}

// Área Carteles de Diseño (/diseno?vista=carteles). Cada categoría es un módulo
// de la cuadrícula; al abrirlo, sus carteles se recorren en un carrusel.
//
// Imágenes en public/carteles/<categoría>/: `<nombre>.webp` (1800 px de alto,
// para el carrusel) y `<nombre>-mini.webp` (600 px de ancho, para la portada).
// Los originales están en originales/Carteles/ (fuera de git).
// Para agregar un cartel: optimizarlo con esos dos tamaños y sumarlo a la lista.

const cartel = (categoria, nombre, ancho, alto, alt) => ({
  src: `/carteles/${categoria}/${nombre}.webp`,
  mini: `/carteles/${categoria}/${nombre}-mini.webp`,
  ancho,
  alto,
  alt,
});

// Video de una aplicación: se reproduce solo, en silencio y en bucle
const video = (nombre, alt) => ({
  video: `/carteles/moda/video/${nombre}.mp4`,
  poster: `/carteles/moda/video/${nombre}-poster.webp`,
  ancho: 1080,
  alto: 1080,
  alt,
});

export const CATEGORIAS_CARTELES = [
  {
    slug: "moda",
    nombre: "Moda",
    descripcion: "Finding Fashion 2020 · Décimo Congreso de Moda",
    carteles: [
      cartel("moda", "moda-1", 1145, 1800, "Cartel de Finding Fashion: modelo con falda roja junto a una palmera"),
      cartel("moda", "moda-2", 1139, 1800, "Cartel de Finding Fashion: vestido negro bordado entre agaves"),
      cartel("moda", "moda-3", 1129, 1800, "Cartel de Finding Fashion: modelo de espaldas con corsé bordado"),
      cartel("moda", "moda-4", 1149, 1800, "Cartel de Finding Fashion: modelo sentada con blusa bordada"),
      cartel("moda", "moda-5", 1142, 1800, "Cartel de Finding Fashion: modelo con sombrero junto a un agave"),
      cartel("moda", "moda-6", 1140, 1800, "Cartel de Finding Fashion: dos modelos con vestidos bordados"),
    ],
    // Debajo del carrusel, dentro del mismo visor (se llega con scroll).
    // Los videos muestran cómo aparece el cartel en cada pantalla.
    aplicaciones: {
      titulo: "En la calle",
      texto: "Los carteles en espectaculares, parabuses, pantallas y aparadores; en los videos, cada cartel aparece sobre su pantalla.",
      imagenes: [
        video("calle-v1", "Parabús en un andén: el cartel de la modelo con falda roja aparece en la pantalla"),
        { src: "/carteles/moda/calle-1.webp", ancho: 1600, alto: 1600, alt: "Espectacular contra el cielo con el cartel de Finding Fashion" },
        video("calle-v2", "Pantalla en un centro comercial: aparece el cartel del vestido negro bordado"),
        { src: "/carteles/moda/calle-2.webp", ancho: 1530, alto: 1530, alt: "Muro iluminado con el cartel de la modelo con sombrero" },
        video("calle-v3", "Tótem en un vestíbulo: aparece el cartel de las dos modelos"),
        { src: "/carteles/moda/calle-3.webp", ancho: 1600, alto: 1600, alt: "Espectacular al atardecer junto a una avenida" },
        video("calle-v4", "Parabús de noche: aparece el cartel de la modelo sentada"),
        { src: "/carteles/moda/calle-4.webp", ancho: 1600, alto: 1600, alt: "Aparador de una tienda con el cartel junto a un maniquí" },
        video("calle-v5", "Parabús con la ciudad de noche: aparece el cartel del corsé bordado"),
        video("calle-v6", "Celular entre agaves mostrando los carteles de Finding Fashion"),
      ],
    },
  },
  {
    slug: "sonic",
    nombre: "Sonic",
    descripcion: "Promociones para redes · Crush",
    carteles: [
      cartel("sonic", "sonic-1", 895, 1800, "Cartel de Sonic: Brown Bag Special Sunday con dos hamburguesas"),
      cartel("sonic", "sonic-2", 962, 1800, "Cartel de Sonic: 50% de descuento, compra una y llévate otra"),
      cartel("sonic", "sonic-3", 1108, 1800, "Cartel de Sonic: descarga la app"),
      cartel("sonic", "sonic-4", 996, 1800, "Cartel de Sonic: Sunday Brown Bag a $15.99 en un estadio de futbol americano"),
      cartel("sonic", "sonic-5", 985, 1800, "Cartel de Sonic: Sunday Brown Bag a $14.99 con hamburguesa y refresco"),
      cartel("sonic", "sonic-6", 1011, 1800, "Cartel de Sonic: Sunday Brown Bag a $14.99 con malteada y hamburguesa"),
      cartel("sonic", "sonic-7", 1005, 1800, "Cartel de Sonic: Corn Dogs a 50¢ todo el día en Halloween"),
      cartel("sonic", "sonic-8", 1037, 1800, "Cartel de Sonic: Sunday Brown Bag Special a $15.99"),
    ],
    // Debajo del carrusel, dentro del mismo visor (se llega con scroll)
    aplicaciones: {
      titulo: "En la calle",
      texto: "Los carteles aplicados en parabuses, carteleras y en las ventanas del restaurante.",
      imagenes: [
        { src: "/carteles/sonic/calle-1.webp", ancho: 1600, alto: 1600, alt: "Parabús en una acera con el cartel Brown Bag Special Sunday" },
        { src: "/carteles/sonic/calle-2.webp", ancho: 1600, alto: 1600, alt: "Pantalla publicitaria en una calle peatonal con el cartel Sunday Brown Bag" },
        { src: "/carteles/sonic/calle-3.webp", ancho: 1600, alto: 1600, alt: "Cartelera iluminada con el cartel Download App de Sonic" },
        { src: "/carteles/sonic/calle-4.webp", ancho: 1195, alto: 1195, alt: "Fachada de un restaurante Sonic con los carteles en las ventanas" },
      ],
    },
  },
];

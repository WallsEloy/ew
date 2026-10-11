import Image from "next/image";
import Link from "next/link";
import { Cinzel_Decorative, Courgette, Inter, Libre_Franklin, Lilita_One, Lobster, Montserrat, Nunito, Playfair_Display, Space_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { getProfileProject } from "../../../../../lib/portfolioServer";
import ColorPanel from "./ColorPanel";
import VideoTile from "./VideoTile";
import styles from "./page.module.css";

// Página en caché: el dashboard la regenera al guardar (revalidatePath) y,
// como red de seguridad, se vuelve a generar como máximo cada 5 minutos.
export const revalidate = 300;

const BRANDING_DEMO = [
  { id: "brand-workspace", image: "/branding-demo/brand-workspace.webp", caption: "Desarrollo de paleta y sistema visual" },
  { id: "brand-editorial", image: "/branding-demo/brand-editorial.webp", caption: "Proceso de construcción de marca" },
  { id: "brand-color", image: "/branding-demo/brand-color.webp", caption: "Universo cromático de la identidad" },
  { id: "brand-digital", image: "/branding-demo/brand-digital.webp", caption: "Aplicación de identidad en medios digitales" },
  { id: "brand-application", image: "/branding-demo/brand-application.webp", caption: "Texturas y recursos gráficos" },
  { id: "brand-layout", image: "/branding-demo/brand-layout.webp", caption: "Símbolo y presencia de marca" },
];

// Paleta provisional del proyecto (ink = color del texto sobre la franja)
const PALETTE = [
  { name: "Oro", hex: "#d8b45c", ink: "#1a1408" },
  { name: "Azul noche", hex: "#152a54", ink: "#eee9dc" },
  { name: "Papel", hex: "#eee9dc", ink: "#232323" },
  { name: "Tinta", hex: "#232323", ink: "#eee9dc" },
];

// Paletas por proyecto ("perfil/proyecto"), tomadas de los archivos de marca
const PROJECT_PALETTES = {
  "1/6": [
    { name: "Verde Deliz", hex: "#009e76", ink: "#ffffff" },
    { name: "Café oscuro", hex: "#1f1410", ink: "#ffffff" },
    { name: "Blanco", hex: "#ffffff", ink: "#1f1410" },
  ],
  "1/15": [
    { name: "Magenta Estancia", hex: "#af214f", ink: "#ffffff" },
    { name: "Negro", hex: "#000000", ink: "#ffffff" },
    { name: "Madera", hex: "#403f3d", ink: "#ffffff" },
    { name: "Blanco", hex: "#ffffff", ink: "#af214f" },
  ],
  "1/14": [
    { name: "Rosa Sweett", hex: "#ff9ae1", ink: "#000000" },
    { name: "Negro", hex: "#000000", ink: "#ffffff" },
    { name: "Blanco", hex: "#ffffff", ink: "#000000" },
  ],
  "1/13": [
    { name: "Índigo", hex: "#270089", ink: "#ffffff" },
    { name: "Naranja", hex: "#eb6527", ink: "#ffffff" },
    { name: "Verde", hex: "#008b3e", ink: "#ffffff" },
    { name: "Blanco", hex: "#ffffff", ink: "#270089" },
  ],
  "1/12": [
    { name: "Azul Josman", hex: "#1c3b6e", ink: "#ffffff" },
    { name: "Amarillo obra", hex: "#f0be20", ink: "#1c3b6e" },
    { name: "Gris concreto", hex: "#9ea1a2", ink: "#1c3b6e" },
    { name: "Blanco", hex: "#ffffff", ink: "#1c3b6e" },
  ],
  "1/11": [
    { name: "Morado neón", hex: "#d200ff", ink: "#ffffff" },
    { name: "Verde neón", hex: "#00c518", ink: "#000000" },
    { name: "Negro", hex: "#000000", ink: "#ffffff" },
    { name: "Degradado Creando", gradient: ["#d200ff", "#00c518"], ink: "#ffffff" },
  ],
  "1/10": [
    { name: "Negro", hex: "#000000", ink: "#ffffff" },
    { name: "Gris Trend", hex: "#f0f0f0", ink: "#000000" },
    { name: "Blanco", hex: "#ffffff", ink: "#000000" },
    { name: "Amarillo preventa", hex: "#fccc00", ink: "#000000" },
  ],
  "1/9": [
    { name: "Rosa esperanza", hex: "#e8a6c1", ink: "#5a3a48" },
    { name: "Malva", hex: "#906878", ink: "#ffffff" },
    { name: "Gris perla", hex: "#eae9e7", ink: "#5a3a48" },
    { name: "Blanco", hex: "#ffffff", ink: "#5a3a48" },
  ],
  "1/8": [
    { name: "Negro", hex: "#040405", ink: "#ffffff" },
    { name: "Blanco", hex: "#ffffff", ink: "#040405" },
    { name: "Rosa recuerdo", hex: "#f8d9e8", ink: "#040405" },
  ],
  "1/7": [
    { name: "Azul RAG", hex: "#052a4d", ink: "#ffffff" },
    { name: "Amarillo escenario", hex: "#e0cc04", ink: "#052a4d" },
    { name: "Negro", hex: "#040405", ink: "#ffffff" },
    { name: "Blanco", hex: "#ffffff", ink: "#052a4d" },
  ],
  "1/4": [
    { name: "Azul Enevesol", hex: "#0b2d60", ink: "#ffffff" },
    { name: "Amarillo solar", hex: "#f1d500", ink: "#0b2d60" },
    { name: "Blanco", hex: "#ffffff", ink: "#0b2d60" },
    { name: "Naranja energía", hex: "#c86030", ink: "#ffffff" },
  ],
  "1/0": [
    { name: "Morado profundo", hex: "#4f2980", ink: "#ffffff" },
    { name: "Violeta Yadi", hex: "#5a14c1", ink: "#ffffff" },
    { name: "Púrpura", hex: "#6813b7", ink: "#ffffff" },
    // Gradiente de la marca, construido con los tres tonos anteriores
    { name: "Gradiente Yadi", gradient: ["#4f2980", "#5a14c1", "#6813b7"], ink: "#ffffff" },
  ],
  "1/2": [
    { name: "Rojo Ham!Burger", hex: "#e00914", ink: "#ffffff" },
    { name: "Amarillo", hex: "#fae800", ink: "#000000" },
    { name: "Negro", hex: "#000000", ink: "#ffffff" },
    { name: "Blanco", hex: "#ffffff", ink: "#000000" },
  ],
};

// Imagen del hero por proyecto ("perfil/proyecto"). Un logo vectorial se
// muestra completo y centrado en vez de recortarse; `ink` tiñe el texto del
// hero con el color del logo.
const HERO_MEDIA = {
  // El logotipo del repositorio va como título (PROJECT_STORY.hero.titleLogo);
  // el sticker tornasol se lee bien sobre el morado noche de la marca
  "2/0": {
    image: null,
    ink: "#f4ecdf",
    storyInk: "#ef7d3b",
    heroBackground: "#17102a",
    pageBackground: "#0c0817",
  },
  // El logotipo del repositorio va como título (PROJECT_STORY.hero.titleLogo),
  // sobre el fondo claro de la marca (su azul marino no se leería sobre negro)
  "2/3": {
    image: null,
    ink: "#262956",
    storyInk: "#f0127d",
    heroBackground: "#f8f9fb",
  },
  "1/6": { image: "/Branding/Deliz/delizRecurso%201.svg", alt: "Logotipo de Deliz", contain: true, ink: "#009e76" },
  "1/15": {
    image: "/Branding/Estancia/logo-hero.webp",
    alt: "Isotipo de Estancia",
    contain: true,
    ink: "#e04a7c",
    storyInk: "#e04a7c",
    heroBackground: "#000000",
    pageBackground: "#000000",
  },
  "1/14": {
    image: "/Branding/Sweett/logo-hero.webp",
    alt: "Logotipo de My Sweett Audrina",
    contain: true,
    ink: "#000000",
    storyInk: "#ff9ae1",
    heroBackground: "#ff9ae1",
  },
  "1/13": {
    image: "/Branding/JOSMAN%20Textucos/logo.svg",
    alt: "Logotipo de Josman Texturizados y Adhesivos",
    contain: true,
    ink: "#270089",
    storyInk: "#eb6527",
    heroBackground: "#ffffff",
  },
  "1/12": {
    image: "/Branding/JOSMAN%20Construccion/logo.svg",
    alt: "Logotipo de Josman Concretos",
    contain: true,
    ink: "#f0be20",
    storyInk: "#f0be20",
    heroBackground: "#1c3b6e",
  },
  "1/11": {
    image: "/Branding/Creando/logo-hero.webp",
    alt: "Logotipo de Creando lo Imposible",
    contain: true,
    ink: "#00c518",
    storyInk: "#d200ff",
    heroBackground: "#000000",
    pageBackground: "#000000",
  },
  "1/10": {
    video: "/Branding/trends/video/logo-hero.mp4",
    poster: "/Branding/trends/video/logo-hero-poster.webp",
    alt: "Animación del logotipo de Trend Boutique",
    contain: true,
    ink: "#000000",
    storyInk: "#000000",
    heroBackground: "#fdfdfd",
    // Toda la página en blanco, con textos oscuros (modo claro)
    pageBackground: "#fdfdfd",
    lightPage: true,
  },
  "1/9": {
    image: "/Branding/Gotitas/isotipo-blanco.svg",
    alt: "Isotipo de Gotitas de Esperanza",
    contain: true,
    ink: "#ffffff",
    storyInk: "#e8a6c1",
    heroBackground: "#e8a6c1",
  },
  "1/8": {
    image: "/Branding/memories/logo-blanco.svg",
    alt: "Logotipo de Memories, fotografía y filmación",
    contain: true,
    ink: "#ffffff",
    storyInk: "#f8d9e8",
    heroBackground: "#040405",
  },
  "1/7": {
    image: "/Branding/RAG/logo-amarillo.svg",
    alt: "Logotipo de RAG",
    contain: true,
    ink: "#e0cc04",
    heroBackground: "#052a4d",
  },
  "1/4": {
    image: "/Branding/Enevesol/enevesol.svg",
    alt: "Isotipo de Enevesol",
    contain: true,
    ink: "#f1d500",
    heroBackground: "#0b2d60",
    // Toda la página sobre el azul de la marca
    pageBackground: "#0b2d60",
  },
  "1/0": {
    image: "/Branding/Yadi/isotipo-blanco.svg",
    alt: "Isotipo de Yadi'Studio",
    contain: true,
    ink: "#ffffff",
    storyInk: "#b38cff",
    heroBackground: "linear-gradient(90deg, #4f2980 0%, #5a14c1 50%, #6813b7 100%)",
  },
  "1/2": { image: "/Branding/HamBurguer/hamburguerRecurso%202.svg", alt: "Logotipo de Ham!Burger", contain: true, ink: "#e00914", heroBackground: "#fae800" },
};

// Tipografías provisionales del proyecto: titulares, texto y detalles
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], display: "swap", preload: false });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"], display: "swap", preload: false });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], display: "swap", preload: false });

const TYPEFACES = [
  { name: "Playfair Display", role: "Titulares", className: playfair.className, weights: "Regular 400 · Bold 700", sample: "Una identidad que se reconoce a primera vista." },
  { name: "Inter", role: "Texto", className: inter.className, weights: "Regular 400 · Semibold 600", sample: "Clara y legible en pantallas, piezas impresas y textos largos." },
  { name: "Space Mono", role: "Detalles", className: spaceMono.className, weights: "Regular 400 · Bold 700", sample: "Datos, etiquetas y cifras con carácter técnico." },
];

// Respaldos libres para las tipografías de Deliz (ver @font-face en el CSS)
const courgette = Courgette({ subsets: ["latin"], weight: "400", display: "swap", preload: false, variable: "--font-courgette" });
const libreFranklin = Libre_Franklin({ subsets: ["latin"], weight: "700", display: "swap", preload: false, variable: "--font-libre-franklin" });

// Tipografías de Ham!Burger (libres, de Google Fonts)
const lilitaOne = Lilita_One({ subsets: ["latin"], weight: "400", display: "swap", preload: false });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "800"], display: "swap", preload: false });

// Tipografías de Yadi'Studio (libres, de Google Fonts)
const cinzelDecorative = Cinzel_Decorative({ subsets: ["latin"], weight: ["400", "700"], display: "swap", preload: false });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "600"], display: "swap", preload: false });

// Tipografía de marca de Enevesol (libre, de Google Fonts)
// Tipografía de marca de Memories (libre, de Google Fonts)
const lobster = Lobster({ subsets: ["latin"], weight: "400", display: "swap", preload: false });

const montserratBlack = Montserrat({ subsets: ["latin"], weight: ["800", "900"], display: "swap", preload: false });

// Imágenes destacadas tras las tipografías ("perfil/proyecto"). Cada fila es
// una lista; el ancho de cada imagen es proporcional a su relación de aspecto,
// así todas las de una fila quedan a la misma altura sin recortarse. Los
// originales pesan mucho, así que se sirven con next/image a la medida.
// `compact`: bloque de imágenes cuadradas en `columns` columnas (3 por
// defecto) y 2 en el celular.
// Archivos WebP optimizados (originales en /originales, fuera de public)
const deliz = (name, alt, width = 1425, height = 1425) => ({ image: `/Branding/Deliz/${name}.webp`, alt, width, height });
const hamburger = (name, alt, width = 1425, height = 1425) => ({ image: `/Branding/HamBurguer/${name}.webp`, alt, width, height });
const yadi = (name, alt, width = 1200, height = 1200) => ({ image: `/Branding/Yadi/${name}.webp`, alt, width, height });
const enevesol = (name, alt, width = 1425, height = 1425) => ({ image: `/Branding/Enevesol/${name}.webp`, alt, width, height });
const rag = (name, alt, width = 1425, height = 1425) => ({ image: `/Branding/RAG/${name}.webp`, alt, width, height });
const vib = (name, alt, width = 1800, height = 1125) => ({ image: `/Web/Vibraltos/${name}.webp`, alt, width, height });
// Capturas de celular: se muestran dentro de un iPhone (device: "iphone")
const vibMovil = (name, alt) => ({ image: `/Web/Vibraltos/movil-${name}-iphone.webp`, alt, width: 720, height: 1558, device: "iphone" });
const oex = (name, alt, width = 1800, height = 1125) => ({ image: `/Web/OrderExpress/${name}.webp`, alt, width, height });
// Capturas de celular: se muestran dentro de un iPhone (device: "iphone")
const oexMovil = (name, alt) => ({ image: `/Web/OrderExpress/${name}-iphone.webp`, alt, width: 720, height: 1558, device: "iphone" });
const estancia = (name, alt, width = 1425, height = 1425) => ({ image: `/Branding/Estancia/${name}.webp`, alt, width, height });
const estanciaVideo = (name, alt, width = 720, height = 720) => ({ video: `/Branding/Estancia/video/${name}.mp4`, poster: `/Branding/Estancia/video/${name}-poster.webp`, alt, width, height });
const sweett = (name, alt, width = 1425, height = 1425) => ({ image: `/Branding/Sweett/${name}.webp`, alt, width, height });
const textucos = (name, alt, width = 1800, height = 1800) => ({ image: `/Branding/JOSMAN%20Textucos/${name}.webp`, alt, width, height });
const textucosVideo = (name, alt, width = 720, height = 720) => ({ video: `/Branding/JOSMAN%20Textucos/video/${name}.mp4`, poster: `/Branding/JOSMAN%20Textucos/video/${name}-poster.webp`, alt, width, height });
const josman = (name, alt, width = 1800, height = 1800) => ({ image: `/Branding/JOSMAN%20Construccion/${name}.webp`, alt, width, height });
const josmanVideo = (name, alt, width = 720, height = 720) => ({ video: `/Branding/JOSMAN%20Construccion/video/${name}.mp4`, poster: `/Branding/JOSMAN%20Construccion/video/${name}-poster.webp`, alt, width, height });
const creando = (name, alt, width = 1425, height = 1425) => ({ image: `/Branding/Creando/${name}.webp`, alt, width, height });
const creandoVideo = (name, alt, width = 720, height = 720) => ({ video: `/Branding/Creando/video/${name}.mp4`, poster: `/Branding/Creando/video/${name}-poster.webp`, alt, width, height });
const trend = (name, alt, width = 1800, height = 1800) => ({ image: `/Branding/trends/${name}.webp`, alt, width, height });
const trendVideo = (name, alt, width = 720, height = 720) => ({ video: `/Branding/trends/video/${name}.mp4`, poster: `/Branding/trends/video/${name}-poster.webp`, alt, width, height });
const gotitas = (name, alt, width = 1425, height = 1425) => ({ image: `/Branding/Gotitas/${name}.webp`, alt, width, height });
const memories = (name, alt, width = 1800, height = 1800) => ({ image: `/Branding/memories/${name}.webp`, alt, width, height });
const memoriesVideo = (name, alt, width = 720, height = 720) => ({ video: `/Branding/memories/video/${name}.mp4`, poster: `/Branding/memories/video/${name}-poster.webp`, alt, width, height });
// Videos optimizados (720 px, H.264) con su póster
const enevesolVideo = (name, alt) => ({ video: `/Branding/Enevesol/video/${name}.mp4`, poster: `/Branding/Enevesol/video/${name}-poster.webp`, alt, width: 720, height: 720 });
const PROJECT_FEATURES = {
  "2/0": [
    {
      story: {
        eyebrow: "Sitio del festival",
        title: "Vibra alto, vibra alteño.",
        body: [
          "Diseñé y programé el sitio de **VIBRALTOS Fest**, el festival de música electrónica de Los Altos de Jalisco: un recorrido de una sola página con el atardecer alteño —naranja, rosa, morado y turquesa— como hilo conductor.",
          "El hero recibe con el logotipo como **sticker** que se pega en pantalla, nubes, agaves y la **cuenta regresiva** al día del festival, con el botón de boletos siempre a la mano.",
        ],
      },
    },
    { items: [{ video: "/Web/Vibraltos/video/recorrido.mp4", poster: "/Web/Vibraltos/video/recorrido-poster.webp", alt: "Recorrido por el inicio del sitio de VIBRALTOS Fest: la entrada animada del hero y el scroll", width: 1280, height: 800 }] },
    { items: [vib("descubre", "El festival de Los Altos: presentación del festival"), vib("lineup", "Line up del festival sobre un cielo naranja")] },
    {
      story: {
        eyebrow: "Line up y escenarios",
        title: "Dos escenarios, una misma vibra.",
        body: [
          "El **line up** se presenta como cartel de festival y cada **escenario** tiene su propia identidad con el patrocinador. Los DJs aparecen en videos que suenan al llegar a ellos y los **DJs locales** tienen su propio sticker.",
        ],
      },
    },
    { items: [vib("escenarios", "Escenarios Duglass Whisky y Tequila Campo Azul"), vib("djs", "Conoce a los DJs: videos de los artistas")] },
    { items: [vib("djs-locales", "DJs locales con sus stickers y fotos")] },
    {
      story: {
        eyebrow: "Mucho más que música",
        title: "Un día completo en la cantera.",
        body: [
          "El sitio cuenta todo lo que pasa alrededor de la música: **experiencias de marcas**, el **wellness** de la mañana, la **Ruta Alteña** de activaciones por la región y las **Vibracoins**, la moneda del festival para canjear por bebidas.",
        ],
      },
    },
    { items: [vib("experiencias", "Más que un festival: activaciones de marcas"), vib("wellness", "Wellness de VIBRALTOS: actividades de la mañana")] },
    { items: [vib("ruta-altena", "Ruta Alteña: mapa de activaciones por la región"), vib("vibracoins", "Vibracoins: la moneda del festival")] },
    {
      story: {
        eyebrow: "Experiencia móvil",
        title: "El festival en la palma de la mano.",
        body: [
          "En el celular el sitio conserva su carácter: el sticker del logotipo, la cuenta regresiva, el line up y los accesos se reorganizan a una columna, con un menú compacto y el reproductor de la playlist siempre disponible.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        vibMovil("hero", "Inicio del sitio de VIBRALTOS en el celular"),
        vibMovil("lineup", "Line up en el celular"),
        vibMovil("vibracoins", "Vibracoins en el celular"),
        vibMovil("accesos", "Tipos de acceso en el celular"),
      ],
    },
    {
      story: {
        eyebrow: "Planear la visita",
        title: "Todo lo necesario para llegar.",
        body: [
          "Cerré el recorrido con lo práctico: una **galería** de momentos, el **programa del día** hora por hora, la **ubicación** con mapa, los **tipos de acceso** y las **preguntas frecuentes**.",
        ],
      },
    },
    { items: [vib("galeria", "Galería: momentos que se quedan"), vib("calendario", "Así será tu día: programa por horas")] },
    { items: [vib("ubicacion", "Nos vemos en la cantera: ubicación con mapa"), vib("accesos", "Tipos de acceso General y VIP")] },
    { items: [vib("faq", "Preguntas frecuentes del festival")] },
  ],
  "2/3": [
    {
      story: {
        eyebrow: "Tienda en línea",
        title: "Comprar tech con estilo express.",
        body: [
          "Diseñé y programé la **tienda en línea** de Order Express: un menú lateral de colores de marca, un banner con los productos destacados y un catálogo con filtros por categoría y precio.",
          "Cada producto tiene su **ficha completa** —galería, colores, especificaciones y descripción— y el carrito resume la compra con subtotal, envío y descuentos antes de pagar.",
        ],
      },
    },
    { items: [{ video: "/Web/OrderExpress/video/recorrido-tienda.mp4", poster: "/Web/OrderExpress/video/recorrido-tienda-poster.webp", alt: "Recorrido por la página de inicio de la tienda Order Express", width: 1280, height: 800 }] },
    { items: [oex("tienda-catalogo", "Catálogo de la tienda con filtros por categoría"), oex("tienda-producto", "Ficha de producto con galería, colores y especificaciones")] },
    { items: [oex("tienda-carrito", "Carrito con lista de productos y resumen de compra")] },
    {
      story: {
        eyebrow: "Experiencia móvil",
        title: "La tienda completa en el celular.",
        body: [
          "En el celular el menú pasa a una barra superior que se desliza, el buscador y el carrito quedan a la mano y el catálogo se reorganiza en una sola columna, sin perder ninguna función.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        oexMovil("movil-tienda-inicio", "Inicio de la tienda Order Express en el celular"),
        oexMovil("movil-tienda-2", "Secciones destacadas de la tienda en el celular"),
        oexMovil("movil-tienda-catalogo", "Catálogo de la tienda en el celular"),
        oexMovil("movil-tienda-producto", "Ficha de producto en el celular"),
      ],
    },
    {
      story: {
        eyebrow: "Panel administrativo",
        title: "Todo el negocio en un solo panel.",
        body: [
          "Detrás de la tienda construí un **panel tipo Tiendanube**: métricas de ventas, pedidos y clientes, catálogo de productos con alta y edición, ventas con filtros por estado y fichas de cliente que suben de nivel con cada compra.",
          "Los datos viven en **Supabase**: el stock baja solo cuando un pedido se paga, los totales se recalculan con cada producto y las imágenes se guardan en su propio almacenamiento.",
        ],
      },
    },
    { items: [oex("panel-dashboard", "Dashboard con ventas del día, pedidos pendientes y stock bajo")] },
    { items: [oex("panel-ventas", "Ventas con filtros por estado del pedido"), oex("panel-productos", "Catálogo de productos del panel")] },
    { items: [oex("panel-clientes", "Clientes con niveles Nuevo, Regular y VIP"), oex("panel-tienda-en-linea", "Diseño de la tienda en línea con temas")] },
    {
      story: {
        eyebrow: "Canales de venta",
        title: "Vender en línea, en persona y enviar.",
        body: [
          "El panel también integra el **punto de venta** para registrar ventas físicas con el mismo inventario y un módulo de **envíos** con tarifas por ruta y paqueterías.",
        ],
      },
    },
    { items: [oex("panel-punto-de-venta", "Punto de venta para ventas en persona"), oex("panel-envio-nube", "Módulo de envíos con tarifas y paqueterías")] },
  ],
  "1/6": [
    { items: [deliz("12", "Identidad de Deliz, aplicación", 2400, 2400), deliz("15", "Identidad de Deliz, aplicación")] },
    {
      story: {
        eyebrow: "Identidad visual y logotipo",
        title: "Carácter, cercanía y reconocimiento.",
        body: [
          "El logotipo nace del concepto «saludable delicia»: una D caligráfica que se enlaza en un trazo continuo y equilibra lo artesanal con lo **fácil de reconocer**.",
          "Lo desarrollé en versión completa e isotipo, en positivo, color y negativo, para funcionar igual de bien en pantallas, impresos, señalética y empaques.",
        ],
      },
    },
    // Variaciones (logotipo y luego isotipo, sobre blanco, verde y oscuro):
    // un solo bloque de 3 columnas en escritorio y 2 en el celular, sin huecos
    {
      compact: true,
      items: [
        deliz("1", "Logotipo de Deliz sobre blanco"), deliz("6", "Logotipo de Deliz sobre verde"), deliz("7", "Logotipo de Deliz sobre fondo oscuro"),
        deliz("2", "Isotipo de Deliz sobre blanco"), deliz("4", "Isotipo de Deliz sobre verde"), deliz("5", "Isotipo de Deliz sobre fondo oscuro"),
      ],
    },
    {
      story: {
        eyebrow: "Aplicaciones de marca",
        title: "La identidad cobra vida en cada pieza.",
        body: [
          "Una marca empieza a existir cuando interactúa con las personas. Por eso llevé el concepto a **papelería, menús, empaques, piezas promocionales y materiales de comunicación**, para que cada elemento sea una extensión natural de Deliz.",
          "Cada aplicación refuerza el reconocimiento visual y construye una experiencia más completa alrededor de cada plato.",
        ],
      },
    },
    // Aplicaciones: papelería y piezas
    { items: [deliz("10", "Papelería de Deliz: hoja membretada"), deliz("11", "Aplicación de la identidad de Deliz", 2400, 2400), deliz("13", "Aplicación de la identidad de Deliz", 2400, 2400), deliz("8", "Piezas de Deliz con fotografía de platos")] },
    {
      story: {
        eyebrow: "Punto de venta y medios digitales",
        title: "Coherente del local a la pantalla.",
        body: [
          "La identidad también convive con el espacio: sus elementos gráficos se integran al local y acompañan a cada persona desde que descubre la marca hasta que recibe su pedido.",
          "El sistema mantiene el mismo lenguaje en medios físicos y digitales —redes sociales, publicidad, promociones y futuras campañas— para que la marca pueda **evolucionar sin perder su esencia**.",
        ],
      },
    },
  ],
  "1/2": [
    {
      story: {
        eyebrow: "Identidad visual y logotipo",
        title: "Un monograma con actitud.",
        body: [
          "El logotipo une la **H y la B** en un monograma de trazo caligráfico que remata con un signo de exclamación: una expresión de antojo y entusiasmo que da nombre a la marca.",
          "Lo construí sobre una retícula para mantener sus proporciones en cualquier tamaño y lo desarrollé sobre blanco, rojo, amarillo y negro para que funcione en cualquier soporte.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        hamburger("g", "Logotipo de Ham!Burger con textura de comida"), hamburger("h", "Logotipo de Ham!Burger sobre rojo"),
        hamburger("i", "Logotipo de Ham!Burger sobre amarillo"), hamburger("k", "Logotipo de Ham!Burger sobre negro"),
      ],
    },
    {
      story: {
        eyebrow: "Packaging",
        title: "El empaque también se antoja.",
        body: [
          "Llevé la identidad a **cajas para hamburguesa y empaques de papas**, usando el monograma como patrón para que cada pedido sea un anuncio de la marca.",
          "Los empaques convierten cada entrega en una extensión de la experiencia: en el local, para llevar o a domicilio.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        hamburger("c", "Empaque de papas de Ham!Burger"), hamburger("d", "Empaque de papas de Ham!Burger, vista frontal"),
        hamburger("e", "Caja abierta para hamburguesa de Ham!Burger"), hamburger("f", "Caja cerrada para hamburguesa de Ham!Burger"),
      ],
    },
    {
      story: {
        eyebrow: "Punto de venta",
        title: "Una fachada que invita a entrar.",
        body: [
          "Trasladé la identidad a la **fachada del local**: rojo, ladrillo y el monograma en grande para que la marca se reconozca desde la calle.",
          "El espacio dialoga con el empaque y la comunicación digital, y acompaña a cada cliente desde que ve el local hasta que recibe su pedido.",
        ],
      },
    },
    { items: [hamburger("a", "Diseño de fachada de Ham!Burger"), hamburger("b", "Diseño de fachada de Ham!Burger, variante")] },
  ],
  "1/0": [
    {
      story: {
        eyebrow: "Identidad visual y logotipo",
        title: "Un arabesco con nombre propio.",
        body: [
          "El isotipo nace de los **ornamentos de la danza árabe**: curvas simétricas que se abren como un velo en movimiento y se cierran en un rombo, como el centro de gravedad de una bailarina.",
          "Lo acompañé de un logotipo con carácter y lo desarrollé en positivo, color y negativo sobre el gradiente de la marca, para que funcione igual en impresos, señalética y pantallas.",
        ],
      },
    },
    {
      compact: true,
      items: [
        yadi("logo-positivo", "Logotipo de Yadi'Studio en positivo"),
        yadi("logo-color", "Logotipo de Yadi'Studio en violeta"),
        yadi("logo-negativo", "Logotipo de Yadi'Studio en blanco sobre el gradiente de la marca"),
        yadi("isotipo-color", "Isotipo de Yadi'Studio en violeta"),
        yadi("isotipo-negativo", "Isotipo de Yadi'Studio en blanco sobre el gradiente de la marca"),
        yadi("nombre-color", "Logotipo tipográfico de Yadi'Studio"),
      ],
    },
    { items: [yadi("patron-1", "Patrón de arabescos de Yadi'Studio", 2800, 857)] },
    {
      story: {
        eyebrow: "Dirección de arte y fotografía",
        title: "Elegancia en cada paso, magia en cada movimiento.",
        body: [
          "Dirigí una sesión que lleva la danza a **espacios naturales**: campos de trigo, ríos y bosques donde el movimiento de la tela y la luz cuentan la historia.",
          "Cada imagen incorpora el isotipo como firma, para que la fotografía también sea marca.",
        ],
      },
    },
    // Fotografía: 8 cuadradas en 4 columnas (2 en el celular)
    {
      compact: true,
      columns: 4,
      items: [
        yadi("liston", "Bailarina con listón y el isotipo de Yadi'Studio", 2399, 2400), yadi("foto-7", "Bailarina de Yadi'Studio en un campo de trigo, retrato"),
        yadi("foto-1", "Bailarina de Yadi'Studio junto a un árbol"), yadi("foto-2", "Bailarina de Yadi'Studio con velo en el bosque"),
        yadi("foto-3", "Bailarina de Yadi'Studio en un campo de trigo"), yadi("foto-4", "Bailarina de Yadi'Studio con velo junto al río"),
        yadi("foto-5", "Bailarina de Yadi'Studio con velo en movimiento"), yadi("foto-6", "Bailarina de Yadi'Studio junto a un tronco"),
      ],
    },
    {
      story: {
        eyebrow: "Publicidad exterior y digital",
        title: "Una presencia que se reconoce a distancia.",
        body: [
          "Llevé la identidad a **vallas, mupis y plataformas digitales**, combinando la fotografía con el gradiente violeta para que cada pieza se reconozca de inmediato.",
          "El sistema mantiene el mismo lenguaje de la calle a la pantalla, para que el estudio crezca sin perder su esencia.",
        ],
      },
    },
    { items: [yadi("valla-1", "Valla publicitaria de Yadi'Studio", 2400, 1349), yadi("valla-2", "Valla publicitaria de Yadi'Studio en carretera", 2400, 1350)] },
    { items: [yadi("mupi", "Mupi nocturno de Yadi'Studio", 2400, 1350), yadi("web", "Perfil digital de Yadi'Studio", 2400, 1350)] },
    // Segunda banda de arabescos, como cierre visual antes del resultado
    { items: [yadi("patron-2", "Patrón de arabescos de Yadi'Studio, variante", 2800, 1189)] },
  ],
  "1/15": [
    {
      story: {
        eyebrow: "Identidad visual y logotipo",
        title: "Dos trazos que sirven la mesa.",
        body: [
          "El isotipo une **dos trazos inclinados en magenta**, como dos rebanadas servidas juntas: una forma simple y reconocible que funciona sola en una servilleta, un vaso o la esquina de una fotografía.",
          "Lo acompañé de un logotipo de letras redondas y una firma caligráfica, y lo animé para redes y pantallas: primero el trazo que dibuja la forma y después el relleno.",
        ],
      },
    },
    {
      compact: true,
      items: [
        estancia("logo-magenta", "Isotipo de Estancia en negro sobre magenta"),
        estancia("logo-madera", "Isotipo de Estancia en magenta sobre madera"),
        estancia("portada", "Retícula de construcción del isotipo", 750, 749),
      ],
    },
    { items: [estanciaVideo("logo-trazo", "Animación del trazo del isotipo de Estancia"), estanciaVideo("logo-animado", "Animación del isotipo de Estancia")] },
    {
      story: {
        eyebrow: "Fotografía gastronómica",
        title: "Cada platillo, un retrato.",
        body: [
          "Dirigí y retoqué la **fotografía de platillos, postres y bebidas** sobre fondo negro, con luz lateral que resalta texturas y colores, y la firma de la marca en cada imagen.",
          "Pensé la serie para **Instagram**: una retícula oscura y elegante donde la comida es la protagonista.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        estancia("platillo-2a", "Fotografía gastronómica de Estancia"),
        estancia("platillo-2b", "Fotografía gastronómica de Estancia"),
        estancia("platillo-3a", "Fotografía gastronómica de Estancia"),
        estancia("platillo-3b", "Fotografía gastronómica de Estancia"),
        estancia("platillo-4a", "Fotografía gastronómica de Estancia"),
        estancia("platillo-4b", "Fotografía gastronómica de Estancia"),
        estancia("platillo-5a", "Fotografía gastronómica de Estancia"),
        estancia("platillo-5b", "Fotografía gastronómica de Estancia"),
        estancia("platillo-6a", "Fotografía gastronómica de Estancia"),
        estancia("platillo-6b", "Fotografía gastronómica de Estancia"),
        estancia("platillo-7a", "Fotografía gastronómica de Estancia"),
        estancia("platillo-7b", "Fotografía gastronómica de Estancia"),
        estancia("platillo-8a", "Fotografía gastronómica de Estancia"),
        estancia("platillo-8b", "Fotografía gastronómica de Estancia"),
        estancia("platillo-9a", "Fotografía gastronómica de Estancia"),
        estancia("platillo-9b", "Fotografía gastronómica de Estancia"),
        estancia("platillo-10a", "Fotografía gastronómica de Estancia"),
        estancia("platillo-10b", "Fotografía gastronómica de Estancia"),
        estancia("platillo-11a", "Fotografía gastronómica de Estancia"),
        estancia("platillo-11b", "Fotografía gastronómica de Estancia"),
      ],
    },
    {
      story: {
        eyebrow: "Menú impreso",
        title: "Un menú que se hojea como un libro.",
        body: [
          "Diseñé el **menú en formato de libro**, con fotografía a sangre, el magenta como guía y una lectura clara de cada platillo, y lo llevé también a tarjetas de mesa.",
        ],
      },
    },
    {
      compact: true,
      items: [
        estancia("foto-mesa", "Fotografía de un platillo de Estancia sobre la mesa", 1800, 1800),
        estancia("menu-ensalada", "Portada del menú de Estancia con una ensalada"),
        estancia("menu-platillo", "Portada del menú de Estancia con un platillo"),
      ],
    },
    { items: [estancia("menu-libro-1", "Menú de Estancia abierto: bebidas", 1800, 1792), estancia("menu-libro-2", "Menú de Estancia abierto: postres", 1800, 1792)] },
    { items: [estancia("menu-libro-3", "Menú de Estancia abierto: platos fuertes", 1800, 1792), estancia("menu-libro-4", "Menú de Estancia abierto: especialidades", 1800, 1792)] },
    { items: [estancia("tarjetas-panoramica", "Tarjetas de Estancia sobre la mesa", 2400, 804)] },
    {
      story: {
        eyebrow: "Publicidad exterior",
        title: "Descubre la perfección en cada bocado.",
        body: [
          "Llevé la marca a la calle con **espectaculares, parabuses y un muro en edificio**: fotografía de producto sobre negro, el magenta como acento y mensajes cortos como «Frescura y elegancia» o «Reserva un momento inolvidable».",
        ],
      },
    },
    { items: [estancia("espectacular", "Espectacular de Estancia: descubre la perfección en cada bocado", 1800, 1800), estancia("parabus-noche", "Parabús de Estancia de noche")] },
    { items: [estancia("parabus", "Parabús de Estancia con una bebida", 675, 1200), estancia("muro-edificio", "Anuncio de Estancia en un muro de edificio", 675, 1200), estancia("muro-edificio-2", "Anuncio de Estancia en la fachada de un edificio")] },
    { items: [estanciaVideo("parabus-animado", "Parabús animado de Estancia: reserva un momento inolvidable")] },
    {
      story: {
        eyebrow: "Presencia digital",
        title: "La mesa también se aparta en línea.",
        body: [
          "Diseñé el **perfil de Instagram y Facebook** y la **app con el menú**: categorías, platillos con fotografía, carrito y pago, con el magenta guiando cada paso.",
        ],
      },
    },
    { items: [estancia("facebook", "Página de Facebook de Estancia", 1600, 1600), estanciaVideo("instagram-perfil", "Perfil de Instagram de Estancia en un celular")] },
    { items: [estanciaVideo("app-menu", "Menú de Estancia en la app"), estanciaVideo("app-celular", "Recorrido por la app de Estancia: menú, carrito y pago")] },
  ],
  "1/14": [
    {
      story: {
        eyebrow: "Identidad visual y logotipo",
        title: "Un monograma con firma propia.",
        body: [
          "El logotipo entrelaza **la A y la S en un monograma de trazo elegante**, acompañado del nombre en una caligrafía con carácter: una marca femenina, segura y con estilo.",
          "Lo desarrollé en rosa sobre blanco y en negro sobre rosa, y lo construí sobre una retícula para que funcione en una etiqueta pequeña o en una bolsa de compra.",
        ],
      },
    },
    {
      compact: true,
      items: [
        sweett("logo-rosa", "Logotipo de My Sweett Audrina en rosa sobre blanco"),
        sweett("logo-negro", "Logotipo de My Sweett Audrina en negro sobre rosa"),
        sweett("portada", "Retícula de construcción del monograma", 1200, 1200),
      ],
    },
    {
      story: {
        eyebrow: "Empaque y aplicaciones",
        title: "Cada compra, un pequeño regalo.",
        body: [
          "Llevé la identidad a **bolsas de compra, etiquetas, botones y cubrebocas**, para que cada pieza que sale de la boutique lleve la marca con el mismo cuidado que la ropa.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        sweett("bolsa-rosa", "Bolsa de compra rosa de My Sweett Audrina"),
        sweett("etiquetas", "Etiquetas colgantes de My Sweett Audrina"),
        sweett("botones", "Botones con el monograma de la marca"),
        sweett("cubrebocas", "Cubrebocas con el monograma de la marca"),
      ],
    },
    {
      story: {
        eyebrow: "Tienda en línea",
        title: "La boutique en el celular.",
        body: [
          "Diseñé la **tienda en línea**: catálogo de prendas, ficha de producto con tallas y un proceso de pago sencillo, con el rosa de la marca guiando cada paso.",
        ],
      },
    },
    { items: [{ video: "/Branding/Sweett/video/tienda.mp4", poster: "/Branding/Sweett/video/tienda-poster.webp", alt: "Recorrido por la tienda en línea de My Sweett Audrina", width: 1280, height: 924 }] },
  ],
  "1/13": [
    {
      story: {
        eyebrow: "Identidad visual y logotipo",
        title: "Tres trazos que se adhieren.",
        body: [
          "El isotipo une **tres franjas curvas en índigo, naranja y verde** que se envuelven entre sí, como capas de material que se adhieren y se refuerzan: «Pegamás fuerte».",
          "Lo desarrollé con y sin descriptor, en positivo y negativo, y sobre cada color de la marca, construido sobre una retícula para que funcione en un costal, un catálogo o una pantalla.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        textucos("logo-completo", "Logotipo completo de Josman Texturizados y Adhesivos"),
        textucos("logo-subtitulo", "Logotipo con descriptor"),
        textucos("logo-simple", "Logotipo sin descriptor"),
        textucos("logo-reticula", "Logotipo en blanco sobre retícula"),
        textucos("isotipo", "Isotipo a color"),
        textucos("isotipo-naranja", "Isotipo sobre naranja"),
        textucos("isotipo-verde", "Isotipo sobre verde"),
        textucos("isotipo-indigo", "Isotipo sobre índigo"),
      ],
    },
    {
      compact: true,
      items: [
        textucos("logo-naranja", "Logotipo sobre naranja"),
        textucos("logo-verde", "Logotipo sobre verde"),
        textucos("logo-indigo", "Logotipo sobre índigo"),
        textucos("logo-blanco-naranja", "Logotipo en blanco sobre naranja"),
        textucos("logo-blanco-verde", "Logotipo en blanco sobre verde"),
        textucos("logo-blanco-indigo", "Logotipo en blanco sobre índigo"),
      ],
    },
    {
      compact: true,
      columns: 4,
      items: [
        textucos("paleta", "Ficha de color de la marca"),
        textucos("tipografia", "Ficha tipográfica de la marca"),
        textucos("logo-relieve", "Logotipo en relieve sobre papel"),
        textucos("portada", "Retícula de construcción del isotipo", 750, 749),
      ],
    },
    {
      story: {
        eyebrow: "Personajes",
        title: "Dos expertos que dan la cara.",
        body: [
          "Creé **dos personajes ilustrados**, una maestra y un maestro de obra, que acompañan a la marca en empaques, publicidad y redes: cercanos, seguros y con experiencia.",
        ],
      },
    },
    {
      items: [
        textucos("personaje-mujer", "Personaje de Josman: maestra de obra", 689, 1800),
        textucos("personaje-hombre", "Personaje de Josman: maestro de obra", 682, 1800),
        textucos("personajes", "Los dos personajes de Josman juntos"),
        textucos("personajes-2", "Los personajes de Josman en primer plano"),
      ],
    },
    {
      story: {
        eyebrow: "Empaques y productos",
        title: "Una familia de productos que se reconoce.",
        body: [
          "Diseñé el **sistema de empaques** —costales, bolsas y cubetas— con un color por línea de producto y la franja de la marca como elemento común, para que se identifiquen de un vistazo en el anaquel y en la tienda en línea.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        textucos("costales", "Línea completa de costales", 1793, 1800),
        textucos("productos-casa", "Productos de Josman frente a una casa", 1128, 1128),
        textucos("bolsa-pega-facil", "Bolsa de adhesivo Pega Fácil"),
        textucos("bolsa-amazon", "Bolsa de producto con promoción en Amazon"),
        textucos("bolsa-porcelanato", "Bolsa Fija Porcelanato"),
        textucos("bolsa-accesible", "Bolsa de producto: siempre accesible"),
        textucos("costal-cantera", "Costal Fija Cantera Fija Teja"),
        textucos("costal-reflex", "Costal Reflex"),
        textucos("costal-azulejo", "Costal Pega Azulejo"),
        textucos("cubeta", "Cubeta de texturizado"),
        textucos("cartel-promocion", "Cartel de promoción de productos"),
        textucos("promocion-amazon", "Promoción de productos en Amazon", 1128, 1128),
      ],
    },
    {
      story: {
        eyebrow: "Catálogo e impresos",
        title: "Toda la línea en un solo catálogo.",
        body: [
          "Diseñé el **catálogo de productos**, carpetas y trípticos, con fichas técnicas claras y las franjas de la marca como guía visual de cada sección.",
        ],
      },
    },
    { items: [textucos("catalogo", "Catálogo de Texturizados y Adhesivos", 1800, 1272), textucos("catalogo-libro", "Catálogo impreso de Josman", 1800, 1350)] },
    { items: [textucos("catalogo-pagina-1", "Página del catálogo: Fija Sillar", 1800, 1272), textucos("catalogo-pagina-2", "Página del catálogo: Fija Cantera Fija Teja", 1800, 1272)] },
    {
      compact: true,
      items: [
        textucos("carpeta", "Carpeta corporativa de Josman", 1800, 1391),
        textucos("triptico", "Tríptico de productos", 1800, 1298),
        textucos("carpeta-portada", "Portada de carpeta con la franja de la marca"),
        textucos("carpeta-2", "Carpeta corporativa abierta"),
        textucos("triptico-2", "Tríptico con muestrario de colores"),
        textucos("carpeta-3", "Carpeta corporativa, variante"),
      ],
    },
    {
      story: {
        eyebrow: "Promocionales y obra",
        title: "La marca en las manos del maestro.",
        body: [
          "Llevé la identidad a **gorras, casco, llana y calendario**: objetos que el cliente usa todos los días y que mantienen la marca presente en la obra.",
        ],
      },
    },
    { items: [textucos("gorra", "Gorra de Josman Texturizados y Adhesivos", 1800, 1200), textucos("gorra-2", "Gorra de Josman, vista lateral")] },
    {
      compact: true,
      items: [
        textucos("calendario", "Calendario de pared de Josman"),
        textucos("casco", "Casco de obra con el logotipo de Josman", 1128, 1128),
        textucos("llana", "Llana con el isotipo de Josman sobre azulejo", 1128, 1128),
      ],
    },
    {
      story: {
        eyebrow: "Presencia digital",
        title: "Del anaquel a la pantalla.",
        body: [
          "Diseñé el **sitio web, las redes sociales y el contenido para pantallas** en punto de venta, con los personajes y las franjas de la marca como hilo conductor.",
        ],
      },
    },
    { items: [textucos("celulares", "Sitio de Josman en dos celulares", 1800, 1350), textucos("celulares-2", "Contenido de Josman en tres celulares")] },
    {
      compact: true,
      items: [
        textucos("sitio-web", "Sitio web de Josman en una laptop", 1575, 1577),
        textucos("sitio-web-2", "Sitio web de Josman, segunda vista"),
        textucos("redes", "Contenido de Josman para redes sociales"),
      ],
    },
    {
      compact: true,
      items: [
        textucosVideo("dos-pantallas", "Contenido de Josman en dos pantallas"),
        textucosVideo("una-pantalla", "Contenido de Josman en una pantalla"),
        textucosVideo("pantalla-personaje", "Contenido con el personaje de Josman en pantalla"),
      ],
    },
    { items: [textucosVideo("desmoldantes", "Video promocional de los desmoldantes de Josman", 960, 540)] },
  ],
  "1/12": [
    {
      story: {
        eyebrow: "Identidad visual y logotipo",
        title: "Una revolvedora que firma cada obra.",
        body: [
          "El isotipo dibuja una **revolvedora de concreto** con trazos curvos y firmes: un símbolo directo, fácil de reconocer en un camión, un casco o un espectacular.",
          "Lo acompañé de un logotipo sólido y lo desarrollé sobre blanco, azul y amarillo, en positivo, negativo y relieve, construido sobre una retícula para mantener su fuerza en cualquier tamaño.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        josman("logo-color", "Logotipo de Josman Concretos a color"),
        josman("isotipo-color", "Isotipo de Josman Concretos a color"),
        josman("logo-azul", "Logotipo de Josman Concretos sobre azul"),
        josman("logo-amarillo", "Logotipo de Josman Concretos sobre amarillo"),
        josman("isotipo-amarillo", "Isotipo azul sobre amarillo"),
        josman("isotipo-azul", "Isotipo amarillo sobre azul"),
        josman("logo-reticula", "Logotipo de Josman Concretos sobre retícula"),
        josman("portada", "Retícula de construcción del isotipo", 750, 749),
      ],
    },
    {
      compact: true,
      items: [
        josman("paleta", "Paleta de color de Josman Concretos", 1128, 1128),
        josman("logo-relieve", "Logotipo de Josman Concretos en relieve sobre papel"),
        josman("logo-arena", "Logotipo de Josman Concretos marcado en arena", 1128, 1128),
      ],
    },
    {
      story: {
        eyebrow: "Uniformes y equipo de seguridad",
        title: "La marca también se ve en la obra.",
        body: [
          "Llevé la identidad a **chalecos, cascos y equipo de trabajo**, para que cada cuadrilla represente a la empresa con orden y seguridad.",
        ],
      },
    },
    {
      compact: true,
      items: [
        josman("chaleco-1", "Chaleco de seguridad de Josman Concretos"),
        josman("chaleco-2", "Chaleco de seguridad, vista trasera", 1800, 1760),
        josman("equipo-obra", "Equipo de Josman Concretos revisando planos en obra"),
      ],
    },
    { items: [josman("casco-1", "Casco de seguridad con el logotipo de Josman", 1128, 1128), josman("casco-2", "Casco de seguridad, vista lateral", 1128, 1128)] },
    {
      story: {
        eyebrow: "Papelería, catálogo y publicidad impresa",
        title: "Cada producto con su propia ficha.",
        body: [
          "Diseñé **tarjetas, papelería, catálogo y flyers** para cada producto —arena, grava, concreto permeable e impermeable—, con el azul y el amarillo como guía para que la información técnica se lea con claridad.",
        ],
      },
    },
    {
      compact: true,
      items: [
        josman("tarjeta-guante", "Tarjeta de presentación sostenida con guante de obra", 1128, 1128),
        josman("tarjeta-mano", "Tarjeta de presentación de Josman Concretos", 1128, 1128),
        josman("papeleria", "Papelería de Josman Concretos"),
        josman("hoja", "Hoja membretada de Josman Concretos"),
        josman("catalogo", "Catálogo de productos de Josman Concretos", 1797, 1800),
        josman("catalogo-abierto", "Catálogo abierto de Josman Concretos"),
        josman("flyers-productos", "Flyers de productos: arena, concreto y barda", 1128, 1128),
        josman("flyers-arena", "Flyers de arena y grava"),
        josman("flyers", "Flyers verticales de Josman Concretos"),
        josman("banner", "Banner impreso de Josman Concretos"),
        josman("flyers-set", "Conjunto de flyers de Josman Concretos"),
        josman("folleto", "Folleto de Josman Concretos"),
      ],
    },
    {
      story: {
        eyebrow: "Artículos promocionales",
        title: "Una marca para llevar a la obra.",
        body: [
          "Desarrollé **termos en los tres colores de la marca** como artículo promocional para clientes y cuadrillas.",
        ],
      },
    },
    {
      compact: true,
      items: [
        josman("termo-amarillo", "Termo amarillo de Josman Concretos", 1800, 1200),
        josman("termo-azul", "Termo azul de Josman Concretos", 1800, 1200),
        josman("termo-gris", "Termo gris de Josman Concretos", 1800, 1200),
      ],
    },
    { items: [josman("termos", "Termos de Josman Concretos en sus tres colores", 1800, 1200), josman("termos-2", "Termos de Josman Concretos, vista cercana", 1796, 1800)] },
    {
      story: {
        eyebrow: "Señalética y publicidad exterior",
        title: "Solidez que construye el futuro.",
        body: [
          "Llevé la identidad a **fachada, letrero luminoso y espectaculares**, con el mensaje «Solidez que construye el futuro» y la revolvedora como protagonista.",
          "La marca también aparece en el propio concreto y en la obra: el lugar donde la empresa demuestra lo que hace.",
        ],
      },
    },
    { items: [josman("letrero", "Letrero en la fachada de Josman Concretos", 1800, 1200), josman("luminoso", "Letrero luminoso redondo de Josman Concretos", 1800, 1200)] },
    { items: [josman("espectacular-1", "Espectacular de Josman Concretos junto a la carretera", 1600, 1200), josman("espectacular-2", "Espectacular: solidez que construye el futuro"), josman("espectacular-3", "Espectacular de Josman Concretos en la ciudad")] },
    {
      compact: true,
      items: [
        josman("senal-piso", "Logotipo de Josman Concretos sobre pavimento", 1128, 1128),
        josman("concreto", "Colado de concreto con el logotipo de Josman", 1128, 1128),
        josman("cuadro", "Cuadro con fotografía de obra de Josman Concretos", 1200, 1200),
      ],
    },
    {
      story: {
        eyebrow: "Presencia digital",
        title: "El concreto también se cotiza en línea.",
        body: [
          "Diseñé el **sitio web** de la empresa, con fichas de cada producto y su versión para celular, además de **contenido para pantallas** en punto de venta.",
        ],
      },
    },
    { items: [josman("sitio-web", "Sitio web de Josman Concretos en una laptop", 1080, 1080), josmanVideo("web-movil", "Sitio web de Josman Concretos en un celular")] },
    { items: [josmanVideo("web-escritorio", "Recorrido por el sitio web de Josman Concretos", 974, 480), josmanVideo("web-vertical", "Sitio web de Josman Concretos en versión móvil", 480, 984)] },
    { items: [josmanVideo("pantallas", "Contenido de Josman Concretos en dos pantallas"), josmanVideo("television", "Contenido de Josman Concretos en una televisión")] },
    {
      story: {
        eyebrow: "Contenido para redes sociales",
        title: "Un concreto para cada obra.",
        body: [
          "Produje una **serie de videos verticales**, uno por cada tipo de concreto, con el personaje de la marca presentando sus usos y ventajas en formato para historias y reels.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        josmanVideo("concreto-edad-temprana", "Video vertical de Josman Concretos: concreto de edad temprana", 540, 960),
        josmanVideo("concreto-antibacterial", "Video vertical de Josman Concretos: concreto antibacterial", 540, 960),
        josmanVideo("concreto-arquitectonico", "Video vertical de Josman Concretos: concreto arquitectónico", 540, 960),
        josmanVideo("concreto-autocompactable", "Video vertical de Josman Concretos: concreto autocompactable", 540, 960),
      ],
    },
    {
      compact: true,
      columns: 4,
      items: [
        josmanVideo("concreto-durable", "Video vertical de Josman Concretos: concreto durable", 540, 960),
        josmanVideo("concreto-ligero", "Video vertical de Josman Concretos: concreto ligero", 540, 960),
        josmanVideo("concreto-pigmentado", "Video vertical de Josman Concretos: concreto pigmentado", 540, 960),
        josmanVideo("concreto-termico", "Video vertical de Josman Concretos: concreto térmico", 540, 960),
      ],
    },
  ],
  "1/11": [
    {
      story: {
        eyebrow: "Identidad visual y logotipo",
        title: "Un universo en órbita.",
        body: [
          "El logotipo envuelve las palabras en **órbitas que se cruzan como un átomo**: la energía de una persona que decide moverse y transformar su realidad.",
          "Lo desarrollé en morado, verde y bicolor, y lo construí sobre una retícula para que brille igual en una pantalla de escenario, en una sudadera o en una publicación.",
        ],
      },
    },
    {
      compact: true,
      items: [
        creando("logo-bicolor", "Logotipo de Creando lo Imposible en morado y verde"),
        creando("logo-morado", "Variaciones del logotipo en morado neón"),
        creando("logo-verde", "Logotipo de Creando lo Imposible en verde neón"),
      ],
    },
    { items: [creandoVideo("logo-animado", "Animación del logotipo de Creando lo Imposible"), creando("portada", "Retícula de construcción del logotipo", 750, 749)] },
    {
      story: {
        eyebrow: "Iconografía",
        title: "Un ícono para cada salto.",
        body: [
          "Diseñé una **familia de pictogramas** que representa cada etapa del proceso —logros, retos y transformaciones— para usarlos en materiales, insignias y contenido digital.",
        ],
      },
    },
    { items: [creando("pictogramas-1", "Pictogramas de Creando lo Imposible, serie 1"), creando("pictogramas-2", "Pictogramas de Creando lo Imposible, serie 2")] },
    {
      story: {
        eyebrow: "Papelería y reconocimientos",
        title: "Un logro que se guarda.",
        body: [
          "Llevé la identidad a **diplomas y carpetas** con el degradado de la marca, para que cada participante se lleve un recuerdo a la altura de lo que logró.",
        ],
      },
    },
    {
      compact: true,
      items: [
        creando("diploma", "Diploma de Creando lo Imposible"),
        creando("carpeta-1", "Carpeta con el degradado de la marca"),
        creando("carpeta-2", "Carpeta de Creando lo Imposible, vista lateral"),
      ],
    },
    {
      story: {
        eyebrow: "Merchandising",
        title: "Una marca que se lleva puesta.",
        body: [
          "Diseñé una línea de **sudaderas, playeras, pantalones y gorras** con ilustraciones de fuerza —serpientes, alas, guerreros— y frases que la comunidad hace suyas: «Yo soy un hombre astuto, arriesgado, feliz y líder».",
          "Los acentos neón convierten cada prenda en una extensión de la experiencia del evento.",
        ],
      },
    },
    {
      compact: true,
      items: [
        creando("sudadera-2", "Sudadera con ilustración de alas"),
        creando("sudadera-3", "Sudadera con frase de la comunidad"),
        creando("sudadera-3b", "Sudadera con ilustración de alas y frase"),
        creando("playera-4", "Playera con ilustración de serpiente y koi"),
        creando("sudadera-4", "Sudadera con ilustración de guerrero"),
        creando("sudadera-5", "Sudadera con ilustración tribal"),
        creando("playera-c5", "Playera de manga larga con ilustración"),
        creando("pantalon", "Pantalón deportivo de Creando lo Imposible"),
        creando("gorra", "Gorra de Creando lo Imposible"),
      ],
    },
    {
      story: {
        eyebrow: "Comunicación digital",
        title: "Del escenario a la pantalla.",
        body: [
          "Desarrollé la presencia digital de la marca: **app, redes sociales, publicidad de eventos y sitio web**, para que cada seminario se anuncie con la misma energía con la que se vive.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        creando("app-1", "Ícono de la app de Creando lo Imposible"),
        creando("app-2", "Ícono de la app en la pantalla de inicio"),
        creando("instagram-1", "Publicación del evento Básico en Guadalajara"),
        creando("instagram-2", "Publicaciones del evento Básico en Barcelona"),
      ],
    },
    { items: [creandoVideo("instagram-movil", "Perfil de Instagram de Creando lo Imposible en un celular"), creandoVideo("tiktok-movil", "Contenido de TikTok de Creando lo Imposible en un celular")] },
    { items: [creandoVideo("web-1", "Sitio web de Creando lo Imposible: próximos eventos"), creandoVideo("web-2", "Sitio web de Creando lo Imposible: experiencias")] },
    {
      story: {
        eyebrow: "Contenido en video",
        title: "La marca también se escucha.",
        body: [
          "Llevé la identidad a las **entrevistas en video**: la animación del logotipo como entrada, rótulos con nombre y frases clave, y la marca presente durante toda la conversación.",
        ],
      },
    },
    { items: [creandoVideo("entrevista", "Entrevista en video con la identidad de Creando lo Imposible", 1280, 720)] },
  ],
  "1/10": [
    {
      story: {
        eyebrow: "Identidad visual y logotipo",
        title: "Un monograma con estilo urbano.",
        body: [
          "El isotipo une la **T y la D en un monograma de líneas paralelas**, contenido en un marco redondeado: una marca compacta que funciona como etiqueta, sello o ícono de app.",
          "Lo construí sobre una retícula y documenté el proceso de trazo, para que el logotipo, el isotipo y el acento caligráfico «Only» convivan con equilibrio.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        trend("isotipo", "Isotipo de Trend", 1626, 1626),
        trend("logotipo", "Logotipo de Trend Boutique Only", 1626, 1626),
        trend("isotipo-gris", "Isotipo de Trend sobre gris", 1000, 1000),
        trend("portada", "Retícula de construcción del isotipo de Trend", 750, 749),
      ],
    },
    { items: [trendVideo("construccion", "Proceso de construcción del logotipo de Trend", 720, 662), trendVideo("construccion-1", "Boceto del logotipo de Trend", 720, 662)] },
    { items: [trendVideo("construccion-2", "Composición del logotipo e isotipo de Trend", 720, 662), trendVideo("construccion-3", "Retícula de construcción animada del isotipo de Trend", 720, 662)] },
    {
      story: {
        eyebrow: "Papelería y empaque",
        title: "Cada compra, una pieza de marca.",
        body: [
          "Llevé la identidad a **tarjetas, bolsas y cajas**, y diseñé un **patrón con el monograma** que convierte cada empaque en un objeto reconocible.",
          "El blanco y negro mantiene la marca elegante y deja que la ropa sea la protagonista.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        trend("tarjetas", "Tarjetas de presentación de Trend", 1626, 1626),
        trend("bolsa", "Bolsa de compra con el patrón de Trend", 1626, 1626),
        trend("caja", "Caja de envío con el patrón de Trend", 1024, 1024),
        trend("patron", "Patrón con el monograma de Trend"),
      ],
    },
    {
      story: {
        eyebrow: "Experiencia digital",
        title: "La boutique en tu bolsillo.",
        body: [
          "Diseñé la presencia digital de la boutique: **ícono de app, catálogo digital, sitio web y redes sociales**, para que comprar sea tan fácil como deslizar.",
          "Las animaciones muestran el recorrido real: del catálogo en el celular a la tienda en línea.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        trend("app-icono", "Ícono de la app de Trend en un celular"),
        trend("navegador", "Pestaña de navegador con el sitio de Trend", 1799, 1800),
        trend("instagram", "Publicación de Instagram de Trend", 1500, 1500),
        trend("catalogo", "Publicación del catálogo de Trend", 1080, 1080),
      ],
    },
    {
      compact: true,
      items: [
        trendVideo("catalogo-movil", "Catálogo digital de Trend en un celular"),
        trendVideo("app-movil", "Recorrido por la app de Trend"),
        trendVideo("web", "Sitio web de Trend Boutique"),
      ],
    },
    {
      story: {
        eyebrow: "Campañas y publicidad",
        title: "Lo auténtico es irremplazable.",
        body: [
          "Desarrollé **historias animadas, publicaciones de preventa y piezas de exterior** —mupi, vitrina y banner en plaza comercial— con un tono joven, directo y seguro de sí mismo.",
          "El amarillo de la preventa rompe el blanco y negro solo cuando hay algo urgente que contar.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        trendVideo("historia-1", "Historia animada de Trend: lo auténtico es irremplazable", 540, 1024),
        trendVideo("historia-2", "Historia animada de Trend: ordena la tuya", 540, 1034),
        trendVideo("historia-3", "Historia animada de Trend: ser único", 540, 986),
        trendVideo("historia-4", "Historia animada de Trend", 540, 984),
      ],
    },
    {
      compact: true,
      items: [
        trend("preventa-1", "Publicación de preventa de Trend"),
        trend("preventa-2", "Publicación del primer catálogo digital de Trend"),
        trend("mupi", "Mupi nocturno con publicidad de Trend"),
      ],
    },
  ],
  "1/9": [
    {
      story: {
        eyebrow: "Identidad visual y logotipo",
        title: "Una mariposa hecha de listones.",
        body: [
          "El isotipo forma una **mariposa con listones entrelazados** que, al centro, dibujan una gota: la transformación y la esperanza que la asociación busca llevar a cada persona.",
          "Lo acompañé de un logotipo tipográfico redondeado y amable, y lo construí sobre una retícula para mantener su equilibrio en cualquier tamaño.",
        ],
      },
    },
    {
      compact: true,
      items: [
        gotitas("isotipo", "Isotipo de Gotitas de Esperanza en blanco sobre rosa"),
        gotitas("nombre", "Logotipo tipográfico de Gotitas de Esperanza"),
        gotitas("portada", "Retícula de construcción del isotipo de Gotitas de Esperanza", 750, 749),
      ],
    },
    {
      story: {
        eyebrow: "Papelería y reconocimientos",
        title: "Cercanía en cada documento.",
        body: [
          "Llevé la identidad a **sobres, tarjetas, hojas membretadas y reconocimientos**, para que cada comunicación de la asociación transmita la misma calidez y seriedad.",
          "Los listones de la mariposa se convierten en un recurso gráfico que acompaña cada pieza.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        gotitas("sobres", "Sobres de Gotitas de Esperanza"),
        gotitas("tarjetas", "Tarjetas de presentación de Gotitas de Esperanza", 1800, 1800),
        gotitas("hoja-membretada", "Hoja membretada de Gotitas de Esperanza", 1800, 1800),
        gotitas("reconocimiento", "Reconocimiento enmarcado de Gotitas de Esperanza", 1800, 1800),
      ],
    },
    {
      story: {
        eyebrow: "Campañas y redes sociales",
        title: "Una causa que se comparte.",
        body: [
          "Diseñé las piezas de la **Marcha en pro de la salud** —cartel, mupi animado y publicaciones— para convocar a la comunidad y acompañar a quienes más lo necesitan.",
          "En redes sociales, la mariposa se adapta a perfiles y publicaciones manteniendo siempre el mismo lenguaje visual.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        gotitas("cartel-marcha", "Cartel de la Marcha en pro de la salud"),
        { video: "/Branding/Gotitas/video/mupi.mp4", poster: "/Branding/Gotitas/video/mupi-poster.webp", alt: "Mupi animado de la Marcha en pro de la salud", width: 720, height: 720 },
        gotitas("redes-1", "Logotipo de Gotitas de Esperanza para redes sociales"),
        gotitas("redes-2", "Variaciones de la mariposa para redes sociales"),
      ],
    },
  ],
  "1/8": [
    {
      story: {
        eyebrow: "Identidad visual y logotipo",
        title: "Un reloj que detiene el tiempo.",
        body: [
          "El isotipo une un **reloj de bolsillo y el diafragma de una cámara**: la fotografía como el arte de detener un instante y guardarlo para siempre.",
          "Lo acompañé de un logotipo de trazo caligráfico, elegante y cercano, y lo construí sobre una retícula para que funcione en neón, bordado, impresión y pantalla.",
        ],
      },
    },
    {
      compact: true,
      columns: 4,
      items: [
        memories("isotipo", "Isotipo de Memories", 1425, 1425),
        memories("logo", "Logotipo de Memories en blanco sobre negro", 1425, 1425),
        memories("portada", "Retícula de construcción del isotipo de Memories", 750, 749),
        memories("neon", "Logotipo de Memories en neón", 884, 885),
      ],
    },
    {
      compact: true,
      items: [
        memoriesVideo("logo-animado", "Animación del logotipo de Memories"),
        memoriesVideo("logo-rosa", "Animación del logotipo de Memories sobre rosa"),
        memoriesVideo("logo-3d", "Animación tridimensional del isotipo de Memories"),
      ],
    },
    {
      story: {
        eyebrow: "Papelería, empaques y álbumes",
        title: "Cada recuerdo merece un buen estuche.",
        body: [
          "Diseñé la **papelería, las cajas y los estuches** donde se entregan las fotografías y los videos: el momento de abrir el paquete también es parte de la experiencia.",
          "Negro, blanco y detalles sutiles convierten cada entrega en un objeto que se guarda, igual que los recuerdos que contiene.",
        ],
      },
    },
    {
      compact: true,
      items: [
        memories("hoja-membretada", "Hoja membretada de Memories"),
        memories("caja-usb", "Caja con memoria USB de Memories", 1405, 1405),
        memories("caja", "Caja de entrega de Memories", 1094, 1094),
      ],
    },
    { items: [memories("estuche", "Estuche de Memories"), memories("estuche-album", "Estuche y álbum fotográfico de Memories"), memoriesVideo("album", "Álbum fotográfico de Memories")] },
    {
      story: {
        eyebrow: "Uniformes y merchandising",
        title: "Un equipo que también es marca.",
        body: [
          "Llevé la identidad a **playeras, chamarras y artículos promocionales**, para que el equipo se reconozca en cada evento sin perder la discreción que exige una boda.",
          "Bolsas, tazas y llaveros extienden la marca más allá del día del evento.",
        ],
      },
    },
    {
      compact: true,
      items: [
        memories("playera", "Playera de Memories", 924, 924),
        memories("chamarra", "Chamarra bordada de Memories"),
        memories("equipo-espalda", "Equipo de Memories con uniforme en un evento", 1425, 1425),
      ],
    },
    { items: [memories("bolsa", "Bolsa, termo y llavero de Memories", 798, 798), memories("taza", "Taza de Memories", 608, 608)] },
    {
      story: {
        eyebrow: "Publicidad y medios digitales",
        title: "Capturando amor en cada imagen.",
        body: [
          "Desarrollé **carteles, mupis y una app** para que las parejas descubran el estudio y agenden su sesión: de la calle al celular con el mismo lenguaje visual.",
          "Los carteles animados muestran el trabajo del estudio en movimiento, porque Memories también es filmación.",
        ],
      },
    },
    { items: [memoriesVideo("app", "Recorrido animado por la app de Memories", 960, 822), memories("app-1", "App de Memories: pantalla de inicio", 1800, 1539), memories("app-2", "App de Memories: registro", 1800, 1539)] },
    { items: [memoriesVideo("parada-animada", "Parada de autobús animada con publicidad de Memories", 960, 814), memories("parada", "Parada de autobús con publicidad de Memories", 512, 511)] },
    {
      compact: true,
      items: [
        memoriesVideo("cartel-boda", "Cartel animado de Memories con fotografía de boda"),
        memoriesVideo("cartel-moto", "Cartel animado de Memories con sesión en motocicleta"),
        memoriesVideo("cartel-moda", "Cartel animado de Memories con sesión de moda"),
      ],
    },
  ],
  "1/7": [
    {
      story: {
        eyebrow: "Identidad visual y logotipo",
        title: "Teclas que suenan a escenario.",
        body: [
          "El logotipo integra unas **teclas de piano** sobre las letras RAG: la música como origen de todo lo que la agencia representa.",
          "Lo construí sobre una retícula y lo desarrollé sobre azul, amarillo, blanco y negro, y en distintos tamaños, para que funcione desde un boleto hasta una pantalla de concierto.",
        ],
      },
    },
    {
      compact: true,
      items: [
        rag("a", "Logotipo de RAG en amarillo sobre azul"), rag("b", "Logotipo de RAG en azul sobre amarillo"), rag("c", "Logotipo de RAG en negro sobre blanco"),
        rag("d", "Logotipo de RAG en blanco sobre negro"), rag("k", "Logotipo de RAG en contorno amarillo sobre blanco"), rag("e", "Logotipo de RAG en distintos tamaños"),
      ],
    },
    {
      compact: true,
      items: [
        rag("f", "Construcción del logotipo de RAG"),
        rag("g", "Logotipo de RAG con el nombre Representaciones Artísticas de Guanajuato"),
        rag("h", "Logotipo de RAG en contorno con el nombre completo"),
      ],
    },
    {
      story: {
        eyebrow: "Animación de marca",
        title: "Una marca que sube al escenario.",
        body: [
          "Animé el logotipo para **pantallas de concierto, redes y presentaciones**: entra con luz y movimiento, como un artista que aparece en el escenario.",
          "La versión animada y la retícula de construcción muestran el mismo sistema: preciso en su forma y con energía en su uso.",
        ],
      },
    },
    {
      items: [
        { video: "/Branding/RAG/video/animacion.mp4", poster: "/Branding/RAG/video/animacion-poster.webp", alt: "Animación del logotipo de RAG", width: 720, height: 720 },
        rag("portada", "Retícula de construcción del logotipo de RAG", 1200, 1200),
      ],
    },
  ],
  "1/4": [
    {
      story: {
        eyebrow: "Identidad visual y logotipo",
        title: "Un foco, un sol y un rayo en un solo símbolo.",
        body: [
          "El isotipo une un **foco, los rayos del sol y un relámpago** dentro de un punto de ubicación: la energía solar que llega a cada hogar.",
          "Lo acompañé de un logotipo en versión horizontal y apilada, y lo desarrollé sobre azul, amarillo y blanco para usarlo en cualquier soporte.",
        ],
      },
    },
    {
      compact: true,
      items: [
        enevesol("10", "Logotipo de Enevesol en blanco sobre azul"), enevesol("a", "Logotipo de Enevesol en blanco sobre azul, versión compacta"),
        enevesol("11", "Logotipo de Enevesol en azul sobre amarillo"), enevesol("6", "Logotipo apilado de Enevesol en amarillo sobre azul"),
        enevesol("d", "Logotipo apilado de Enevesol sobre azul, variante"), enevesol("8", "Logotipo apilado de Enevesol sobre blanco"),
      ],
    },
    {
      story: {
        eyebrow: "Aplicaciones de marca",
        title: "Presencia en campo y en oficina.",
        body: [
          "Llevé la identidad a **uniformes, cascos, papelería y displays**, para que el equipo y cada propuesta comercial transmitan la misma confianza.",
          "Cada pieza refuerza el reconocimiento de la marca tanto en la instalación como en la venta.",
        ],
      },
    },
    { items: [enevesol("2", "Instalador de Enevesol con uniforme y casco"), enevesol("3", "Ingeniero de Enevesol en un campo solar")] },
    { items: [enevesol("4", "Papelería de Enevesol: hoja membretada"), enevesol("5", "Displays roll-up de Enevesol")] },
    {
      story: {
        eyebrow: "Contenido animado",
        title: "Explicar la energía solar en segundos.",
        body: [
          "Desarrollé **animaciones para redes sociales** que explican cómo funcionan los paneles solares, los tipos de radiación y los beneficios del monitoreo, con un lenguaje sencillo y visual.",
          "Cada animación se adaptó a publicaciones y anuncios, para acompañar a la marca en toda su comunicación digital.",
        ],
      },
    },
    { items: [enevesolVideo("final", "Animación: cómo funciona un sistema de paneles solares"), enevesolVideo("dos", "Animación en formato de publicación para redes")] },
    { items: [enevesolVideo("f1", "Animación: los paneles solares y sus células fotovoltaicas"), enevesolVideo("uno", "Animación de paneles solares en formato de publicación")] },
    { items: [enevesolVideo("movil", "Animación: beneficios del monitoreo desde el celular"), enevesolVideo("tres", "Animación de monitoreo en formato de publicación")] },
    { items: [enevesolVideo("cel", "Anuncio de paquetes de paneles en un celular"), enevesol("12", "Ícono de la app de Enevesol en un celular")] },
  ],
};

// Fila de imágenes entre la introducción y el bloque de color ("perfil/proyecto")
const PROJECT_INTRO_IMAGES = {
  "1/6": { items: [deliz("14", "Aplicación de la identidad de Deliz", 2800, 1286)] },
  "1/15": { items: [estancia("helado-1", "Copa de helado de Estancia con fresa"), estancia("helado-2", "Copa de helado con el logotipo de Estancia")] },
  "1/14": { items: [sweett("bolsa-blanca", "Bolsa de compra blanca de My Sweett Audrina"), sweett("tote", "Tote bag negra de My Sweett Audrina")] },
  "1/13": { items: [textucos("espectacular", "Espectacular de Josman Texturizados y Adhesivos", 1799, 1800), textucos("fachada", "Fachada con el logotipo de Josman", 1128, 1128)] },
  "1/12": { items: [josman("camion", "Camión revolvedor rotulado con la identidad de Josman Concretos"), josman("camion-obra", "Camión revolvedor de Josman Concretos en una obra", 1128, 1128)] },
  "1/11": { items: [creandoVideo("escenario-1", "Escenario de un evento de Creando lo Imposible"), creandoVideo("escenario-2", "Conferencia de Creando lo Imposible: transforma tu vida")] },
  "1/10": { items: [trend("banner-plaza", "Banner de Trend en una plaza comercial", 1800, 1799), trend("vitrina", "Vitrina con publicidad de Trend")] },
  "1/9": { items: [gotitas("logo", "Logotipo de Gotitas de Esperanza"), gotitas("isotipo-grande", "Isotipo de Gotitas de Esperanza en blanco sobre rosa, gran formato")] },
  "1/8": { items: [memories("fachada", "Lona de Memories en la fachada de un edificio"), memories("equipo-boda", "Equipo de Memories trabajando en una boda")] },
  "1/7": { items: [rag("i", "Agrupación representada por RAG en concierto"), rag("j", "Cantante en el escenario con el logotipo de RAG")] },
  "1/4": { items: [enevesol("1", "Paneles solares con el logotipo de Enevesol"), enevesol("7", "Isotipo de Enevesol en amarillo sobre azul"), enevesol("9", "Ilustración del isotipo de Enevesol")] },
  "1/0": { items: [yadi("foto-panoramica", "Bailarina de Yadi'Studio en un campo de trigo", 2133, 1200)] },
  "1/2": { items: [hamburger("j", "Logotipo de Ham!Burger sobre muro de ladrillo"), hamburger("reticula", "Retícula de construcción del logotipo de Ham!Burger", 1200, 1200)] },
};

// Textos del proyecto ("perfil/proyecto"): el hero, la introducción tras el
// hero, la entrada al bloque de color y el cierre. **texto** se muestra en negrita.
const PROJECT_STORY = {
  "2/0": {
    hero: {
      title: "VIBRALTOS Fest",
      // El título se muestra con el logotipo en lugar de texto
      titleLogo: "/Web/Vibraltos/logo.webp",
      category: "Sitio web · Festival de música",
      description: "VIBRALTOS Fest es el festival de música electrónica de Los Altos de Jalisco, presentado por Tequila Ocho. Diseñé y programé su sitio: un recorrido animado con el line up, los escenarios, las experiencias y todo lo necesario para vivir el día.",
      meta: [
        ["Disciplina", "Diseño y desarrollo web"],
        ["Tecnología", "Next.js · GSAP"],
        ["Año", "2026"],
        ["Diseñador", "Eloy Walls"],
      ],
    },
    intro: {
      eyebrow: "El proyecto",
      title: "Un festival que se siente desde la primera pantalla.",
      body: [
        "Un festival se vende con emoción: el sitio tenía que **transmitir la vibra del día** antes de que alguien comprara su boleto, y a la vez resolver dudas de horarios, accesos y ubicación.",
        "Construí una página con **identidad propia** —el atardecer alteño, tipografía de cartel y stickers— y **animaciones con GSAP** que acompañan el scroll: el logo que se pega, los textos que se revelan y los videos que suenan al verlos.",
        "Todo es **responsivo** y está pensado para el celular, donde se comparte y se compra la mayoría de los boletos.",
      ],
    },
    closing: {
      eyebrow: "El resultado",
      title: "Del primer vistazo al boleto.",
      body: [
        "Un sitio que contagia la energía del festival y al mismo tiempo responde todo lo práctico: qué, quién, dónde, cuándo y cómo entrar.",
        "El reto era **equilibrar espectáculo e información**: animaciones que emocionan sin estorbar al que solo quiere su boleto.",
      ],
      credit: { label: "Diseño y desarrollo", name: "@eloy_design", href: "https://www.instagram.com/eloy_design/" },
    },
  },
  "2/3": {
    hero: {
      title: "Order Express",
      // El título se muestra con el logotipo en lugar de texto
      titleLogo: "/Web/OrderExpress/logo.svg",
      category: "E-commerce · Tienda en línea y panel administrativo",
      description: "Order Express es una tienda de tecnología con su propio panel de administración. Diseñé y programé la tienda en línea, la experiencia móvil y el panel para gestionar ventas, productos, clientes y envíos.",
      meta: [
        ["Disciplina", "Diseño y desarrollo web"],
        ["Tecnología", "Next.js · Supabase"],
        ["Año", "2026"],
        ["Diseñador", "Eloy Walls"],
      ],
    },
    intro: {
      eyebrow: "El proyecto",
      title: "Una tienda y el negocio detrás de ella.",
      body: [
        "Una tienda en línea no termina en el botón de comprar: alguien tiene que surtir el pedido, cobrarlo, enviarlo y llevar el inventario. Order Express necesitaba **las dos caras del comercio** en un solo sistema.",
        "Construí una **tienda con identidad propia** —el magenta y el azul de la marca, tipografía condensada y fotografía de producto— y un **panel claro y ordenado** para operar el día a día.",
        "Todo es **responsivo**, rápido y conectado a una base de datos real.",
      ],
    },
    closing: {
      eyebrow: "El resultado",
      title: "Del escaparate al inventario, en un solo lugar.",
      body: [
        "Una tienda que se siente de marca y un panel que no necesita manual: Order Express puede vender, cobrar y enviar desde el mismo sistema.",
        "El reto era **equilibrar estilo y operación**: una experiencia de compra atractiva sin perder la claridad que exige administrar un negocio.",
      ],
      credit: { label: "Diseño y desarrollo", name: "@eloy_design", href: "https://www.instagram.com/eloy_design/" },
    },
  },
  "1/6": {
    hero: {
      title: "Un branding con sabor a éxito.",
      category: "Identidad visual · Branding gastronómico",
      description: "Una gran experiencia gastronómica empieza mucho antes del primer bocado. Para Deliz, saludable delicia, creé una identidad que se ve, se siente y se recuerda.",
      // Datos bajo el texto del hero (sustituyen a los genéricos)
      meta: [
        ["Disciplina", "Branding"],
        ["Diseñador", "Eloy Walls"],
        ["Fecha", "2014"],
      ],
    },
    intro: {
      eyebrow: "El proyecto",
      title: "Una marca que se siente, se recuerda y conecta.",
      body: [
        "La experiencia comienza cuando alguien descubre la marca: al ver su logotipo, al recorrer el menú, al recibir un plato o un empaque que de inmediato transmite una sensación.",
        "Para Deliz desarrollé una identidad pensada para transmitir **frescura, calidad, cercanía y carácter**: un universo gráfico que refleja una cocina saludable sin renunciar al placer de comer bien.",
        "Mi objetivo fue crear mucho más que un logotipo: un **sistema visual coherente, reconocible y adaptable**, capaz de acompañar a la marca en su crecimiento y de convertir cada interacción con el cliente en parte de la misma experiencia.",
      ],
    },
    palette: {
      eyebrow: "Color y tipografía",
      title: "Frescura, confianza y apetito.",
      body: [
        "El **verde Deliz** evoca lo natural y saludable; el **café oscuro** aporta calidez y elegancia, y el **blanco** da aire y limpieza a cada pieza.",
        "La tipografía completa esa personalidad: una script de trazo propio para la marca y una sans firme para la comunicación, de modo que cada pieza conserva el mismo lenguaje sin importar el formato.",
      ],
    },
    closing: {
      eyebrow: "El resultado",
      title: "Una marca que se convierte en experiencia.",
      body: [
        "Una identidad fresca, reconocible y con personalidad, que transforma algo cotidiano como comer en una experiencia de marca.",
        "El reto no era solo hacer algo atractivo, sino **contar una historia, generar una sensación y permanecer en la memoria** de las personas.",
        "Cuando estrategia y diseño trabajan juntos, una marca deja de ser solo un logotipo y empieza a convertirse en una experiencia.",
      ],
      credit: { label: "Diseño y dirección creativa", name: "@eloy_design", href: "https://www.instagram.com/eloy_design/" },
    },
  },
  "1/15": {
    hero: {
      title: "Estancia",
      category: "Identidad visual · Restaurante y panfetería",
      description: "Estancia es un restaurante y panfetería gourmet. Creé una identidad elegante y apetitosa, con un isotipo propio y un magenta que acompaña cada platillo, del menú a la calle.",
      meta: [
        ["Disciplina", "Branding"],
        ["Diseñador", "Eloy Walls"],
        ["Fecha", "2022"],
      ],
    },
    intro: {
      eyebrow: "El proyecto",
      title: "Una marca que se saborea.",
      body: [
        "En un restaurante la marca se prueba antes que la comida: en la fotografía, en el menú y en la primera publicación que alguien ve. Estancia necesitaba **verse tan cuidada como sus platillos**.",
        "Desarrollé una identidad **oscura, elegante y cálida**, donde el negro deja brillar la comida y el magenta pone el acento.",
        "Mi objetivo fue crear un **sistema visual completo**: logotipo, fotografía, menú, publicidad exterior y presencia digital, todos con la misma voz.",
      ],
    },
    palette: {
      eyebrow: "Color y tipografía",
      title: "Negro que enmarca, magenta que antoja.",
      body: [
        "El **magenta Estancia** aporta energía y apetito; el **negro** enmarca la fotografía y le da elegancia, y la **madera** y el **blanco** acompañan las aplicaciones impresas.",
        "La tipografía combina una sans redonda y gruesa para la marca, un trazo caligráfico para los acentos y una sans limpia para menús y precios.",
      ],
    },
    closing: {
      eyebrow: "El resultado",
      title: "Una experiencia que empieza antes del primer bocado.",
      body: [
        "Una identidad coherente que acompaña a Estancia de la mesa al celular y del menú al espectacular.",
        "El reto era **hacer que la marca abriera el apetito**: elegante sin ser fría, cercana sin perder sofisticación.",
      ],
      credit: { label: "Diseño y dirección creativa", name: "@eloy_design", href: "https://www.instagram.com/eloy_design/" },
    },
  },
  "1/14": {
    hero: {
      title: "My Sweett Audrina",
      category: "Identidad visual · Boutique de moda",
      description: "My Sweett Audrina es una boutique de moda femenina. Creé una identidad dulce y elegante, con un monograma propio y un rosa que se reconoce en cada bolsa, etiqueta y pantalla.",
      meta: [
        ["Disciplina", "Branding"],
        ["Diseñador", "Eloy Walls"],
      ],
    },
    intro: {
      eyebrow: "El proyecto",
      title: "Una marca dulce con carácter.",
      body: [
        "En la moda, la experiencia de compra empieza antes de probarse una prenda: en la bolsa, la etiqueta y la tienda en línea. La marca tenía que **sentirse especial en cada detalle**.",
        "Para My Sweett Audrina desarrollé una identidad **femenina, elegante y segura**, con un monograma que funciona como sello de la boutique.",
        "Mi objetivo fue crear un **sistema visual sencillo y coherente**, del empaque al celular.",
      ],
    },
    palette: {
      eyebrow: "Color y tipografía",
      title: "Rosa que endulza, negro que da estilo.",
      body: [
        "El **rosa Sweett** aporta dulzura y personalidad; el **negro** da elegancia y contraste, y el **blanco** deja respirar cada pieza.",
        "La tipografía combina una serif elegante, como el trazo del logotipo, con una sans limpia para precios, tallas y botones.",
      ],
    },
    closing: {
      eyebrow: "El resultado",
      title: "Una boutique que se reconoce por su sello.",
      body: [
        "Una identidad delicada y reconocible que acompaña a la boutique del mostrador a la tienda en línea.",
        "El reto era **equilibrar dulzura y elegancia**: una marca tierna sin perder carácter.",
      ],
      credit: { label: "Diseño y dirección creativa", name: "@eloy_design", href: "https://www.instagram.com/eloy_design/" },
    },
  },
  "1/13": {
    hero: {
      title: "Josman Texturizados y Adhesivos",
      category: "Identidad visual · Packaging",
      description: "Josman Texturizados y Adhesivos es la línea de acabados de Josman: adhesivos, pegazulejos y texturizados. Creé una identidad colorida y confiable, pensada para destacar en el anaquel y en la obra.",
      meta: [
        ["Disciplina", "Branding"],
        ["Diseñador", "Eloy Walls"],
        ["Fecha", "2021"],
      ],
    },
    intro: {
      eyebrow: "El proyecto",
      title: "Pegamás fuerte.",
      body: [
        "En una ferretería, el cliente elige en segundos entre decenas de costales parecidos. La marca tenía que **destacar en el anaquel** y transmitir calidad técnica al mismo tiempo.",
        "Para esta línea de Josman desarrollé una identidad **vibrante y cercana**, con tres colores que distinguen cada familia de producto y dos personajes que hablan el idioma de la obra.",
        "Mi objetivo fue crear un **sistema de packaging y comunicación** coherente, del costal al catálogo y de la ferretería a la tienda en línea.",
      ],
    },
    palette: {
      eyebrow: "Color y tipografía",
      title: "Tres colores, tres capas.",
      body: [
        "El **índigo** da solidez y confianza; el **naranja** aporta energía y visibilidad en el anaquel, y el **verde** transmite calidad y resistencia. El **blanco** ordena las fichas técnicas.",
        "La tipografía combina una sans contundente para nombres de producto con una sans legible para instrucciones y especificaciones.",
      ],
    },
    closing: {
      eyebrow: "El resultado",
      title: "Una marca que se adhiere a la memoria.",
      body: [
        "Una identidad colorida y coherente, capaz de ordenar una línea completa de productos sin perder personalidad.",
        "El reto era **hacer reconocible cada producto sin romper la unidad de la marca**, y lograrlo en empaques, impresos y medios digitales.",
      ],
      credit: { label: "Diseño y dirección creativa", name: "@eloy_design", href: "https://www.instagram.com/eloy_design/" },
    },
  },
  "1/12": {
    hero: {
      title: "Josman Concretos",
      category: "Identidad visual · Construcción",
      description: "Josman Concretos produce y distribuye concreto y materiales para construcción. Creé una identidad sólida, clara y reconocible, pensada para vivir en la obra, en la carretera y en la pantalla.",
      meta: [
        ["Disciplina", "Branding"],
        ["Diseñador", "Eloy Walls"],
        ["Fecha", "2020"],
      ],
    },
    intro: {
      eyebrow: "El proyecto",
      title: "Una marca tan sólida como su concreto.",
      body: [
        "En la construcción, la confianza lo es todo: el cliente necesita saber que el material llegará a tiempo y con la calidad prometida. La marca tenía que **transmitir solidez y profesionalismo** desde el primer vistazo.",
        "Para Josman desarrollé una identidad **fuerte, ordenada y cercana**, con un isotipo que toma la forma de su herramienta principal: la revolvedora.",
        "Mi objetivo fue crear un **sistema visual completo** que funcione en el camión, en el uniforme, en la papelería técnica y en la publicidad, sin perder coherencia.",
      ],
    },
    palette: {
      eyebrow: "Color y tipografía",
      title: "Azul de confianza, amarillo de obra.",
      body: [
        "El **azul** transmite seriedad y confianza; el **amarillo** remite a la maquinaria y la señalización de obra, y el **gris concreto** conecta con el material. El **blanco** ordena la información técnica.",
        "La tipografía combina una sans contundente para la marca y los productos con una sans legible para fichas, precios y datos de contacto.",
      ],
    },
    closing: {
      eyebrow: "El resultado",
      title: "Una identidad que se construye en cada obra.",
      body: [
        "Una marca sólida y coherente que acompaña a la empresa del camión revolvedor a la pantalla del celular.",
        "El reto era **unir lo técnico con lo cercano**: una identidad que inspire confianza a constructoras y particulares por igual.",
      ],
      credit: { label: "Diseño y dirección creativa", name: "@eloy_design", href: "https://www.instagram.com/eloy_design/" },
    },
  },
  "1/11": {
    hero: {
      title: "Creando lo Imposible",
      category: "Identidad visual · Desarrollo personal y eventos",
      description: "Creando lo Imposible organiza seminarios y experiencias de transformación personal. Creé una identidad intensa y luminosa, pensada para brillar en el escenario, en la ropa y en la pantalla.",
      meta: [
        ["Disciplina", "Branding"],
        ["Diseñador", "Eloy Walls"],
        ["Fecha", "2022"],
      ],
    },
    intro: {
      eyebrow: "El proyecto",
      title: "Una marca que se vive en el escenario.",
      body: [
        "Un evento de transformación personal se recuerda por lo que se siente: la música, las luces y la energía del público. La marca tenía que **transmitir esa intensidad** desde el primer anuncio.",
        "Para Creando lo Imposible desarrollé una identidad **neón, cósmica y poderosa**, inspirada en la idea de expandirse más allá de los propios límites.",
        "Mi objetivo fue crear un **sistema visual completo**: del logotipo animado en pantalla gigante a la sudadera que la comunidad lleva después del evento.",
      ],
    },
    palette: {
      eyebrow: "Color y tipografía",
      title: "Morado y verde que brillan en la oscuridad.",
      body: [
        "El **morado neón** representa la transformación y la intuición; el **verde neón** la vida y el crecimiento, y el **negro** les da el escenario para brillar. Juntos forman el **degradado** de la marca.",
        "La tipografía combina una sans contundente para los mensajes que inspiran y una sans legible para la información de cada evento.",
      ],
    },
    closing: {
      eyebrow: "El resultado",
      title: "Una identidad que hace posible lo imposible.",
      body: [
        "Una marca vibrante y reconocible que acompaña a la comunidad del escenario a la vida diaria.",
        "El reto era **traducir una experiencia emocional en un sistema visual**, coherente en cada punto de contacto: pantalla, ropa, papelería y redes.",
      ],
      credit: { label: "Diseño y dirección creativa", name: "@eloy_design", href: "https://www.instagram.com/eloy_design/" },
    },
  },
  "1/10": {
    hero: {
      title: "Trend",
      singleLine: true,
      category: "Identidad visual · Boutique de moda",
      description: "Trend Boutique «Only» es una tienda de ropa con espíritu joven y urbano. Creé una identidad en blanco y negro, directa y versátil, que vive igual en una etiqueta, una vitrina o la pantalla del celular.",
      meta: [
        ["Disciplina", "Branding"],
        ["Diseñador", "Eloy Walls"],
        ["Fecha", "2018"],
      ],
    },
    intro: {
      eyebrow: "El proyecto",
      title: "Una marca con actitud.",
      body: [
        "En la moda, la marca es parte de lo que se compra. Trend necesitaba una identidad **reconocible al instante**, capaz de competir en la calle y en redes sociales.",
        "Para Trend desarrollé una identidad **minimalista y contundente**: un monograma fuerte, un acento caligráfico y un sistema en blanco y negro que deja brillar a las prendas.",
        "Mi objetivo fue crear un **sistema visual completo**, del empaque a la app, pensado para una boutique que vende tanto en tienda como en línea.",
      ],
    },
    palette: {
      eyebrow: "Color y tipografía",
      title: "Blanco, negro y un golpe de amarillo.",
      body: [
        "El **negro** y el **blanco** dan a la marca un carácter urbano y atemporal; el **gris Trend** suaviza los fondos, y el **amarillo** aparece solo en las preventas para llamar la atención.",
        "La tipografía combina una sans gruesa y compacta para la marca, una script para el acento «Only» y una sans legible para la información.",
      ],
    },
    closing: {
      eyebrow: "El resultado",
      title: "Una boutique con identidad propia.",
      body: [
        "Una identidad minimalista, versátil y fácil de recordar, que acompaña a la boutique en tienda, en la calle y en la pantalla.",
        "El reto era **crear una marca con presencia sin quitarle protagonismo a la ropa**: un sistema sobrio que se vuelve inconfundible.",
      ],
      credit: { label: "Diseño y dirección creativa", name: "@eloy_design", href: "https://www.instagram.com/eloy_design/" },
    },
  },
  "1/9": {
    hero: {
      title: "Gotitas de Esperanza",
      category: "Identidad visual · Asociación social",
      description: "Gotitas de Esperanza es una asociación que impulsa la salud y la reintegración social. Creé una identidad cálida y cercana, que transmite apoyo, transformación y esperanza.",
      meta: [
        ["Disciplina", "Branding"],
        ["Diseñador", "Eloy Walls"],
        ["Fecha", "2016"],
      ],
    },
    intro: {
      eyebrow: "El proyecto",
      title: "Una marca que acompaña.",
      body: [
        "Una asociación social necesita algo más que reconocimiento: necesita **generar confianza y empatía** desde el primer contacto.",
        "Para Gotitas de Esperanza desarrollé una identidad **suave, humana y optimista**, que habla de cuidado y de la posibilidad de transformarse, como una mariposa.",
        "Mi objetivo fue crear un **sistema visual cercano y coherente**, útil tanto para documentos formales como para convocar a la comunidad en sus campañas.",
      ],
    },
    palette: {
      eyebrow: "Color y tipografía",
      title: "Rosa que abraza, malva que da fuerza.",
      body: [
        "El **rosa esperanza** transmite calidez y cuidado; el **malva** aporta profundidad y seriedad, y el **gris perla** y el **blanco** dan aire y limpieza a cada pieza.",
        "La tipografía es redondeada y gruesa en la marca, amable a la vista, y se acompaña de una sans legible para la información.",
      ],
    },
    closing: {
      eyebrow: "El resultado",
      title: "Una identidad que inspira esperanza.",
      body: [
        "Una marca cálida, reconocible y coherente, que acompaña a la asociación en sus documentos, campañas y redes.",
        "El reto era **transmitir seriedad sin perder la ternura**: una identidad que se sienta tan cercana como la causa que representa.",
      ],
      credit: { label: "Diseño y dirección creativa", name: "@eloy_design", href: "https://www.instagram.com/eloy_design/" },
    },
  },
  "1/8": {
    hero: {
      title: "Memories",
      singleLine: true,
      category: "Identidad visual · Fotografía y filmación",
      description: "Memories, estudio de fotografía y filmación de eventos, necesitaba una marca tan emotiva como los momentos que captura. Creé una identidad elegante, atemporal y cercana.",
      meta: [
        ["Disciplina", "Branding"],
        ["Diseñador", "Eloy Walls"],
        ["Fecha", "2015"],
      ],
    },
    intro: {
      eyebrow: "El proyecto",
      title: "Una marca para guardar momentos.",
      body: [
        "Una boda, unos XV años o una sesión de pareja ocurren una sola vez. La marca tenía que **transmitir confianza y sensibilidad**: la certeza de que esos momentos quedarán en buenas manos.",
        "Para Memories desarrollé una identidad en **blanco y negro, elegante y atemporal**, que deja el protagonismo a las fotografías y acompaña cada etapa del servicio.",
        "Mi objetivo fue crear un **sistema visual completo**: del logotipo al uniforme, de la caja de entrega a la publicidad en la calle y en el celular.",
      ],
    },
    palette: {
      eyebrow: "Color y tipografía",
      title: "Blanco y negro, como un buen recuerdo.",
      body: [
        "El **negro** y el **blanco** aportan elegancia y hacen que la marca nunca compita con las fotografías; el **rosa recuerdo** suma calidez y romanticismo en piezas especiales.",
        "La tipografía combina una script de trazo firme para la marca y una sans espaciada para el texto, como en «Fotografía y Filmación».",
      ],
    },
    closing: {
      eyebrow: "El resultado",
      title: "Una marca que también se recuerda.",
      body: [
        "Una identidad elegante, coherente y emotiva, presente en cada punto de contacto: del primer anuncio a la entrega del álbum.",
        "El reto era **diseñar una marca que acompañe sin robar protagonismo**, porque en Memories las verdaderas protagonistas son las historias de cada cliente.",
      ],
      credit: { label: "Diseño y dirección creativa", name: "@eloy_design", href: "https://www.instagram.com/eloy_design/" },
    },
  },
  "1/7": {
    hero: {
      title: "RAG",
      singleLine: true,
      category: "Identidad visual · Representación artística",
      description: "RAG, Representaciones Artísticas de Guanajuato, impulsa y representa a agrupaciones musicales. Creé una identidad con ritmo, presencia y carácter de escenario.",
      meta: [
        ["Disciplina", "Branding"],
        ["Diseñador", "Eloy Walls"],
        ["Fecha", "2011"],
      ],
    },
    intro: {
      eyebrow: "El proyecto",
      title: "Una marca que se escucha antes de verse.",
      body: [
        "En la industria musical, la imagen de una agencia acompaña a cada artista: en carteles, escenarios y redes. La marca tenía que **transmitir profesionalismo sin perder la emoción del espectáculo**.",
        "Para RAG desarrollé una identidad que une **música, elegancia y fuerza**, inspirada en el teclado del piano y en el brillo de las luces del escenario.",
        "Mi objetivo fue crear un **sistema visual reconocible y versátil**, que represente a la agencia y deje brillar a los artistas que impulsa.",
      ],
    },
    palette: {
      eyebrow: "Color y tipografía",
      title: "Azul de noche, amarillo de reflector.",
      body: [
        "El **azul** evoca la noche del espectáculo y aporta seriedad; el **amarillo** es la luz del reflector que pone a la marca en primer plano, y el **negro** y el **blanco** dan contraste al sistema.",
        "La tipografía combina una serif de alto contraste, elegante como el logotipo, con una sans limpia para la información de cada evento.",
      ],
    },
    closing: {
      eyebrow: "El resultado",
      title: "Una identidad lista para el escenario.",
      body: [
        "Una marca elegante, enérgica y fácil de recordar, que representa a la agencia con la misma fuerza que sus artistas en vivo.",
        "El reto era **unir la formalidad de una agencia con la emoción de la música**, y lograrlo en cada punto de contacto.",
      ],
      credit: { label: "Diseño y dirección creativa", name: "@eloy_design", href: "https://www.instagram.com/eloy_design/" },
    },
  },
  "1/4": {
    hero: {
      title: "Enevesol",
      singleLine: true,
      category: "Identidad visual · Energía solar",
      description: "Enevesol, los expertos en paneles solares, necesitaba una marca que transmitiera confianza técnica y energía limpia. Creé una identidad clara, luminosa y fácil de recordar.",
      meta: [
        ["Disciplina", "Branding"],
        ["Diseñador", "Eloy Walls"],
        ["Fecha", "2019"],
      ],
    },
    intro: {
      eyebrow: "El proyecto",
      title: "Energía que se ve y se entiende.",
      body: [
        "La energía solar es una decisión de futuro, pero también de confianza: las personas necesitan entender qué contratan y sentir que están en buenas manos.",
        "Para Enevesol desarrollé una identidad que combina **luz, tecnología y cercanía**, pensada para explicar un servicio técnico de forma clara y atractiva.",
        "Mi objetivo fue construir un **sistema visual sólido y versátil**, que funcione igual en un uniforme de instalación, en papelería o en una animación para redes.",
      ],
    },
    palette: {
      eyebrow: "Color y tipografía",
      title: "Azul que da confianza, amarillo que da energía.",
      body: [
        "El **azul marino** transmite seriedad, tecnología y confianza; el **amarillo solar** aporta luz, optimismo y energía; el **blanco** da claridad, y el **naranja** suma calidez como acento.",
        "La tipografía refuerza ese carácter: una sans geométrica y contundente para la marca y una sans legible para la información técnica.",
      ],
    },
    closing: {
      eyebrow: "El resultado",
      title: "Una marca que ilumina su propio camino.",
      body: [
        "Una identidad clara, luminosa y confiable, que hace fácil entender y elegir la energía solar.",
        "El reto era **traducir un servicio técnico en una marca cercana**, coherente del uniforme a la pantalla.",
      ],
      credit: { label: "Diseño y dirección creativa", name: "@eloy_design", href: "https://www.instagram.com/eloy_design/" },
    },
  },
  "1/0": {
    hero: {
      title: "Yadi'Studio",
      singleLine: true,
      category: "Identidad visual · Danza árabe",
      description: "Yadi'Studio es una escuela de danza árabe que necesitaba una identidad tan elegante y expresiva como su disciplina. Creé una marca que transmite gracia, movimiento y misterio.",
      meta: [
        ["Disciplina", "Branding"],
        ["Diseñador", "Eloy Walls"],
        ["Fecha", "2016"],
      ],
    },
    intro: {
      eyebrow: "El proyecto",
      title: "Una marca que se mueve como la danza.",
      body: [
        "La danza árabe es elegancia, ritmo y expresión. La marca tenía que **transmitir esa misma emoción** antes incluso de ver bailar a alguien.",
        "Para Yadi'Studio desarrollé una identidad que combina **ornamento, feminidad y carácter**, inspirada en los arabescos y en el movimiento fluido de los velos.",
        "Mi objetivo fue crear un **sistema visual reconocible y versátil**, capaz de acompañar al estudio en clases, presentaciones, publicidad y redes sociales.",
      ],
    },
    palette: {
      eyebrow: "Color y tipografía",
      title: "Violeta: misterio, elegancia y energía.",
      body: [
        "La paleta se construye sobre tres tonos de violeta que, juntos, forman el **gradiente de la marca**: del morado profundo, sobrio y elegante, al púrpura vibrante que transmite energía y creatividad.",
        "La tipografía equilibra lo ornamental y lo limpio: una display con remates decorativos para la marca y una sans espaciada para la comunicación.",
      ],
    },
    closing: {
      eyebrow: "El resultado",
      title: "Una identidad con gracia y movimiento.",
      body: [
        "Una marca elegante, expresiva y fácil de reconocer, que traduce la esencia de la danza árabe a un lenguaje visual propio.",
        "El reto era **transmitir movimiento en una imagen fija**, y hacerlo de forma coherente en cada punto de contacto.",
      ],
      credit: { label: "Diseño y dirección creativa", name: "@eloy_design", href: "https://www.instagram.com/eloy_design/" },
    },
  },
  "1/2": {
    hero: {
      title: "Ham-Burguer",
      // El nombre de la marca se mantiene en una sola línea
      singleLine: true,
      category: "Identidad visual · Branding gastronómico",
      description: "Ham!Burger, la original pizzaburger, necesitaba una identidad tan intensa como su producto. Creé una marca con energía, actitud y apetito, pensada para destacar en la calle y en la mano.",
      meta: [
        ["Disciplina", "Branding"],
        ["Diseñador", "Eloy Walls"],
        ["Fecha", "2014"],
      ],
    },
    intro: {
      eyebrow: "El proyecto",
      title: "Energía que se ve, se antoja y se recuerda.",
      body: [
        "La comida rápida se elige en segundos: una fachada, un empaque o un logotipo deciden si alguien entra o sigue de largo. Por eso la marca tenía que **llamar la atención al instante**.",
        "Para Ham!Burger desarrollé una identidad con **actitud, fuerza y sentido del humor**, que refleja la mezcla única de su producto: la original pizzaburger.",
        "Mi objetivo fue construir un **sistema visual reconocible desde lejos**, coherente en cada punto de contacto y listo para crecer con la marca.",
      ],
    },
    palette: {
      eyebrow: "Color y tipografía",
      title: "Rojo, amarillo y apetito.",
      body: [
        "El **rojo** aporta energía y despierta el apetito; el **amarillo** suma alegría y visibilidad, y el **negro** da contraste y carácter urbano.",
        "La tipografía acompaña ese tono: una display redondeada y contundente para la marca y los titulares, y una sans amable para el texto, de modo que la marca se reconozca incluso antes de leer su nombre.",
      ],
    },
    closing: {
      eyebrow: "El resultado",
      title: "Una marca con hambre de destacar.",
      body: [
        "Una identidad intensa, divertida y fácil de recordar, que convierte una pizzaburger en una experiencia de marca.",
        "El reto era **destacar en un mercado saturado** sin perder cercanía: una marca que se reconoce de lejos y se disfruta de cerca.",
      ],
      credit: { label: "Diseño y dirección creativa", name: "@eloy_design", href: "https://www.instagram.com/eloy_design/" },
    },
  },
};

// Convierte **texto** en <strong> dentro de un párrafo
// true si un color hexadecimal es claro (el texto blanco del navbar no se leería)
function isLightColor(value) {
  const hex = String(value || "").trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6;
}

function renderRich(text) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, index) => (index % 2 ? <strong key={index}>{part}</strong> : part));
}

// Bloque de texto editorial: antetítulo y título a la izquierda, cuerpo a la derecha
function StoryBlock({ block }) {
  return (
    <section className={styles.story}>
      <header>
        <span>{block.eyebrow}</span>
        <h2>{block.title}</h2>
      </header>
      <div className={styles.storyBody}>
        {block.body.map((paragraph, index) => <p key={index}>{renderRich(paragraph)}</p>)}
        {block.credit && (
          <p className={styles.storyCredit}>
            {block.credit.label}: <a href={block.credit.href} target="_blank" rel="noreferrer">{block.credit.name}</a>
          </p>
        )}
      </div>
    </section>
  );
}

// Fila de imágenes: columnas proporcionales a cada imagen, o rejilla de
// cuadrados (compact). Todas protegidas contra descarga.
function FeatureRow({ items: row, compact, columns = 3 }) {
  const totalRatio = row.reduce((sum, item) => sum + item.width / item.height, 0);
  return (
    <div
      className={`${styles.featureRow} ${compact ? styles.featureRowCompact : ""} ${row.some((item) => item.device === "iphone") ? styles.featureRowPhones : ""}`}
      style={compact ? { "--compact-columns": columns } : { "--feature-columns": row.map((item) => `minmax(0, ${(item.width / item.height).toFixed(4)}fr)`).join(" ") }}
    >
      {row.map((feature) => feature.video ? (
        <figure className={`${styles.feature} ${styles.featureVideo}`} key={feature.video}>
          <VideoTile src={feature.video} poster={feature.poster} label={feature.alt} width={feature.width} height={feature.height} />
        </figure>
      ) : feature.device === "iphone" ? (
        // Captura de celular enmascarada dentro de un iPhone (marco, bordes
        // redondeados e isla dinámica hechos con CSS)
        <figure className={`${styles.feature} ${styles.phone}`} key={feature.image}>
          {/* Pantalla en formato 19.5:9 (el de los iPhone actuales); la captura
              se recorta desde arriba */}
          <div className={styles.phoneScreen} style={{ aspectRatio: "9 / 19.5" }}>
            <Image
              src={feature.image}
              alt={feature.alt}
              width={feature.width}
              height={feature.height}
              sizes={`(max-width: 767px) 46vw, ${Math.round(1200 / columns)}px`}
              quality={80}
              draggable={false}
            />
            <span className={styles.phoneIsland} aria-hidden="true" />
            <span className={styles.mediaShield} aria-hidden="true" />
          </div>
        </figure>
      ) : (
        <figure className={styles.feature} key={feature.image}>
          <Image
            src={feature.image}
            alt={feature.alt}
            width={feature.width}
            height={feature.height}
            sizes={`(max-width: 767px) ${compact ? "46vw" : "92vw"}, ${compact ? Math.round(1200 / columns) : Math.round((1200 * (feature.width / feature.height)) / totalRatio)}px`}
            quality={80}
            draggable={false}
          />
          <span className={styles.mediaShield} aria-hidden="true" />
        </figure>
      ))}
    </div>
  );
}

// Tipografías por proyecto ("perfil/proyecto"); el resto usa TYPEFACES.
// Una lista vacía oculta el módulo hasta tener las fuentes de la marca.

const PROJECT_TYPEFACES = {
  "1/6": [
    { name: "Painted Paradise", role: "Logotipo", className: styles.fontPaintedParadise, weights: "Regular", sample: "Deliz, sabor que se recuerda." },
    { name: "Franklin Gothic Demi", role: "Titulares y texto", className: styles.fontFranklinDemi, weights: "Demi", sample: "Claridad y fuerza en cada aplicación de la marca." },
  ],
  "1/15": [
    { name: "Nunito", role: "Marca y titulares", className: nunito.className, weights: "Extrabold 800", sample: "estancia" },
    { name: "Courgette", role: "Acento caligráfico", className: styles.fontCourgette, weights: "Regular 400", sample: "panfetería" },
    { name: "Inter", role: "Menú y precios", className: inter.className, weights: "Regular 400 · Semibold 600", sample: "Reserva un momento inolvidable." },
  ],
  "1/14": [
    { name: "Playfair Display", role: "Marca y titulares", className: playfair.className, weights: "Regular 400 · Bold 700", sample: "My Sweett Audrina" },
    { name: "Inter", role: "Tienda y detalles", className: inter.className, weights: "Regular 400 · Semibold 600", sample: "Nueva colección disponible." },
  ],
  "1/13": [
    { name: "Montserrat Black", role: "Marca y productos", className: montserratBlack.className, weights: "Extrabold 800 · Black 900", sample: "PEGAMÁS FUERTE" },
    { name: "Inter", role: "Fichas técnicas", className: inter.className, weights: "Regular 400 · Semibold 600", sample: "Siempre accesible, donde quiera que estés." },
  ],
  "1/12": [
    { name: "Montserrat Black", role: "Marca y productos", className: montserratBlack.className, weights: "Extrabold 800 · Black 900", sample: "CONCRETO FC/150" },
    { name: "Inter", role: "Fichas y datos técnicos", className: inter.className, weights: "Regular 400 · Semibold 600", sample: "Solidez que construye el futuro." },
  ],
  "1/11": [
    { name: "Montserrat Black", role: "Marca y mensajes", className: montserratBlack.className, weights: "Extrabold 800 · Black 900", sample: "LLEVA LO IMPOSIBLE A TUS MANOS" },
    { name: "Inter", role: "Texto y eventos", className: inter.className, weights: "Regular 400 · Semibold 600", sample: "Transforma tu vida." },
  ],
  "1/10": [
    { name: "Montserrat Black", role: "Marca y titulares", className: montserratBlack.className, weights: "Extrabold 800 · Black 900", sample: "TREND BOUTIQUE" },
    { name: "Courgette", role: "Acento caligráfico", className: styles.fontCourgette, weights: "Regular 400", sample: "Only" },
    { name: "Inter", role: "Texto", className: inter.className, weights: "Regular 400 · Semibold 600", sample: "Lo auténtico es irremplazable." },
  ],
  "1/9": [
    { name: "Nunito", role: "Marca y titulares", className: nunito.className, weights: "Extrabold 800", sample: "GOTITAS DE ESPERANZA" },
    { name: "Inter", role: "Texto", className: inter.className, weights: "Regular 400 · Semibold 600", sample: "Juntos transformamos vidas." },
  ],
  "1/8": [
    { name: "Lobster", role: "Marca y titulares", className: lobster.className, weights: "Regular 400", sample: "Memories" },
    { name: "Montserrat", role: "Texto y detalles", className: montserrat.className, weights: "Light 300 · Semibold 600", sample: "F O T O G R A F Í A   Y   F I L M A C I Ó N" },
  ],
  "1/7": [
    { name: "Playfair Display", role: "Marca y titulares", className: playfair.className, weights: "Regular 400 · Bold 700", sample: "Representaciones Artísticas." },
    { name: "Inter", role: "Texto y eventos", className: inter.className, weights: "Regular 400 · Semibold 600", sample: "Música en vivo, presencia en cada escenario." },
  ],
  "1/4": [
    { name: "Montserrat Black", role: "Marca y titulares", className: montserratBlack.className, weights: "Extrabold 800 · Black 900", sample: "Los expertos en paneles." },
    { name: "Inter", role: "Texto e información técnica", className: inter.className, weights: "Regular 400 · Semibold 600", sample: "Energía limpia, clara y confiable." },
  ],
  "1/0": [
    { name: "Cinzel Decorative", role: "Marca y titulares", className: cinzelDecorative.className, weights: "Regular 400 · Bold 700", sample: "Magia en cada movimiento." },
    { name: "Montserrat", role: "Texto y detalles", className: montserrat.className, weights: "Light 300 · Semibold 600", sample: "D A N Z A   Á R A B E" },
  ],
  "1/2": [
    { name: "Lilita One", role: "Marca y titulares", className: lilitaOne.className, weights: "Regular 400", sample: "¡La original pizzaburger!" },
    { name: "Nunito", role: "Texto", className: nunito.className, weights: "Regular 400 · Extrabold 800", sample: "Sabor, actitud y antojo en cada pedido." },
  ],
};

// Filas de la galería: anchos en columnas de 12 que se repiten en ciclo, para
// que las imágenes varíen de tamaño en horizontal. Si sobra una sola imagen al
// final, ocupa la fila completa para no dejar huecos.
const ROW_PATTERN = [[12], [8, 4], [5, 7], [12], [6, 6], [4, 8]];

// Quita emojis (y sus modificadores) de los textos que llegan del dashboard
function stripEmoji(text) {
  return String(text || "")
    .replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\u{1F3FB}-\u{1F3FF}‍️⃣]/gu, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function layoutGallery(items) {
  const rows = [];
  let cursor = 0;
  let patternIndex = 0;
  while (cursor < items.length) {
    const left = items.length - cursor;
    let spans = ROW_PATTERN[patternIndex % ROW_PATTERN.length];
    if (spans.length > left) spans = [12];
    spans.forEach((span) => {
      rows.push({ ...items[cursor], span, full: span === 12 });
      cursor += 1;
    });
    patternIndex += 1;
  }
  return rows;
}

export async function generateMetadata({ params }) {
  const route = await params;
  const data = await getProfileProject("diseno", route.profileId, route.projectId);
  if (!data) return {};
  const story = PROJECT_STORY[`${route.profileId}/${route.projectId}`] || {};
  return {
    // Nombre del proyecto (el del dashboard), no el lema del hero
    title: stripEmoji(data.title || story.hero?.title || "Proyecto de diseño"),
    description: stripEmoji(story.hero?.description || data.caption || "").slice(0, 160) || undefined,
  };
}

export default async function DesignProjectPage({ params }) {
  const route = await params;
  const data = await getProfileProject("diseno", route.profileId, route.projectId);
  if (!data) notFound();

  const isWebProject = String(route.profileId) === "2" || /web/i.test(`${data.profileName} ${data.profileBio}`);
  // Enlace de regreso al área de origen (Web, Isotipos o Diseño)
  const isIsotiposProject = /isotipo/i.test(data.profileName || "");
  const backHref = isWebProject ? "/diseno?vista=web" : isIsotiposProject ? "/diseno?vista=isotipos" : "/diseno";
  const backLabel = isWebProject ? "Web" : isIsotiposProject ? "Isotipos" : "Diseño";
  const story = PROJECT_STORY[`${route.profileId}/${route.projectId}`] || {};
  // Los textos del hero se muestran sin emojis
  const title = stripEmoji(story.hero?.title || data.title || (data.caption || "Proyecto de diseño").split("#")[0]);
  const description = stripEmoji(
    story.hero?.description ||
    data.caption ||
    data.profileBio ||
    "Identidad visual desarrollada desde el concepto hasta sus aplicaciones finales.",
  );
  const profileName = stripEmoji(data.profileName);
  const heroMedia = HERO_MEDIA[`${route.profileId}/${route.projectId}`] || { image: data.image, alt: data.caption || title };
  // Con hero o página claros, el navbar de escritorio (texto blanco) necesita
  // una franja oscura detrás para leerse
  const needsNavBand = Boolean(heroMedia.lightPage || isLightColor(heroMedia.heroBackground));
  const category = stripEmoji(story.hero?.category || data.web?.type || (isWebProject ? "Diseño y desarrollo web" : "Dirección de arte · Identidad visual"));
  const typefaces = PROJECT_TYPEFACES[`${route.profileId}/${route.projectId}`] || TYPEFACES;
  const introImages = PROJECT_INTRO_IMAGES[`${route.profileId}/${route.projectId}`];
  const featureRows = PROJECT_FEATURES[`${route.profileId}/${route.projectId}`] || [];
  // La galería de ejemplo solo rellena proyectos sin imágenes propias
  const gallery = layoutGallery((isWebProject || featureRows.length ? [] : BRANDING_DEMO).filter((item) => item.image));
  const technicalData = (story.hero?.meta || [
    ["Disciplina", data.web?.type || data.meta?.tecnica || (isWebProject ? "Diseño web" : "Branding")],
    ["Año", data.meta?.anio],
    ["Estudio", data.web?.author || "EW Studio"],
  ]).map(([label, value]) => [label, stripEmoji(value)]).filter(([, value]) => value);

  return (
    <main
      className={`${styles.projectPage} ${heroMedia.lightPage ? styles.pageLight : ""} ${needsNavBand ? styles.withNavBand : ""}`}
      style={{
        ...(heroMedia.storyInk || heroMedia.ink ? { "--story-ink": heroMedia.storyInk || heroMedia.ink } : {}),
        ...(heroMedia.pageBackground ? { "--page-bg": heroMedia.pageBackground } : {}),
      }}
    >
      {/* Hero a pantalla completa: texto a la izquierda, portada a la derecha */}
      <section
        className={`${styles.hero} ${heroMedia.heroBackground ? styles.heroFilled : ""} ${heroMedia.video ? styles.heroWithVideo : ""}`}
        style={heroMedia.heroBackground ? { "--hero-bg": heroMedia.heroBackground, "--hero-ink": heroMedia.ink } : undefined}
      >
        <Link href={backHref} className={styles.backLink} aria-label={`Volver a ${backLabel}`}>
          <span>←</span> Volver a {backLabel}
        </Link>

        <div className={`${styles.heroCopy} ${heroMedia.ink ? styles.heroCopyTinted : ""}`} style={heroMedia.ink ? { "--hero-ink": heroMedia.ink } : undefined}>
          <div className={styles.brandLine}>
            <span className={styles.brandDot} />
            <span>{profileName}</span>
          </div>
          <h1 className={`${story.hero?.singleLine ? styles.heroTitleSingle : ""} ${story.hero?.titleLogo ? styles.heroTitleLogo : ""}`}>
            {story.hero?.titleLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={story.hero.titleLogo} alt={title} draggable={false} />
            ) : (
              title
            )}
          </h1>
          <p className={styles.category}>{category}</p>
          <p className={styles.description}>{description}</p>
          <dl className={styles.metaRow}>
            {technicalData.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {heroMedia.video ? (
          <figure className={`${styles.heroMedia} ${styles.heroMediaContain} ${styles.heroMediaVideo}`}>
            <video
              src={heroMedia.video}
              poster={heroMedia.poster}
              aria-label={heroMedia.alt}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
            />
            <span className={styles.mediaShield} aria-hidden="true" />
          </figure>
        ) : heroMedia.image && (
          <figure
            className={`${styles.heroMedia} ${heroMedia.contain ? styles.heroMediaContain : ""}`}
            style={heroMedia.background ? { background: heroMedia.background } : undefined}
          >
            <img src={heroMedia.image} alt={heroMedia.alt} draggable={false} fetchPriority="high" decoding="async" />
            {/* Capa transparente encima: el clic derecho y el arrastre la tocan a
                ella, no a la imagen, así no aparece "Guardar imagen como…" */}
            <span className={styles.mediaShield} aria-hidden="true" />
          </figure>
        )}
      </section>

      {story.intro && <StoryBlock block={story.intro} />}
      {introImages && <FeatureRow {...introImages} />}
      {story.palette && <StoryBlock block={story.palette} />}

      {!isWebProject && <ColorPanel colors={PROJECT_PALETTES[`${route.profileId}/${route.projectId}`] || PALETTE} />}

      {!isWebProject && typefaces.length > 0 && (
        <section
          className={`${styles.typography} ${courgette.variable} ${libreFranklin.variable}`}
          style={{ "--type-count": typefaces.length, ...(heroMedia.storyInk || heroMedia.ink ? { "--type-ink": heroMedia.storyInk || heroMedia.ink } : {}) }}
          aria-label="Tipografías del proyecto"
        >
          {typefaces.map((typeface) => (
            <article className={styles.typeface} key={typeface.name}>
              <header>
                <span>{typeface.role}</span>
                <h2>{typeface.name}</h2>
              </header>
              <div className={typeface.className}>
                <p className={styles.typeGlyph} aria-hidden="true">Aa</p>
                <p className={styles.typeAlphabet}>
                  ABCDEFGHIJKLMNÑOPQRSTUVWXYZ<br />
                  abcdefghijklmnñopqrstuvwxyz<br />
                  0123456789 &amp;@?!
                </p>
                <p className={styles.typeSample}>{typeface.sample}</p>
              </div>
              <footer>{typeface.weights}</footer>
            </article>
          ))}
        </section>
      )}

      {featureRows.map((row, index) => row.story ? (
        <StoryBlock block={row.story} key={row.story.title} />
      ) : (
        <FeatureRow {...row} key={row.items[0]?.image || row.items[0]?.video || index} />
      ))}

      {gallery.length > 0 && (
        <section className={styles.gallery} aria-label={`Imágenes de ${title}`}>
          {gallery.map((item, index) => (
            <figure
              className={`${styles.shot} ${item.full ? styles.shotFull : ""}`}
              style={{ "--span": item.span }}
              key={`${item.id}-${index}`}
            >
              <Image src={item.image} alt={item.caption || `${title}, aplicación ${index + 1}`} fill sizes={`(max-width: 767px) 92vw, ${Math.round((1200 * item.span) / 12)}px`} />
            </figure>
          ))}
        </section>
      )}
      {story.closing && <StoryBlock block={story.closing} />}
    </main>
  );
}

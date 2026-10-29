// Configuración de la campaña ARTIFACT — Art Toy Project
// (/grow/proyectos/artifact).
//
// Es un crowdfunding de RECOMPENSAS (preventa): los paquetes son productos y
// experiencias, no acciones ni instrumentos de inversión. Las cifras de la
// campaña son DEMOSTRATIVAS hasta conectarlas con datos reales (Supabase).
// Todo lo editable vive aquí; la página se recalcula sola.

export const ARTIFACT = {
  nombre: "ARTIFACT",
  subnombre: "Art Toy Project",
  nombreNota: "Nombre provisional",
  eslogan: "NO ES UN JUGUETE. ES UNA PIEZA DE ARTE.",
  subtitulo: "Una figura de diseñador nacida para cuestionar los límites entre arte, cultura y objeto de colección.",
  etiquetas: ["SERIE 001", "EDICIÓN LIMITADA", "CAMPAÑA DE PREVENTA"],
  // Modelo 3D. Mientras sea null se muestra la figura construida en código;
  // al subir un .glb a /public (p. ej. "/artifact/modelo/artifact.glb"), el
  // visor lo carga en su lugar.
  modeloGLB: null,
  contacto: { correo: "hola@artifact.demo", nota: "Correo de demostración" },
  redes: ["Instagram", "TikTok", "Behance"],
};

// Campaña (datos demostrativos)
export const CAMPANA = {
  demo: true,
  moneda: "MXN",
  meta: 250_000,
  recaudado: 162_500,
  patrocinadores: 128,
  // Cierre: 21 días después del 28 oct 2026. El contador regresivo usa esta fecha.
  cierre: "2026-11-18T23:59:00-06:00",
};

// Variantes de la figura (se usan en el visor 3D y en la galería)
export const VARIANTES = [
  { id: "original", nombre: "Original", detalle: "Vinil negro mate, visor lima", cuerpo: "#141414", acento: "#c6ff00", metal: 0.05, rugosidad: 0.75 },
  { id: "hueso", nombre: "Hueso", detalle: "Resina blanco hueso, visor grafito", cuerpo: "#e9e4da", acento: "#2b2b2b", metal: 0.0, rugosidad: 0.55 },
  { id: "metalico", nombre: "Metálico", detalle: "Gris metálico satinado", cuerpo: "#8a8d91", acento: "#c6ff00", metal: 0.85, rugosidad: 0.28 },
  { id: "signature", nombre: "Signature", detalle: "Acabado exclusivo del paquete Limited Signature", cuerpo: "#c6ff00", acento: "#141414", metal: 0.1, rugosidad: 0.4 },
];

// Ficha técnica de la pieza
export const FICHA = [
  { titulo: "Tamaño", valor: "22 cm de alto", detalle: "Base de 9 × 9 cm" },
  { titulo: "Materiales", valor: "Vinil rotomoldeado y resina", detalle: "Visor en acrílico translúcido" },
  { titulo: "Acabados", valor: "Mate, satinado y metálico", detalle: "Pintado a mano en detalles" },
  { titulo: "Accesorios", valor: "Base numerada y halo removible", detalle: "Pin metálico de la serie" },
  { titulo: "Numeración", valor: "Edición de 500 piezas", detalle: "Cada figura con su número en la base" },
  { titulo: "Empaque", valor: "Caja coleccionable", detalle: "Ventana frontal y certificado de autenticidad" },
];

// Paquetes de recompensas. `limite: null` = sin límite.
// `entregaEstimada` es una estimación editable.
export const PAQUETES = [
  {
    id: "supporter", nombre: "Supporter", precio: 199,
    recompensa: "Certificado digital y contenido exclusivo",
    incluye: ["Certificado digital de patrocinador", "Bocetos y proceso en alta resolución", "Tu nombre en los créditos digitales"],
    limite: null, apartados: 41, entregaEstimada: "Dic 2026", fisico: false,
  },
  {
    id: "early-bird", nombre: "Early Bird", precio: 899,
    recompensa: "Una figura a precio especial",
    incluye: ["1 figura ARTIFACT edición Original", "Precio especial de preventa", "Contenido digital del Supporter"],
    limite: 100, apartados: 82, entregaEstimada: "May 2027", fisico: true,
  },
  {
    id: "collector", nombre: "Collector Edition", precio: 1_299,
    recompensa: "Figura numerada, packaging y certificado",
    incluye: ["Figura numerada", "Caja coleccionable", "Certificado de autenticidad firmado"],
    limite: 300, apartados: 61, entregaEstimada: "May 2027", fisico: true, destacado: true,
  },
  {
    id: "signature", nombre: "Limited Signature", precio: 2_499,
    recompensa: "Figura especial con acabado exclusivo",
    incluye: ["Variante Signature con acabado exclusivo", "Firma del artista en la base", "Todo lo de Collector Edition"],
    limite: 50, apartados: 37, entregaEstimada: "Jun 2027", fisico: true,
  },
  {
    id: "founder", nombre: "Founder Pack", precio: 5_999,
    recompensa: "Colección especial, reconocimiento y experiencia privada",
    incluye: ["Las cuatro variantes de la serie", "Reconocimiento como Founder en la caja", "Sesión privada con el artista (en línea)"],
    limite: 10, apartados: 7, entregaEstimada: "Jun 2027", fisico: true,
  },
];

// Metas desbloqueables
export const METAS = [
  { monto: 100_000, titulo: "Prototipo de producción" },
  { monto: 175_000, titulo: "Primera tirada de fabricación" },
  { monto: 250_000, titulo: "Lanzamiento de la edición original" },
  { monto: 350_000, titulo: "Variante cromática adicional" },
  { monto: 500_000, titulo: "Accesorio exclusivo" },
];

// Del concepto a tus manos. `estado`: "completado" | "en-curso" | "pendiente".
// Estados y fechas son DEMOSTRATIVOS y editables.
export const FABRICACION = [
  { etapa: "Conceptualización", fecha: "Jun 2026", estado: "completado", texto: "Personaje, historia y primeras exploraciones en papel." },
  { etapa: "Modelado 3D", fecha: "Ago 2026", estado: "completado", texto: "Escultura digital y ajustes de proporción para producción." },
  { etapa: "Prototipo", fecha: "Nov 2026", estado: "en-curso", texto: "Impresión y pintado del primer prototipo físico." },
  { etapa: "Validación", fecha: "Dic 2026", estado: "pendiente", texto: "Revisión de detalles, color y resistencia con el fabricante." },
  { etapa: "Fabricación", fecha: "Feb 2027", estado: "pendiente", texto: "Producción de la tirada según los fondos reunidos." },
  { etapa: "Control de calidad", fecha: "Mar 2027", estado: "pendiente", texto: "Revisión pieza por pieza y numeración." },
  { etapa: "Empaque", fecha: "Abr 2027", estado: "pendiente", texto: "Caja coleccionable, certificado y accesorios." },
  { etapa: "Envío", fecha: "May 2027", estado: "pendiente", texto: "Envío a cada patrocinador con número de rastreo." },
];

// Galería: `src` en /public/artifact. `ancho` controla la composición editorial.
export const GALERIA = [
  { src: "/artifact/render-frente.webp", alt: "Render frontal de ARTIFACT edición Original", tipo: "Render", ancho: "grande" },
  { src: "/artifact/boceto-1.svg", alt: "Boceto a lápiz del personaje", tipo: "Boceto", ancho: "normal" },
  { src: "/artifact/detalle-visor.webp", alt: "Primer plano del visor lima", tipo: "Primer plano", ancho: "normal" },
  { src: "/artifact/variantes.webp", alt: "Las cuatro variantes de la serie", tipo: "Variantes", ancho: "ancho" },
  { src: "/artifact/render-perfil.webp", alt: "Render de perfil en gris metálico", tipo: "Render", ancho: "normal" },
  { src: "/artifact/empaque.svg", alt: "Diseño de la caja coleccionable", tipo: "Empaque", ancho: "normal" },
  { src: "/artifact/boceto-2.svg", alt: "Bocetos de expresiones y del halo", tipo: "Boceto", ancho: "normal" },
  { src: "/artifact/render-hueso.webp", alt: "Render de la variante Hueso", tipo: "Material", ancho: "normal" },
];

// Origen del personaje
export const ORIGEN = {
  titulo: "Nació de un error en el archivo.",
  parrafos: [
    "ARTIFACT es lo que queda cuando una imagen se rompe y alguien decide conservarla. Un ser pequeño, de cabeza enorme y visor encendido, que observa el mundo como si todo fuera una pieza de museo.",
    "Su forma viene del boceto: líneas rápidas, proporciones exageradas y un halo que flota sobre su cabeza como una idea que todavía no termina de llegar. Cada decisión de diseño busca que la figura se lea como escultura antes que como juguete.",
    "Es curioso, silencioso y un poco irónico. Representa al coleccionista que no sólo compra objetos: los adopta, les da un lugar y los convierte en parte de su propia historia.",
  ],
  rasgos: [
    { titulo: "Personalidad", texto: "Observador, curioso, irónico." },
    { titulo: "Inspiración", texto: "Glitch digital, escultura brutalista y cultura de colección." },
    { titulo: "Significado", texto: "El valor de lo imperfecto y de lo que decidimos conservar." },
  ],
};

// Sobre el artista (texto editable)
export const ARTISTA = {
  nombre: "Eloy Walls",
  rol: "Diseñador y director de arte",
  bio: [
    "Eloy Walls trabaja entre el branding, la ilustración, la fotografía y el desarrollo digital. Su obra mezcla trazo a mano, composición editorial y tecnología.",
    "ARTIFACT es su primera figura de diseñador: el paso del papel y la pantalla a un objeto que se puede sostener, coleccionar y heredar.",
  ],
  filosofia: "Diseñar objetos que se sientan como obra, no como producto.",
  proyectos: [
    { titulo: "Sketch", texto: "Bocetos y dibujo a mano", href: "/galeria/sketch" },
    { titulo: "Humans", texto: "Serie fotográfica", href: "/galeria/humans" },
    { titulo: "Carteles", texto: "Diseño de carteles", href: "/diseno?vista=carteles" },
  ],
};

export const PREGUNTAS = [
  { p: "¿Qué estoy comprando al elegir un paquete?", r: "Una recompensa o preventa: un producto o experiencia que recibirás cuando se fabrique. Los paquetes no son acciones, participaciones ni instrumentos de inversión, y no generan rendimientos." },
  { p: "¿Cómo funciona mi aportación?", r: "Eliges un paquete y pagas su precio. Lo reunido financia la primera producción. Si la campaña no alcanza su meta, se informará a cada patrocinador cómo se procederá conforme a los Términos de Preventa." },
  { p: "¿Cuándo recibo mi recompensa?", r: "Cada paquete muestra una fecha de entrega estimada. Son estimaciones: la fabricación puede retrasarse y cada cambio se avisará por correo y en la sección de avances." },
  { p: "¿Cómo se fabrica la figura?", r: "Del boceto pasa a modelado 3D, prototipo, validación con el fabricante, producción, control de calidad pieza por pieza, empaque y envío. Puedes seguir cada etapa en la línea de tiempo." },
  { p: "¿Hacen envíos a todo México y al extranjero?", r: "La idea es enviar a todo México; los envíos internacionales se definirán más adelante. El costo y los tiempos de envío se confirmarán antes de cobrar." },
  { p: "¿Qué riesgos existen?", r: "Como en todo proyecto creativo en preventa, puede haber retrasos de fabricación, cambios menores de diseño o materiales, o problemas con proveedores. Se informará con transparencia cualquier cambio relevante." },
  { p: "¿Puedo cancelar o pedir un reembolso?", r: "Las condiciones de cancelación y reembolso se detallarán en los Términos de Preventa y en la Política de cancelación y reembolso antes de habilitar pagos reales." },
];

export const DOCUMENTOS_LEGALES = [
  "Aviso de Privacidad",
  "Términos de Preventa",
  "Política de envío",
  "Política de cancelación y reembolso",
];

// Textos de la plantilla de campaña (components/artifact/CampanaLanding.jsx).
// Los títulos con acento se escriben { antes, em, despues }: `em` va en
// itálica y con el color de acento.
export const TEXTOS = {
  marca: { nombre: "ARTIFACT", sup: "001" },
  secciones: { origen: "Origen", pieza: "La pieza", campana: "Campaña", recompensas: "Recompensas", galeria: "Galería", proceso: "Proceso", artista: "Artista", faq: "FAQ" },
  heroLineas: [{ texto: "NO ES UN" }, { texto: "JUGUETE." }, { texto: "ES UNA PIEZA", acento: true }, { texto: "DE ARTE.", acento: true }],
  botonExplorar: "Explorar la colección",
  botonReservar: "Reservar una edición",
  heroPista: "Arrastra para girarla",
  cinta: "NO ES UN JUGUETE — ES UNA PIEZA DE ARTE — SERIE 001 — EDICIÓN LIMITADA — NO ES UN JUGUETE — ES UNA PIEZA DE ARTE —",
  origen: { numero: "02 — El origen" },
  pieza: { numero: "03 — Explora la pieza", titulo: { antes: "Gírala. ", em: "Acércate." }, ayuda: "Arrastra para girar 360° · pellizca o usa la rueda para acercar", leyenda: "Variantes" },
  campana: { titulo: { antes: "Financia la ", em: "primera", despues: " producción." } },
  recompensas: { titulo: { antes: "Elige tu ", em: "edición." } },
  galeria: { titulo: { antes: "Renders, bocetos ", em: "y materia." } },
  proceso: { numero: "08 — Del concepto a tus manos", titulo: { antes: "Así llega a ", em: "tu repisa." } },
  comunidad: { numero: "10 — Comunidad de coleccionistas", titulo: { antes: "Entra al ", em: "círculo." }, texto: "Recibe avances de producción y anuncios de nuevas ediciones antes que nadie." },
  faq: { titulo: { antes: "Antes de ", em: "reservar." } },
  cta: { titulo: { antes: "EL ARTE DEL FUTURO ", em: "también", despues: " SE COLECCIONA." }, boton: "QUIERO SER PARTE DE LA PRIMERA EDICIÓN" },
};

// Todo lo de la campaña en un solo objeto, para la plantilla
export const CAMPANA_ARTIFACT = {
  id: "artifact",
  tema: null,
  modelo3d: true,
  ARTIFACT: { ...ARTIFACT, heroImagen: null },
  CAMPANA, VARIANTES, FICHA, PAQUETES, METAS, FABRICACION, GALERIA, PREGUNTAS, DOCUMENTOS_LEGALES, TEXTOS,
  ORIGEN: { ...ORIGEN, imagen: "/artifact/boceto-1.svg", imagenAlt: "Boceto a lápiz de ARTIFACT con sus anotaciones", imagenPie: "Boceto v.03 — proporciones y anotaciones" },
  ARTISTA,
};

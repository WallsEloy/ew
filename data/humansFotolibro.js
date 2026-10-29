// Campaña de crowdfunding HUMANS — Fotolibro 01 (/grow/proyectos/humans-fotolibro).
//
// Preventa con RECOMPENSAS del fotolibro de la serie HUMANS (fotografía de
// desnudo artístico). Los paquetes son productos y experiencias, no acciones
// ni instrumentos de inversión. Las cifras son DEMOSTRATIVAS hasta conectarlas
// con datos reales. Usa la misma plantilla que ARTIFACT
// (components/artifact/CampanaLanding.jsx), con otro tema de color.

const DIR = "/humans-fotolibro";

const ARTIFACT = {
  nombre: "HUMANS",
  subnombre: "Fotolibro 01",
  nombreNota: "Serie fotográfica de Eloy Walls",
  eslogan: "LA PIEL ES UN ARCHIVO DE LUZ.",
  subtitulo: "Un fotolibro de edición limitada que reúne la serie HUMANS: cuerpo, gesto y luz de neón convertidos en archivo.",
  etiquetas: ["FOTOLIBRO 01", "EDICIÓN LIMITADA", "CAMPAÑA DE PREVENTA", "+18 · DESNUDO ARTÍSTICO"],
  modeloGLB: null,
  heroImagen: `${DIR}/libro-hero.webp`,
  heroImagenAlt: "Mockup del fotolibro HUMANS, edición estándar",
  contacto: { correo: "humans@ew.demo", nota: "Correo de demostración" },
  redes: ["Instagram", "Behance"],
};

const CAMPANA = {
  demo: true,
  moneda: "MXN",
  meta: 180_000,
  recaudado: 97_200,
  patrocinadores: 86,
  cierre: "2026-12-05T23:59:00-06:00",
};

// Ediciones: en lugar de un modelo 3D, cada una muestra su imagen
const VARIANTES = [
  { id: "estandar", nombre: "Edición estándar", detalle: "Tapa dura, 160 páginas", imagen: `${DIR}/libro-estandar.webp`, imagenAlt: "Fotolibro HUMANS, edición estándar" },
  { id: "coleccionista", nombre: "Edición coleccionista", detalle: "Numerado, en caja, con print", imagen: `${DIR}/libro-coleccionista.webp`, imagenAlt: "Edición coleccionista: libro numerado en caja con un print" },
  { id: "print", nombre: "Print firmado", detalle: "Fine art 40 × 50 cm, enmarcado", imagen: `${DIR}/print-firmado.webp`, imagenAlt: "Print fine art firmado y numerado, enmarcado" },
  { id: "interior", nombre: "Interior", detalle: "Así se ve un pliego del libro", imagen: `${DIR}/libro-abierto.webp`, imagenAlt: "Fotolibro abierto con dos fotografías de la serie" },
];

const FICHA = [
  { titulo: "Formato", valor: "24 × 30 cm vertical", detalle: "Pensado para ver el cuerpo completo" },
  { titulo: "Páginas", valor: "160 páginas", detalle: "Papel couché mate de 170 g" },
  { titulo: "Fotografías", valor: "Más de 90 imágenes", detalle: "Selección de la serie HUMANS" },
  { titulo: "Encuadernación", valor: "Tapa dura", detalle: "Lomo cosido, abre plano" },
  { titulo: "Tiraje", valor: "300 ejemplares", detalle: "Numerados a mano" },
  { titulo: "Extras", valor: "Caja, print y certificado", detalle: "En las ediciones especiales" },
];

const PAQUETES = [
  {
    id: "supporter", nombre: "Supporter", precio: 249,
    recompensa: "Postal impresa y descarga digital",
    incluye: ["Postal de la serie", "Fondos de pantalla en alta resolución", "Tu nombre en los agradecimientos digitales"],
    limite: null, apartados: 28, entregaEstimada: "Ene 2027", fisico: true,
  },
  {
    id: "fotolibro", nombre: "Fotolibro", precio: 990,
    recompensa: "El fotolibro HUMANS, edición estándar",
    incluye: ["Fotolibro de tapa dura", "Precio especial de preventa", "Tu nombre en los agradecimientos del libro"],
    limite: 300, apartados: 74, entregaEstimada: "Abr 2027", fisico: true,
  },
  {
    id: "coleccionista", nombre: "Edición coleccionista", precio: 1_690,
    recompensa: "Libro numerado y firmado, en caja, con print",
    incluye: ["Fotolibro numerado y firmado", "Caja de coleccionista", "Print 13 × 18 cm de la serie"],
    limite: 150, apartados: 41, entregaEstimada: "Abr 2027", fisico: true, destacado: true,
  },
  {
    id: "print", nombre: "Print firmado", precio: 2_900,
    recompensa: "Print fine art 40 × 50 cm firmado y numerado",
    incluye: ["Print fine art enmarcado", "Firmado y numerado (40 piezas)", "Fotolibro edición estándar"],
    limite: 40, apartados: 19, entregaEstimada: "May 2027", fisico: true,
  },
  {
    id: "sesion", nombre: "Sesión de retrato", precio: 7_500,
    recompensa: "Una sesión de retrato en estudio con el fotógrafo",
    incluye: ["Sesión de retrato en estudio (2 horas)", "10 fotografías editadas", "Edición coleccionista del libro"],
    limite: 6, apartados: 4, entregaEstimada: "A partir de Feb 2027", fisico: true,
  },
];

const METAS = [
  { monto: 60_000, titulo: "Diseño editorial y pruebas de color" },
  { monto: 120_000, titulo: "Primera impresión de 300 ejemplares" },
  { monto: 180_000, titulo: "Presentación del libro" },
  { monto: 250_000, titulo: "Exposición de la serie en galería" },
  { monto: 320_000, titulo: "Sobrecubierta y edición ampliada" },
];

const FABRICACION = [
  { etapa: "Selección de fotografías", fecha: "Ago 2026", estado: "completado", texto: "Edición de la serie y elección de las imágenes del libro." },
  { etapa: "Diseño editorial", fecha: "Nov 2026", estado: "en-curso", texto: "Secuencia, maquetación y textos del libro." },
  { etapa: "Pruebas de color", fecha: "Dic 2026", estado: "pendiente", texto: "Pruebas impresas para cuidar pieles, sombras y neón." },
  { etapa: "Impresión", fecha: "Feb 2027", estado: "pendiente", texto: "Impresión de la tirada según los fondos reunidos." },
  { etapa: "Encuadernación y numeración", fecha: "Mar 2027", estado: "pendiente", texto: "Tapa dura, lomo cosido y numeración a mano." },
  { etapa: "Firma y empaque", fecha: "Abr 2027", estado: "pendiente", texto: "Firma de las ediciones especiales, cajas y prints." },
  { etapa: "Envío", fecha: "Abr 2027", estado: "pendiente", texto: "Envío a cada patrocinador con número de rastreo." },
  { etapa: "Presentación", fecha: "May 2027", estado: "pendiente", texto: "Presentación del libro con la comunidad." },
];

const GALERIA = [
  { src: `${DIR}/serie-1.webp`, alt: "Dos figuras entrelazadas con tenis de color", tipo: "Serie", ancho: "grande" },
  { src: `${DIR}/serie-3.webp`, alt: "Detalle de piel con luz rosa", tipo: "Detalle", ancho: "normal" },
  { src: `${DIR}/libro-abierto.webp`, alt: "Pliego interior del fotolibro", tipo: "Libro", ancho: "normal" },
  { src: `${DIR}/serie-4.webp`, alt: "Pareja con halos de luz en la oscuridad", tipo: "Luz", ancho: "ancho" },
  { src: `${DIR}/serie-6.webp`, alt: "Espalda bajo una lámpara", tipo: "Serie", ancho: "normal" },
  { src: `${DIR}/libro-coleccionista.webp`, alt: "Edición coleccionista en caja", tipo: "Edición", ancho: "normal" },
  { src: `${DIR}/serie-2.webp`, alt: "Cuerpo enmarcado en neón rosa", tipo: "Neón", ancho: "normal" },
  { src: `${DIR}/serie-5.webp`, alt: "Curva de un cuerpo en penumbra", tipo: "Sombra", ancho: "normal" },
];

const ORIGEN = {
  titulo: "La piel también guarda memoria.",
  parrafos: [
    "HUMANS empezó como una pregunta: qué queda de una persona cuando se le quita todo lo que no es ella. Sin ropa, sin escenario, sólo el cuerpo, la luz y el gesto.",
    "La serie trabaja el desnudo como escultura: sombras profundas, color puro y halos de neón que convierten a cada figura en un pequeño altar contemporáneo.",
    "El fotolibro reúne por primera vez la serie completa en papel, en una secuencia pensada para leerse despacio, como se recorre una exposición.",
  ],
  rasgos: [
    { titulo: "Serie", texto: "Desnudo artístico y retrato." },
    { titulo: "Luz", texto: "Neón, sombra y color puro." },
    { titulo: "Mirada", texto: "El cuerpo como escultura, no como objeto." },
  ],
  imagen: `${DIR}/serie-7.webp`,
  imagenAlt: "Detalle de la serie HUMANS con su logotipo",
  imagenPie: "HUMANS — fotografía de la serie",
};

const ARTISTA = {
  nombre: "Eloy Walls",
  rol: "Fotógrafo y director de arte",
  bio: [
    "Eloy Walls trabaja entre la fotografía, el branding y el desarrollo digital. En HUMANS lleva su gusto por la composición editorial al retrato y al desnudo artístico.",
    "Este fotolibro es la primera vez que la serie sale de la pantalla: un objeto para tener, recorrer y conservar.",
  ],
  filosofia: "Fotografiar el cuerpo con el mismo respeto con el que se ilumina una escultura.",
  proyectos: [
    { titulo: "Humans", texto: "La serie completa en la galería", href: "/galeria/humans" },
    { titulo: "Sketch", texto: "Bocetos y dibujo a mano", href: "/galeria/sketch" },
    { titulo: "ARTIFACT", texto: "Art toy en preventa", href: "/grow/proyectos/artifact" },
  ],
};

const PREGUNTAS = [
  { p: "¿Qué estoy comprando al elegir un paquete?", r: "Una recompensa o preventa: el fotolibro, un print o una experiencia que recibirás cuando se produzca. Los paquetes no son acciones ni instrumentos de inversión, y no generan rendimientos." },
  { p: "¿El libro tiene contenido para adultos?", r: "Sí. HUMANS incluye fotografía de desnudo artístico. El libro y algunas recompensas están dirigidos a mayores de 18 años." },
  { p: "¿Cuándo recibo mi recompensa?", r: "Cada paquete muestra una fecha estimada. La impresión puede retrasarse; cualquier cambio se avisará por correo y en la línea de tiempo." },
  { p: "¿Cómo se imprime el libro?", r: "Tras la selección y el diseño editorial se hacen pruebas de color para cuidar pieles y sombras; después vienen la impresión, la encuadernación, la numeración y el empaque." },
  { p: "¿Cómo funciona la sesión de retrato?", r: "Se agenda en estudio con el fotógrafo. El tipo de retrato se acuerda antes por escrito con la persona; la sesión no implica que las fotos se publiquen." },
  { p: "¿Hacen envíos a todo México y al extranjero?", r: "La idea es enviar a todo México; los envíos internacionales se definirán más adelante. El costo y los tiempos se confirmarán antes de cobrar." },
  { p: "¿Puedo cancelar o pedir un reembolso?", r: "Las condiciones de cancelación y reembolso se detallarán en los Términos de Preventa y en la Política de cancelación y reembolso antes de habilitar pagos reales." },
];

const DOCUMENTOS_LEGALES = ["Aviso de Privacidad", "Términos de Preventa", "Política de envío", "Política de cancelación y reembolso"];

const TEXTOS = {
  marca: { nombre: "HUMANS", sup: "LIBRO 01" },
  secciones: { origen: "Origen", pieza: "El libro", campana: "Campaña", recompensas: "Recompensas", galeria: "Galería", proceso: "Proceso", artista: "Fotógrafo", faq: "FAQ" },
  heroLineas: [{ texto: "LA PIEL" }, { texto: "ES UN" }, { texto: "ARCHIVO", acento: true }, { texto: "DE LUZ.", acento: true }],
  botonExplorar: "Ver el libro",
  botonReservar: "Reservar mi ejemplar",
  heroPista: null,
  cinta: "LA PIEL ES UN ARCHIVO DE LUZ — HUMANS — FOTOLIBRO 01 — EDICIÓN LIMITADA — LA PIEL ES UN ARCHIVO DE LUZ —",
  origen: { numero: "02 — La serie" },
  pieza: { numero: "03 — Explora el libro", titulo: { antes: "Hojéalo. ", em: "Míralo de cerca." }, ayuda: "Elige una edición para verla", leyenda: "Ediciones" },
  campana: { titulo: { antes: "Imprime la ", em: "primera", despues: " edición." } },
  recompensas: { titulo: { antes: "Elige tu ", em: "ejemplar." } },
  galeria: { titulo: { antes: "Luz, piel ", em: "y sombra." } },
  proceso: { numero: "08 — De la toma al papel", titulo: { antes: "Así llega a ", em: "tus manos." } },
  comunidad: { numero: "10 — Comunidad", titulo: { antes: "Entra al ", em: "archivo." }, texto: "Recibe avances de impresión, la fecha de presentación y nuevas series antes que nadie." },
  faq: { titulo: { antes: "Antes de ", em: "reservar." } },
  cta: { titulo: { antes: "LA LUZ ", em: "también", despues: " SE COLECCIONA." }, boton: "QUIERO MI EJEMPLAR DE LA PRIMERA EDICIÓN" },
};

export const CAMPANA_HUMANS = {
  id: "humans-fotolibro",
  tema: "humans",
  modelo3d: false,
  ARTIFACT, CAMPANA, VARIANTES, FICHA, PAQUETES, METAS, FABRICACION, GALERIA, ORIGEN, ARTISTA, PREGUNTAS, DOCUMENTOS_LEGALES, TEXTOS,
};

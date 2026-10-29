// Configuración de la landing del Club Privado de Inversionistas (/grow/club).
//
// TODO lo que aparece aquí es FICTICIO y sirve sólo para la demostración:
// valuaciones, series, acciones, dividendos y solicitudes. No son ofertas,
// resultados ni datos de personas reales. Cambiar una cifra aquí actualiza la
// página completa.

export const CLUB = {
  nombre: "Club EW",
  nombreNota: "Nombre provisional",
  etiqueta: "Club privado de inversionistas · Primera versión",
  titulo: "Invierte en ideas que construyen el futuro.",
  subtitulo:
    "Conoce empresas emergentes, explora su evolución y descubre un nuevo ecosistema de participación empresarial privada.",
  contacto: { correo: "club@ew.demo", telefono: "+52 000 000 0000", nota: "Datos de contacto de demostración" },
  aviso:
    "Esta plataforma presenta información empresarial y funcionalidades demostrativas de administración de participaciones privadas. No constituye una oferta pública de valores, una bolsa de valores ni una promesa de rendimientos. Las oportunidades de inversión estarán sujetas a los requisitos legales aplicables.",
};

// Estadísticas del hero (ilustrativas)
export const ESTADISTICAS = [
  { valor: 3, sufijo: "", etiqueta: "Proyectos en presentación" },
  { valor: 3, sufijo: "", etiqueta: "Sectores empresariales" },
  { valor: 24, prefijo: "+", sufijo: "%", etiqueta: "Crecimiento estimado ilustrativo" },
];

// Proyectos. `serie`: valuación ficticia de los últimos 12 meses (MXN).
// `href`: página propia del proyecto, si ya existe.
export const PROYECTOS = [
  {
    id: "gogo",
    nombre: "GoGo Food",
    iniciales: "GF",
    categoria: "FoodTech · Delivery local",
    descripcion: "Plataforma de delivery que conecta restaurantes, repartidores y consumidores en ciudades poco atendidas, empezando por Acámbaro, Gto.",
    etapa: "En desarrollo",
    color: "#10b981",
    icono: "utensilios",
    accionesTotales: 500_000,
    serie: [3.6, 3.7, 3.8, 3.8, 4.0, 4.1, 4.3, 4.4, 4.5, 4.7, 4.8, 5.0].map((m) => m * 1_000_000),
    href: "/grow/proyectos/gogo",
  },
  {
    id: "singularix",
    nombre: "Singularix",
    iniciales: "SX",
    categoria: "Inteligencia artificial",
    descripcion: "Soluciones de inteligencia artificial para automatizar procesos, analizar documentos y apoyar decisiones en empresas medianas.",
    etapa: "Prototipo",
    color: "#8b5cf6",
    icono: "chip",
    accionesTotales: 400_000,
    serie: [5.2, 5.4, 5.9, 6.1, 6.0, 6.6, 7.0, 7.2, 7.5, 7.9, 8.2, 8.5].map((m) => m * 1_000_000),
    href: null,
  },
  {
    id: "saas",
    nombre: "Plataforma SaaS",
    iniciales: "PS",
    categoria: "Software empresarial",
    descripcion: "Software en la nube para administrar operaciones, inventario y clientes de pequeñas y medianas empresas por suscripción.",
    etapa: "Primeros clientes",
    color: "#38bdf8",
    icono: "nube",
    accionesTotales: 500_000,
    serie: [5.5, 5.6, 5.6, 5.8, 6.0, 6.1, 6.2, 6.4, 6.5, 6.7, 6.9, 7.0].map((m) => m * 1_000_000),
    href: null,
  },
];

export const MESES = ["Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct"];

// Cómo funciona
export const PASOS = [
  { icono: "buscar", titulo: "Conoce los proyectos", texto: "Explora las empresas, su etapa y su evolución con información organizada." },
  { icono: "llave", titulo: "Solicita acceso al club privado", texto: "Envía tu solicitud. El acceso no es automático ni público." },
  { icono: "escudo", titulo: "Completa tu identificación y evaluación", texto: "Verificación de identidad y perfil para conocer si cumples los requisitos." },
  { icono: "maletin", titulo: "Consulta las oportunidades privadas", texto: "Ves sólo las rondas privadas para las que seas elegible, con su documentación." },
  { icono: "grafica", titulo: "Administra tus participaciones", texto: "Consulta tus acciones, documentos y reportes desde tu panel privado." },
];

// Modelos de inversión
export const MODELOS = [
  {
    letra: "A",
    titulo: "Club Privado de Inversionistas",
    texto: "Participación accionaria en empresas privadas mediante rondas dirigidas a inversionistas identificados y bajo condiciones legales específicas.",
    estado: "Modelo inicial",
    activo: true,
    puntos: ["Rondas privadas, no públicas", "Inversionistas identificados", "Documentación corporativa de cada participación"],
  },
  {
    letra: "B",
    titulo: "Crowdfunding Autorizado",
    texto: "Acceso a oportunidades de financiamiento colectivo mediante instituciones autorizadas por la CNBV, sujeto a sus requisitos y condiciones.",
    estado: "Desarrollo futuro · No habilitado",
    activo: false,
    puntos: ["A través de una institución autorizada", "Sujeto a sus requisitos", "No disponible en esta versión"],
  },
  {
    letra: "C",
    titulo: "Negociación de Participaciones",
    texto: "Visión de evolución hacia mecanismos regulados que faciliten la transmisión de acciones entre inversionistas.",
    estado: "Visión futura · No habilitado",
    activo: false,
    puntos: ["Requiere un marco regulado", "Transmisiones entre inversionistas", "No disponible en esta versión"],
  },
];

// Dashboard de demostración: participaciones de un usuario ficticio
export const PARTICIPACIONES = [
  { proyecto: "gogo", acciones: 2_500 },
  { proyecto: "singularix", acciones: 1_200 },
  { proyecto: "saas", acciones: 4_000 },
];

// Evolución del portafolio ficticio (MXN) por vista
export const EVOLUCION = {
  mensual: {
    etiquetas: MESES,
    valores: [82_400, 84_100, 85_900, 86_300, 88_800, 90_600, 93_400, 95_200, 97_300, 100_600, 103_200, 106_500],
  },
  trimestral: {
    etiquetas: ["T1 25", "T2 25", "T3 25", "T4 25", "T1 26", "T2 26", "T3 26"],
    valores: [64_000, 69_500, 74_800, 84_100, 88_800, 95_200, 103_200],
  },
  anual: {
    etiquetas: ["2023", "2024", "2025", "2026"],
    valores: [31_000, 52_000, 84_100, 106_500],
  },
};

export const DIVIDENDOS = [
  { proyecto: "saas", fecha: "Mar 2026", monto: 1_200 },
];

export const DOCUMENTOS = [
  { titulo: "Contrato de suscripción de acciones", proyecto: "gogo" },
  { titulo: "Libro de registro de acciones (extracto)", proyecto: "singularix" },
  { titulo: "Estados financieros 2025", proyecto: "saas" },
  { titulo: "Acuerdo de accionistas", proyecto: "gogo" },
];

export const TRANSMISIONES = [
  { folio: "TR-0003", proyecto: "saas", acciones: 500, estado: "En revisión" },
  { folio: "TR-0002", proyecto: "singularix", acciones: 200, estado: "Documentación pendiente" },
  { folio: "TR-0001", proyecto: "gogo", acciones: 300, estado: "Cerrada" },
];

// Transparencia y seguridad
export const PILARES = [
  { icono: "documento", titulo: "Participaciones documentadas", texto: "Cada participación se respalda con su contrato y su registro en el libro de accionistas de la empresa." },
  { icono: "grafica", titulo: "Información financiera organizada", texto: "Reportes periódicos de cada empresa en un mismo formato, fáciles de comparar." },
  { icono: "capas", titulo: "Contratos y documentación corporativa", texto: "Actas, acuerdos y contratos disponibles para los accionistas que corresponda." },
  { icono: "candado", titulo: "Acceso privado", texto: "Sólo personas identificadas y aceptadas en el club ven las oportunidades y sus documentos." },
  { icono: "escudo", titulo: "Protección de información", texto: "Datos personales y financieros tratados con controles de acceso y conforme al aviso de privacidad." },
  { icono: "historial", titulo: "Registro histórico", texto: "Cada operación administrativa (altas, transmisiones, cambios) queda registrada con su fecha." },
];

// Preguntas frecuentes (información general, no asesoría)
export const PREGUNTAS = [
  {
    p: "¿Qué es un club privado de inversionistas?",
    r: "Es un grupo de personas identificadas que conocen y, si son elegibles, participan en rondas privadas de empresas. No es una bolsa de valores ni una institución financiera, y sus oportunidades no se ofrecen al público en general.",
  },
  {
    p: "¿Cómo funciona una inversión en acciones privadas?",
    r: "Una persona aporta capital a una empresa a cambio de acciones, normalmente con un contrato de suscripción y el registro en el libro de accionistas. Su valor depende del desempeño de la empresa, que puede subir, bajar o perderse por completo.",
  },
  {
    p: "¿Qué derechos tiene un accionista?",
    r: "En general, según los estatutos y la ley: votar en asambleas, recibir dividendos cuando la asamblea los decreta, pedir información y, en su caso, el derecho de preferencia en aumentos de capital. Los derechos concretos dependen del tipo de acciones y de los acuerdos firmados.",
  },
  {
    p: "¿Puedo vender mis participaciones?",
    r: "Puede ser posible, pero no hay un mercado donde vender de inmediato. Una venta suele requerir encontrar un comprador y cumplir los estatutos y acuerdos (por ejemplo, derechos de preferencia o autorización del consejo). Hay que considerar que la liquidez es baja.",
  },
  {
    p: "¿Las inversiones tienen rendimientos garantizados?",
    r: "No. Invertir en empresas privadas, sobre todo en etapa temprana, implica riesgos altos, incluida la pérdida total del capital. Ningún dato de esta página es una promesa de rendimientos.",
  },
  {
    p: "¿Pueden participar inversionistas extranjeros?",
    r: "Puede ser posible, sujeto a la legislación mexicana aplicable (incluida la de inversión extranjera), a la identificación de la persona y a las condiciones de cada ronda. Cada caso se revisa por separado.",
  },
  {
    p: "¿Cuál es la diferencia entre una empresa privada y una que cotiza en bolsa?",
    r: "Las acciones de una empresa que cotiza en bolsa se compran y venden en un mercado regulado, con reglas de información pública. Las de una empresa privada no cotizan: su información es más limitada, su venta es más difícil y suelen estar sujetas a acuerdos entre accionistas.",
  },
];

export const PAISES = ["México", "Estados Unidos", "Canadá", "España", "Colombia", "Argentina", "Chile", "Otro"];

export const TIPOS_INTERESADO = [
  "Inversionista individual",
  "Inversionista institucional o family office",
  "Emprendedor que busca inversión",
  "Aliado o proveedor",
  "Otro",
];

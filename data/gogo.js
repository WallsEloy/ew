// Configuración de la landing de GoGo Food (/grow/proyectos/gogo).
//
// Todo lo que es cifra, porcentaje o texto que cambie con el proyecto vive
// aquí. Las cifras son ESCENARIOS ILUSTRATIVOS: no son resultados, valuaciones
// oficiales ni condiciones de una oferta. Para cambiarlas basta con editar
// este archivo; la página se recalcula sola.

export const GOGO = {
  nombre: "GoGo Food",
  etiqueta: "Proyecto empresarial · FoodTech",
  estado: "En desarrollo",
  titulo: "El futuro del delivery comienza en lo local",
  descripcion:
    "GoGo Food es una plataforma de delivery que conecta restaurantes, negocios locales, repartidores y consumidores. Nace para digitalizar el comercio de ciudades que las plataformas nacionales todavía no atienden bien, empezando por Acámbaro, Guanajuato.",
  sector: "FoodTech · Delivery · Marketplace local",
  mercadoInicial: "Acámbaro, Guanajuato, México",
  contacto: {
    correo: "contacto@gogofood.demo",
    telefono: "+52 000 000 0000",
    nota: "Datos de contacto de demostración",
  },
};

// Sección 02 — Resumen ejecutivo
export const RESUMEN = [
  { icono: "utensilios", titulo: "Industria", dato: "FoodTech", texto: "Delivery y marketplace de comida y comercio local, operado con tecnología propia." },
  { icono: "pin", titulo: "Mercado inicial", dato: "Acámbaro, Gto.", texto: "Ciudad piloto para validar la operación antes de replicarla en otras localidades." },
  { icono: "capas", titulo: "Modelo comercial", dato: "Marketplace", texto: "Comisión por pedido, más servicios, publicidad y planes para negocios." },
  { icono: "codigo", titulo: "Estado de desarrollo", dato: "En desarrollo", texto: "Plataforma en construcción. Aún sin operación comercial ni métricas publicadas." },
  { icono: "red", titulo: "Estrategia de crecimiento", dato: "Socios por ciudad", texto: "Expansión con operadores locales y socios que abren nuevas localidades." },
  { icono: "maletin", titulo: "Tipo de oportunidad", dato: "Inversión privada", texto: "Presentación informativa para interesados. No es una oferta pública de valores." },
];

// Sección 03 — Problema y solución
export const PROBLEMAS = [
  "Restaurantes sin infraestructura digital propia.",
  "Dependencia de canales de venta informales (llamadas, mensajes, redes).",
  "Dificultad para coordinar pedidos y repartidores.",
  "Costos y complejidad al implementar soluciones tecnológicas.",
];

export const SOLUCIONES = [
  "Aplicación para consumidores.",
  "Herramientas de gestión para restaurantes.",
  "Integración operativa de repartidores.",
  "Sistema centralizado de pedidos.",
  "Infraestructura replicable en distintas localidades.",
];

// Sección 04 — Ecosistema y recorrido de un pedido
export const ECOSISTEMA = [
  { id: "consumidor", icono: "usuario", titulo: "Consumidores", texto: "Descubren negocios locales, piden y siguen su entrega en tiempo real." },
  { id: "restaurante", icono: "tienda", titulo: "Restaurantes", texto: "Reciben pedidos ordenados, gestionan su menú y su disponibilidad." },
  { id: "repartidor", icono: "moto", titulo: "Repartidores", texto: "Aceptan entregas, siguen la ruta y confirman cada pedido." },
  { id: "admin", icono: "panel", titulo: "Administración", texto: "Supervisa la operación, los pagos, la calidad y el soporte." },
];

export const RECORRIDO_PEDIDO = [
  { de: "consumidor", texto: "El cliente hace su pedido en la app." },
  { de: "admin", texto: "La plataforma valida el pago y lo asigna." },
  { de: "restaurante", texto: "El restaurante acepta y prepara el pedido." },
  { de: "repartidor", texto: "Un repartidor recoge y entrega." },
  { de: "consumidor", texto: "El cliente recibe y califica la experiencia." },
];

// Sección 05 — Fuentes de ingreso. `porcentaje` es un reparto DEMOSTRATIVO
// del ingreso para la gráfica (debe sumar 100).
export const INGRESOS = [
  { icono: "porcentaje", titulo: "Comisiones por pedido", texto: "Un porcentaje de cada pedido gestionado por la plataforma.", porcentaje: 55, color: "#10b981" },
  { icono: "herramienta", titulo: "Servicios para restaurantes", texto: "Herramientas adicionales: menú digital, reportes, promociones.", porcentaje: 15, color: "#8b5cf6" },
  { icono: "megafono", titulo: "Publicidad y posicionamiento", texto: "Espacios destacados y campañas dentro de la app.", porcentaje: 15, color: "#f43f5e" },
  { icono: "tarjeta", titulo: "Planes comerciales", texto: "Posibles planes mensuales para negocios con más volumen.", porcentaje: 10, color: "#f59e0b" },
  { icono: "red", titulo: "Socios operadores", texto: "Participación por la expansión territorial con operadores locales.", porcentaje: 5, color: "#6366f1" },
];

// Sección 06 — Red de ciudades. `x`/`y` son posiciones en el mapa estilizado
// (0–100). Estados: "operativa" | "piloto" | "potencial".
// Ninguna ciudad está operativa todavía: Acámbaro es el piloto en preparación
// y las demás son ejemplos ilustrativos de localidades cercanas.
export const CIUDADES = [
  { nombre: "Acámbaro", estado: "piloto", x: 52, y: 58 },
  { nombre: "Salvatierra", estado: "potencial", x: 36, y: 44 },
  { nombre: "Celaya", estado: "potencial", x: 30, y: 16 },
  { nombre: "Jerécuaro", estado: "potencial", x: 76, y: 44 },
  { nombre: "Tarandacuao", estado: "potencial", x: 70, y: 74 },
  { nombre: "Maravatío", estado: "potencial", x: 58, y: 90 },
  { nombre: "Uriangato", estado: "potencial", x: 14, y: 62 },
];

export const PASOS_EXPANSION = [
  { icono: "pin", titulo: "Ciudad piloto", texto: "Acámbaro como primer mercado para validar la operación." },
  { icono: "usuario", titulo: "Operador por localidad", texto: "Un socio operador establece y mantiene la operación local." },
  { icono: "tienda", titulo: "Incorporación de restaurantes", texto: "Alta, capacitación y acompañamiento de negocios." },
  { icono: "moto", titulo: "Captación de repartidores", texto: "Red local de repartidores con reglas claras." },
  { icono: "megafono", titulo: "Activación comercial", texto: "Lanzamiento con campañas y alianzas en la ciudad." },
  { icono: "grafica", titulo: "Seguimiento operativo", texto: "Indicadores de servicio para decidir la siguiente ciudad." },
];

// Sección 07 — Simulador. Valores iniciales y límites (MXN), todos ficticios.
export const SIMULADOR = {
  moneda: "MXN",
  valuacionPre: { inicial: 5_000_000, min: 500_000, max: 50_000_000, paso: 100_000 },
  aportacion: { inicial: 250_000, min: 10_000, max: 10_000_000, paso: 10_000 },
  capitalTotal: { inicial: 1_000_000, min: 10_000, max: 20_000_000, paso: 50_000 },
};

// Sección 08 — Uso potencial del capital (debe sumar 100)
export const USO_CAPITAL = [
  { rubro: "Desarrollo tecnológico", porcentaje: 30, color: "#10b981" },
  { rubro: "Marketing y adquisición", porcentaje: 30, color: "#8b5cf6" },
  { rubro: "Expansión operativa", porcentaje: 20, color: "#f43f5e" },
  { rubro: "Infraestructura y soporte", porcentaje: 10, color: "#f59e0b" },
  { rubro: "Reserva operativa", porcentaje: 10, color: "#64748b" },
];

// Sección 09 — Roadmap. Sin fechas ni hitos marcados como terminados.
// `estado`: "en-curso" | "pendiente".
export const ROADMAP = [
  { titulo: "Desarrollo tecnológico", texto: "Construcción de la app de consumidores, el panel de restaurantes y la app de repartidores.", estado: "en-curso" },
  { titulo: "Pruebas operativas", texto: "Pruebas controladas del flujo completo de pedidos con negocios y repartidores de prueba.", estado: "pendiente" },
  { titulo: "Validación comercial en la ciudad piloto", texto: "Lanzamiento en Acámbaro para medir la demanda y la operación real.", estado: "pendiente" },
  { titulo: "Optimización de procesos y métricas", texto: "Ajustes con base en los indicadores del piloto: tiempos, costos y satisfacción.", estado: "pendiente" },
  { titulo: "Expansión a nuevas localidades", texto: "Réplica del modelo con socios operadores en otras ciudades.", estado: "pendiente" },
];

// Sección 10 — Documentos (todavía sin publicar)
export const DOCUMENTOS = [
  { icono: "documento", titulo: "Resumen ejecutivo" },
  { icono: "capas", titulo: "Modelo de negocio" },
  { icono: "grafica", titulo: "Proyecciones financieras" },
  { icono: "red", titulo: "Estructura societaria" },
  { icono: "pin", titulo: "Plan de expansión" },
  { icono: "escudo", titulo: "Riesgos y condiciones de participación" },
];

// Sección 11 — Tipos de interés del formulario
export const INTERESES = [
  "Conocer el proyecto",
  "Explorar una posible inversión privada",
  "Ser operador de ciudad",
  "Participar en la expansión",
  "Alianza comercial",
];

export const AVISO_LEGAL =
  "Esta página es una presentación informativa de un proyecto empresarial en etapa de demostración. No constituye una oferta pública de valores, no capta recursos ni promete rendimientos, y no cuenta con autorización de la CNBV. Cualquier operación de inversión requerirá definir antes su estructura jurídica, su documentación y el cumplimiento de la legislación mexicana aplicable.";

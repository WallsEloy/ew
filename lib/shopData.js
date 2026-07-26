/*
 * DATOS DEL SHOP — TODO ES DE EJEMPLO.
 * Precios, ediciones y textos están inventados para poder ver el flujo completo.
 * Cuando exista el catálogo real (Supabase / pasarela de pagos), basta con
 * sustituir CATEGORIAS y `resolverPieza` por la consulta correspondiente.
 */

/*
 * VISTAS DEL CARRUSEL.
 * Hoy son PUESTAS EN ESCENA hechas con CSS sobre la misma imagen de la obra
 * (marco, detalle del papel, muro, pantalla): sirven para ver el formato sin
 * tener todavía las fotos de producto. Cuando existan las fotos reales basta
 * con mandar `post.vistas = [{ id, nombre, pie, imagen }]` y el carrusel las usa
 * en lugar de las escenas.
 */
export const VISTAS = {
  obra: {
    id: "obra",
    nombre: "Obra",
    pie: "La pieza completa, tal como sale del archivo maestro.",
  },
  pantalla: {
    id: "pantalla",
    nombre: "En pantalla",
    pie: "Recorte para escritorio; el paquete incluye también móvil y tablet.",
  },
  enmarcada: {
    id: "enmarcada",
    nombre: "Enmarcada",
    pie: "Marco de madera natural y passepartout de algodón de 4 cm.",
  },
  detalle: {
    id: "detalle",
    nombre: "Detalle del papel",
    pie: "Ampliación al 200%: grano del algodón de 310 g y tinta de pigmento.",
  },
  sala: {
    id: "sala",
    nombre: "En sala",
    pie: "Referencia de escala: formato de 90×120 cm sobre un muro de 2.6 m.",
  },
};

export const CATEGORIAS = [
  {
    id: "wallpaper",
    nombre: "Wallpaper",
    etiqueta: "Digital",
    resumen: "La pieza adaptada a tus pantallas.",
    detalle: [
      "Cortes para móvil, tablet y escritorio",
      "Descarga inmediata en PNG y JPG",
      "Uso personal, sin impresión",
    ],
    precio: 290,
    copias: 500, // pon 0 si quieres que sea edición abierta (sin numerar)
    entrega: "Descarga inmediata",
    vistas: ["obra", "pantalla"],
  },
  {
    id: "digital-impresion",
    nombre: "Digital + instrucciones de impresión",
    etiqueta: "Digital",
    resumen: "El archivo maestro y la guía para imprimirlo tú.",
    detalle: [
      "TIFF 16 bits a 300 dpi + perfil de color",
      "Guía de papeles, tamaños y calibración",
      "Licencia para una impresión de uso personal",
    ],
    precio: 1450,
    copias: 100,
    entrega: "Descarga inmediata · guía en PDF",
    vistas: ["obra", "detalle", "enmarcada"],
  },
  {
    id: "impresion",
    nombre: "Impresión",
    etiqueta: "Físico",
    resumen: "Impresión de estudio, firmada y numerada.",
    detalle: [
      "Giclée sobre algodón 310 g, tintas de pigmento",
      "Formatos de 40×60 a 90×120 cm",
      "Firmada al reverso · envío asegurado incluido",
    ],
    precio: 6900,
    copias: 50,
    entrega: "Producción 7 días · envío 3-5 días",
    vistas: ["obra", "enmarcada", "detalle", "sala"],
  },
  {
    id: "drop",
    nombre: "Drop",
    etiqueta: "Colección",
    resumen: "La pieza completa: obra física, certificado y acceso.",
    detalle: [
      "Impresión enmarcada + certificado de autenticidad NFC",
      "Gemelo digital firmado en cadena",
      "Acceso anticipado al siguiente drop del estudio",
    ],
    precio: 18500,
    copias: 10,
    entrega: "Entrega en mano o mensajería especializada",
    vistas: ["obra", "enmarcada", "sala", "detalle"],
  },
];

/*
 * CERTIFICADOS (acordeones). Texto de ejemplo.
 * `categorias` dice en cuáles va incluido, para poder marcar en la ficha si
 * aplica o no según lo que el comprador tenga seleccionado.
 */
export const CERTIFICADOS = [
  {
    id: "autenticidad",
    nombre: "Certificado de autenticidad",
    resumen: "Documento impreso, foliado y firmado a mano.",
    categorias: ["impresion", "drop"],
    puntos: [
      "Folio único que coincide con el número grabado al reverso de la obra",
      "Firma del artista en tinta y sello seco del estudio",
      "Ficha técnica de la pieza: título, año, técnica, medidas y edición",
      "Se envía dentro del tubo o la caja, en sobre libre de ácido",
    ],
  },
  {
    id: "digital",
    nombre: "Certificado digital · NFC y gemelo en cadena",
    resumen: "El chip del reverso te lleva al registro público de la pieza.",
    categorias: ["drop"],
    puntos: [
      "Etiqueta NFC embebida en el bastidor; se lee con cualquier teléfono",
      "Registro en cadena con el hash de la imagen maestra y la fecha de emisión",
      "Transferible: al revender la pieza se traspasa el registro al nuevo dueño",
      "Verificable siempre desde el sitio del estudio, aunque cambies de país",
    ],
  },
  {
    id: "conservacion",
    nombre: "Certificado de archivo y conservación",
    resumen: "Materiales, permanencia y cómo cuidar la obra.",
    categorias: ["digital-impresion", "impresion", "drop"],
    puntos: [
      "Papel de algodón 310 g, libre de ácido y sin blanqueadores ópticos",
      "Tintas de pigmento con permanencia estimada de 100+ años sin luz directa",
      "Perfil de color y condiciones de impresión utilizadas",
      "Guía de montaje, limpieza y humedad recomendada (45-55%)",
    ],
  },
  {
    id: "licencia",
    nombre: "Licencia de uso y procedencia",
    resumen: "Qué puedes hacer con la pieza y de dónde viene.",
    categorias: ["wallpaper", "digital-impresion", "impresion", "drop"],
    puntos: [
      "Uso personal y no comercial; el derecho de autor sigue siendo del artista",
      "Historial de la pieza: serie, fecha de captura y ediciones ya emitidas",
      "Autorización para exhibirla en espacios privados y compartirla con crédito",
      "Para uso comercial o editorial se emite una licencia aparte",
    ],
  },
];

// Descripciones de ejemplo para la obra; se rotan según la pieza
const DESCRIPCIONES = [
  "Pieza de la serie urbana: una toma directa donde la luz natural hace todo el trabajo y el encuadre solo se aparta del camino.",
  "Estudio de contraste y textura. La imagen se revela despacio: primero el gesto, después el detalle que sostiene la composición.",
  "Registro de un instante que no se repitió. El grano y la sombra quedaron tal como salieron de cámara, con un retoque mínimo.",
  "Composición construida por capas: fondo, materia y figura conviven sin jerarquía para que la mirada elija por dónde entrar.",
];

// Separador de miles sin Intl, para que servidor y cliente pinten exactamente lo mismo
export function formatearPrecio(valor) {
  return `$${String(valor).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} MXN`;
}

// Número de la copia que le toca al comprador. Determinista: misma pieza y misma
// categoría siempre dan la misma copia (nada de Math.random, que rompe la hidratación).
export function copiaAsignada(semilla, categoria) {
  if (!categoria.copias) return 0;
  const base = Math.abs(Number(semilla) || 1);
  return ((base * 7 + categoria.nombre.length) % categoria.copias) + 1;
}

export function descripcionObra(semilla) {
  const base = Math.abs(Number(semilla) || 0);
  return DESCRIPCIONES[base % DESCRIPCIONES.length];
}

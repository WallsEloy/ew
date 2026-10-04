/*
 * Config de los dos módulos de vídeo del Home, editable desde el dashboard
 * (/dashboard/home/videos). Este archivo son los VALORES POR DEFECTO: lo que se
 * ve si Supabase no está configurado o si nunca se ha guardado nada.
 *
 * Cambiar el vídeo NO cambia el efecto: el comportamiento vive en los
 * componentes (VideoModulo reproduce en bucle con sonido y onda; ProcesoScroll
 * recorre el vídeo con el scroll). Aquí sólo viajan rutas y textos.
 */
export const defaultVideosHome = {
  // Módulo de vídeo: se reproduce en bucle, con sonido y onda de audio
  video: {
    src: `/Videos/vi1/${encodeURIComponent("puedes_generar_el_mismo_video (1).mp4")}`,
    // Copia sin comprimir, para poder comparar calidad desde el dashboard
    srcOriginal: `/Videos/vi1/originales/${encodeURIComponent("puedes_generar_el_mismo_video (1).mp4")}`,
    // "comprimida" | "original" — cuál se reproduce en el sitio
    calidad: "comprimida",
    bytes: 442368,
    bytesOriginal: 2585587,
    poster: "/Videos/vi1/poster.webp",
    // Logotipo que corona los textos. Vacío = no se pinta.
    logo: "/SVG/ew_crema.svg",
    antetitulo: "Figura 001",
    titulo: "La pieza sale de la vitrina",
    texto:
      "Diez segundos en bucle. La figura abandona el ciclorama, camina hacia la cámara y alarga la mano. Todo el color de la escena está en el oro.",
    ficha: [
      { etiqueta: "Formato", valor: "1280 × 720 · 10 s en bucle" },
      { etiqueta: "Acabado", valor: "Vinilo mate · luz cenital" },
      { etiqueta: "Paleta", valor: "Negro humo · oro" },
      { etiqueta: "Serie", valor: "Colección HVMANS" },
    ],
  },

  // Módulo de proceso: el vídeo se recorre con el scroll y los textos pasan
  proceso: {
    src: "/Videos/vi1/puedes_generar_el_mismo_video.mp4",
    srcOriginal: "/Videos/vi1/originales/puedes_generar_el_mismo_video.mp4",
    calidad: "comprimida",
    bytes: 524288,
    bytesOriginal: 2636665,
    poster: "/Videos/vi1/poster2.webp",
    logo: "/SVG/ew_crema.svg",
    boton: { texto: "Ver el trabajo de diseño", href: "/diseno" },
    capitulos: [
      {
        titulo: "Se trabaja en el suelo",
        texto:
          "El estudio cabe en un portátil y un ciclorama. Ahí empieza cada pieza, sin más ceremonia.",
      },
      {
        titulo: "La pieza se prueba entera",
        texto:
          "Modelado, luz y textura se ajustan hasta que la figura aguanta un primer plano sin trampas.",
      },
      {
        titulo: "El oro es el único lujo",
        texto:
          "Todo el vestuario es negro mate. El único color que entra en escena son las cadenas y los anillos.",
      },
      {
        titulo: "Y se entrega en movimiento",
        texto:
          "Nada sale de aquí como imagen fija: la pieza se entrega andando, girando o alargando la mano.",
      },
    ],
  },
};

const texto = (v, porDefecto = "") => (typeof v === "string" ? v : porDefecto);
const numero = (v, porDefecto = 0) => (Number.isFinite(v) ? v : porDefecto);
const calidadValida = (v) => (v === "original" ? "original" : "comprimida");

/*
 * Fuente que toca reproducir. Si se pide la original y no hay copia guardada, se
 * cae a la comprimida: mejor la que existe que un vídeo roto.
 */
export function fuenteElegida(bloque = {}) {
  if (bloque.calidad === "original" && bloque.srcOriginal) return bloque.srcOriginal;
  return bloque.src;
}

/*
 * Combina lo guardado con los defaults. Nunca lanza: si una parte viene rota se
 * cae a su valor por defecto, para que el home no se quede en blanco por un
 * documento mal formado.
 */
export function mergeVideosHome(guardado) {
  const d = defaultVideosHome;
  if (!guardado || typeof guardado !== "object") return d;

  const v = guardado.video || {};
  const p = guardado.proceso || {};

  const ficha = Array.isArray(v.ficha)
    ? v.ficha
        .filter((f) => f && typeof f === "object")
        .map((f) => ({ etiqueta: texto(f.etiqueta), valor: texto(f.valor) }))
        .filter((f) => f.etiqueta || f.valor)
    : [];

  const capitulos = Array.isArray(p.capitulos)
    ? p.capitulos
        .filter((c) => c && typeof c === "object")
        .map((c) => ({ titulo: texto(c.titulo), texto: texto(c.texto) }))
        .filter((c) => c.titulo || c.texto)
    : [];

  return {
    video: {
      src: texto(v.src, d.video.src),
      srcOriginal: texto(v.srcOriginal, d.video.srcOriginal),
      calidad: calidadValida(v.calidad),
      bytes: numero(v.bytes, d.video.bytes),
      bytesOriginal: numero(v.bytesOriginal, d.video.bytesOriginal),
      poster: texto(v.poster, d.video.poster),
      // Cadena vacía es una elección válida: significa "sin logotipo"
      logo: typeof v.logo === "string" ? v.logo : d.video.logo,
      antetitulo: texto(v.antetitulo, d.video.antetitulo),
      titulo: texto(v.titulo, d.video.titulo),
      texto: texto(v.texto, d.video.texto),
      ficha: ficha.length ? ficha : d.video.ficha,
    },
    proceso: {
      src: texto(p.src, d.proceso.src),
      srcOriginal: texto(p.srcOriginal, d.proceso.srcOriginal),
      calidad: calidadValida(p.calidad),
      bytes: numero(p.bytes, d.proceso.bytes),
      bytesOriginal: numero(p.bytesOriginal, d.proceso.bytesOriginal),
      poster: texto(p.poster, d.proceso.poster),
      logo: typeof p.logo === "string" ? p.logo : d.proceso.logo,
      boton: {
        texto: texto(p.boton?.texto, d.proceso.boton.texto),
        href: texto(p.boton?.href, d.proceso.boton.href),
      },
      // Al menos uno: sin capítulos el módulo no tendría recorrido
      capitulos: capitulos.length ? capitulos : d.proceso.capitulos,
    },
  };
}

export function makeCapituloVacio() {
  return { titulo: "", texto: "" };
}

export function makeFichaVacia() {
  return { etiqueta: "", valor: "" };
}

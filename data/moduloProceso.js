/*
 * Contenido del módulo de proceso del Home: el vídeo que se recorre con el
 * scroll mientras los textos van pasando.
 *
 * TODO lo editable vive aquí. Los colores están en el bloque de variables de
 * components/ProcesoScroll.module.css.
 *
 * El número de capítulos manda: la sección se hace más alta o más baja sola
 * (cada capítulo ocupa un tramo igual del recorrido). Con tres, el visitante
 * atraviesa la sección en tres pantallas de scroll.
 */
export const moduloProceso = {
  video: "/Videos/vi1/puedes_generar_el_mismo_video.mp4",
  poster: "/Videos/vi1/poster2.webp",

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
};

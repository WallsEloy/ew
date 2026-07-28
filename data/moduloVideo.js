/*
 * Contenido del módulo de vídeo del Home (el que va debajo del carrusel).
 *
 * TODO lo editable vive aquí: el vídeo, el póster y los textos. Los colores
 * están en components/VideoModulo.module.css, en el bloque de variables del
 * principio.
 *
 * El nombre del archivo de vídeo lleva espacios y paréntesis, así que la ruta va
 * codificada; si lo sustituyes por uno con nombre limpio, basta con escribirla
 * tal cual ("/Videos/vi1/mi-video.mp4").
 */
export const moduloVideo = {
  // Rutas dentro de public/. Ojo: public/ no se versiona en este repo.
  video: `/Videos/vi1/${encodeURIComponent("puedes_generar_el_mismo_video (1).mp4")}`,
  poster: "/Videos/vi1/poster.jpg",

  // Texto de la izquierda
  antetitulo: "Figura 001",
  titulo: "La pieza sale de la vitrina",
  texto:
    "Diez segundos en bucle. La figura abandona el ciclorama, camina hacia la cámara y alarga la mano. Todo el color de la escena está en el oro.",

  // Placa de ficha del pie. Añade o quita filas: la placa se reparte sola.
  ficha: [
    { etiqueta: "Formato", valor: "1280 × 720 · 10 s en bucle" },
    { etiqueta: "Acabado", valor: "Vinilo mate · luz cenital" },
    { etiqueta: "Paleta", valor: "Negro humo · oro" },
    { etiqueta: "Serie", valor: "Colección HVMANS" },
  ],
};

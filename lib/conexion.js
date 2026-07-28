/*
 * Ayudas para decidir si merece la pena traerse un vídeo.
 *
 * Se usan en los módulos del home: con línea mala o ahorro de datos activado no
 * se descarga el vídeo y se deja el póster, que ya cuenta la escena. Es la
 * diferencia entre una página que tarda y una que no llega.
 */

// La API Network Information sólo está en navegadores basados en Chromium; si no
// existe, se asume conexión buena y manda el comportamiento normal.
export function conexionLimitada() {
  if (typeof navigator === "undefined") return false;
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c) return false;

  // El visitante ha pedido explícitamente gastar menos datos
  if (c.saveData) return true;

  // 2g o peor: 5 MB de vídeo no van a llegar en un tiempo razonable
  return ["slow-2g", "2g"].includes(c.effectiveType);
}

/*
 * Avisa una vez cuando el elemento se acerca a la pantalla. rootMargin generoso:
 * el vídeo tarda en arrancar, así que conviene pedirlo antes de que se vea, no
 * cuando ya está a la vista.
 */
export function alAcercarse(elemento, callback, margen = "600px") {
  if (!elemento) return () => {};
  if (typeof IntersectionObserver === "undefined") {
    callback();
    return () => {};
  }

  const observador = new IntersectionObserver(
    ([entrada]) => {
      if (!entrada.isIntersecting) return;
      observador.disconnect();
      callback();
    },
    { rootMargin: margen },
  );
  observador.observe(elemento);
  return () => observador.disconnect();
}

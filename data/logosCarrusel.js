/*
 * Logotipos de la tira que desfila en el Home, debajo del módulo de proceso.
 *
 * SON DE REFERENCIA: nombres inventados para ver el módulo funcionando. Cambia
 * cada entrada por la de verdad cuando la tengas.
 *
 * Cada entrada admite dos formas:
 *   { nombre: "ATELIER NORTE" }                  → se pinta el nombre como logotipo
 *   { nombre: "Cliente", src: "/SVG/x.svg" }     → se pinta la imagen, forzada a blanco
 *
 * El nombre es obligatorio en los dos casos: es lo que leen los lectores de
 * pantalla cuando hay imagen.
 *
 * Ojo con el rótulo: mientras los logotipos sean de referencia, no conviene
 * anunciar que son clientes. Cámbialo cuando lo sean.
 */
export const logosCarrusel = {
  rotulo: "Logotipos de referencia",
  logos: [
    { nombre: "ATELIER NORTE" },
    { nombre: "MERIDIANO" },
    { nombre: "CASA VÉRTIGO" },
    { nombre: "NOVA STUDIO" },
    { nombre: "TALLER 09" },
    { nombre: "OBRA PRIMA" },
    { nombre: "ESTUDIO HUMO" },
  ],
};

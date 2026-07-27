/*
 * Petición JSON con errores legibles.
 *
 * El problema que resuelve: cuando el servidor responde con HTML en lugar de
 * JSON (una página de error de Next, un 404 mientras la ruta se recompila en
 * desarrollo, un proxy que se mete de por medio), `res.json()` revienta con
 * «Unexpected token '<' … is not valid JSON», que no le dice nada a nadie.
 *
 * Aquí se lee la respuesta como texto y, si no es JSON, se explica qué pasó.
 */
export async function fetchJson(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    throw new Error(`No se pudo contactar con el servidor: ${err.message}`);
  }

  const texto = await res.text();

  let data = null;
  if (texto) {
    try {
      data = JSON.parse(texto);
    } catch {
      // Respuesta no-JSON: casi siempre una página de error HTML
      throw new Error(
        `El servidor respondió con un error ${res.status} en lugar de datos. ` +
          "Si estás en desarrollo suele ser que la ruta se estaba recompilando; " +
          "vuelve a intentarlo.",
      );
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || `Error ${res.status} al llamar a ${url}`);
  }

  return data ?? {};
}

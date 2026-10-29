// Integraciones de la campaña ARTIFACT, preparadas para conectarse después.
//
// - Comunidad: hoy simula el registro. Al poner COMUNIDAD_CONECTADA en true
//   (y crear la tabla, ver doc/documentos/grow/artifact_landing.md), envía
//   los datos a /api/artifact/comunidad, que los guarda en Supabase.
// - Checkout: hoy es una simulación sin cobro. Para Stripe, `crearCheckout`
//   llamaría a una ruta que cree la sesión y devolvería su URL.

export const COMUNIDAD_CONECTADA = false;
export const CHECKOUT_CONECTADO = false;

export async function registrarColeccionista(datos) {
  if (!COMUNIDAD_CONECTADA) {
    await new Promise((r) => setTimeout(r, 600));
    return { ok: true, simulado: true };
  }
  const respuesta = await fetch("/api/artifact/comunidad", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const json = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(json.error || "No se pudo completar el registro");
  return { ok: true, simulado: false };
}

// Devuelve un folio de simulación. No cobra ni guarda nada.
export async function crearCheckout({ paquete, cantidad, comprador }) {
  if (CHECKOUT_CONECTADO) throw new Error("El checkout real todavía no está configurado");
  await new Promise((r) => setTimeout(r, 900));
  const folio = `SIM-${paquete.id.slice(0, 3).toUpperCase()}-${Date.now().toString(36).slice(-5).toUpperCase()}`;
  return { simulado: true, folio, total: paquete.precio * cantidad, comprador: comprador.correo };
}

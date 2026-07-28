/*
 * Punto de enfoque de las imágenes del carrusel del Home (SOLO servidor).
 * Documento jsonb en site_settings (key = 'carrusel_foco'), como el resto de los
 * ajustes del sitio.
 *
 * Se guarda POR RUTA DE IMAGEN, no por posición ni por id de slide:
 * - El id no sirve: guardar el carrusel borra las filas y las reinserta, así que
 *   los uuid cambian en cada guardado.
 * - La posición tampoco: al reordenar los slides el enfoque se quedaría en el
 *   hueco en vez de seguir a su imagen.
 * El enfoque es una propiedad de la imagen, y así se comporta.
 *
 * El valor es el porcentaje horizontal (0–100) donde está el sujeto. Sólo hace
 * falta el eje X: la franja del carrusel ocupa todo el alto, así que el eje Y no
 * recorta nada.
 */
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabaseServer";

const TABLE = "site_settings";
const KEY = "carrusel_foco";

export const FOCO_POR_DEFECTO = 35;

// Deja el documento en { ruta: número 0–100 }, descartando lo que no encaje.
export function normalizarFocos(valor) {
  if (!valor || typeof valor !== "object") return {};
  const limpio = {};
  for (const [ruta, x] of Object.entries(valor)) {
    const n = Number(x);
    if (typeof ruta === "string" && ruta && Number.isFinite(n)) {
      limpio[ruta] = Math.min(100, Math.max(0, Math.round(n)));
    }
  }
  return limpio;
}

export async function getFocosCarrusel() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { focos: {}, source: "default" };

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("value")
      .eq("key", KEY)
      .maybeSingle();

    if (error) throw error;
    return { focos: normalizarFocos(data?.value), source: data?.value ? "db" : "default" };
  } catch (err) {
    console.error("[focoCarrusel] falló la lectura, usando defaults:", err.message);
    return { focos: {}, source: "default" };
  }
}

export async function saveFocosCarrusel(focos) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado (.env.local)");

  const limpio = normalizarFocos(focos);
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { key: KEY, value: limpio, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    )
    .select("value")
    .single();

  if (error) throw error;
  return normalizarFocos(data.value);
}

export { isSupabaseConfigured };

// Lectura/escritura de la config de Contacto en Supabase (SOLO servidor).
// Se guarda como un único documento jsonb en site_settings (key = 'contacto'),
// igual que la del navbar.
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabaseServer";
import { defaultContactoConfig, mergeContactoConfig } from "../data/contactoConfig";

const TABLE = "site_settings";
const KEY = "contacto";

// Devuelve la config combinada con los defaults. Si Supabase no está
// configurado, o no hay fila, o falla, devuelve los defaults (degradación).
export async function getContactoConfig() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { config: defaultContactoConfig, source: "default" };

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("value")
      .eq("key", KEY)
      .maybeSingle();

    if (error) throw error;
    if (!data || !data.value) {
      return { config: defaultContactoConfig, source: "default" };
    }
    return { config: mergeContactoConfig(data.value), source: "db" };
  } catch (err) {
    console.error("[contactoConfig] falló la lectura, usando defaults:", err.message);
    return { config: defaultContactoConfig, source: "default" };
  }
}

// Guarda (upsert) la config completa bajo la clave 'contacto'.
export async function saveContactoConfig(config) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado (.env.local)");

  const merged = mergeContactoConfig(config);
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { key: KEY, value: merged, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    )
    .select("value")
    .single();

  if (error) throw error;
  return mergeContactoConfig(data.value);
}

export { isSupabaseConfigured };

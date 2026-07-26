// Lectura/escritura de la config del navbar en Supabase (SOLO servidor).
// Se guarda como un único documento jsonb en site_settings (key = 'navbar').
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabaseServer";
import { defaultNavConfig, mergeNavConfig } from "../data/navConfig";

const TABLE = "site_settings";
const KEY = "navbar";

// Devuelve la config combinada con los defaults. Si Supabase no está
// configurado, o no hay fila, o falla, devuelve los defaults (degradación).
export async function getNavConfig() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { config: defaultNavConfig, source: "default" };

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("value")
      .eq("key", KEY)
      .maybeSingle();

    if (error) throw error;
    if (!data || !data.value) {
      return { config: defaultNavConfig, source: "default" };
    }
    return { config: mergeNavConfig(data.value), source: "db" };
  } catch (err) {
    console.error("[navConfig] getNavConfig falló, usando defaults:", err.message);
    return { config: defaultNavConfig, source: "default" };
  }
}

// Guarda (upsert) la config completa bajo la clave 'navbar'.
export async function saveNavConfig(config) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado (.env.local)");

  const merged = mergeNavConfig(config);
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { key: KEY, value: merged, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    )
    .select("value")
    .single();

  if (error) throw error;
  return mergeNavConfig(data.value);
}

export { isSupabaseConfigured };

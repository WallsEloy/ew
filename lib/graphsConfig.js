// Lectura/escritura de la config de grafos ("Área dos") en Supabase (SOLO servidor).
// Documento jsonb en site_settings (key = 'graphs').
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabaseServer";
import { defaultGraphsConfig, mergeGraphsConfig } from "../data/graphsConfig";

const TABLE = "site_settings";
const KEY = "graphs";

export async function getGraphsConfig() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { config: defaultGraphsConfig, source: "default" };

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("value")
      .eq("key", KEY)
      .maybeSingle();

    if (error) throw error;
    if (!data || !data.value) {
      return { config: defaultGraphsConfig, source: "default" };
    }
    return { config: mergeGraphsConfig(data.value), source: "db" };
  } catch (err) {
    console.error("[graphsConfig] getGraphsConfig falló, usando defaults:", err.message);
    return { config: defaultGraphsConfig, source: "default" };
  }
}

export async function saveGraphsConfig(config) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado (.env.local)");

  const merged = mergeGraphsConfig(config);
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { key: KEY, value: merged, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    )
    .select("value")
    .single();

  if (error) throw error;
  return mergeGraphsConfig(data.value);
}

export { isSupabaseConfigured };

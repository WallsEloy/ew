import { getSupabaseAdmin, isSupabaseConfigured } from "./supabaseServer";
import { defaultGrowConfig, mergeGrowConfig } from "../data/growPage";

const TABLE = "site_settings";
const KEY = "grow_page";

export async function getGrowConfig() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { config: defaultGrowConfig, source: "default" };
  try {
    const { data, error } = await supabase.from(TABLE).select("value").eq("key", KEY).maybeSingle();
    if (error) throw error;
    return { config: mergeGrowConfig(data?.value), source: data?.value ? "db" : "default" };
  } catch (error) {
    console.error("[growConfig] lectura fallida, usando defaults:", error.message);
    return { config: defaultGrowConfig, source: "default" };
  }
}

export async function saveGrowConfig(config) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado (.env.local)");
  const merged = mergeGrowConfig(config);
  const { data, error } = await supabase
    .from(TABLE)
    .upsert({ key: KEY, value: merged, updated_at: new Date().toISOString() }, { onConflict: "key" })
    .select("value").single();
  if (error) throw error;
  return mergeGrowConfig(data.value);
}

export { isSupabaseConfigured };

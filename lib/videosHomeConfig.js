// Lectura/escritura de la config de los vídeos del Home en Supabase (SOLO
// servidor). Documento jsonb en site_settings (key = 'videos_home'), igual que
// la del navbar, contacto y grafos.
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabaseServer";
import { defaultVideosHome, mergeVideosHome } from "../data/videosHome";

const TABLE = "site_settings";
const KEY = "videos_home";

export async function getVideosHome() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { config: defaultVideosHome, source: "default" };

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("value")
      .eq("key", KEY)
      .maybeSingle();

    if (error) throw error;
    if (!data || !data.value) {
      return { config: defaultVideosHome, source: "default" };
    }
    return { config: mergeVideosHome(data.value), source: "db" };
  } catch (err) {
    console.error("[videosHome] falló la lectura, usando defaults:", err.message);
    return { config: defaultVideosHome, source: "default" };
  }
}

export async function saveVideosHome(config) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado (.env.local)");

  const merged = mergeVideosHome(config);
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { key: KEY, value: merged, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    )
    .select("value")
    .single();

  if (error) throw error;
  return mergeVideosHome(data.value);
}

export { isSupabaseConfigured };

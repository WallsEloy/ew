// Cliente Supabase SOLO para el servidor (usa la service_role key).
// Nunca importar este archivo desde componentes cliente.
import { createClient } from "@supabase/supabase-js";
import { defaultHomeSlides } from "../data/homeSlides";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// True solo si hay credenciales reales configuradas en .env.local.
export function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_URL &&
      SERVICE_ROLE_KEY &&
      !SUPABASE_URL.includes("your-project") &&
      !SERVICE_ROLE_KEY.includes("your-supabase"),
  );
}

let cachedClient = null;

export function getSupabaseAdmin() {
  if (!isSupabaseConfigured()) return null;
  if (!cachedClient) {
    cachedClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedClient;
}

const TABLE = "home_slides";

// --- Mapeo BD (snake_case) <-> slide (camelCase) -----------------------------

export function rowToSlide(row) {
  return {
    id: row.id,
    position: row.position,
    title: row.title ?? "",
    logoText: row.logo_text ?? "",
    buttonText: row.button_text ?? "",
    image: row.image ?? "",
    rightTitle: row.right_title ?? "",
    rightText: row.right_text ?? "",
    rightColor: row.right_color ?? "#00aff0",
  };
}

export function slideToRow(slide, position) {
  return {
    position,
    title: slide.title ?? "",
    logo_text: slide.logoText ?? "",
    button_text: slide.buttonText ?? "",
    image: slide.image ?? "",
    right_title: slide.rightTitle ?? "",
    right_text: slide.rightText ?? "",
    right_color: slide.rightColor ?? "#00aff0",
    updated_at: new Date().toISOString(),
  };
}

// --- Lecturas / escrituras ---------------------------------------------------

// Devuelve los slides ordenados. Si Supabase no está configurado, o la tabla
// está vacía, o falla, devuelve el seed por defecto (degradación elegante).
export async function getSlides() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { slides: defaultHomeSlides, source: "seed" };

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("position", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) {
      return { slides: defaultHomeSlides, source: "seed" };
    }
    return { slides: data.map(rowToSlide), source: "db" };
  } catch (err) {
    console.error("[supabaseServer] getSlides falló, usando seed:", err.message);
    return { slides: defaultHomeSlides, source: "seed" };
  }
}

// Reemplaza el conjunto completo por el array ordenado recibido:
// borra todo y reinserta con position = índice. Simplifica reordenar/agregar/quitar.
export async function replaceSlides(slides) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado (.env.local)");

  const rows = slides.map((slide, index) => slideToRow(slide, index));

  // Borrar todo (neq a un uuid imposible = borra todas las filas).
  const del = await supabase
    .from(TABLE)
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (del.error) throw del.error;

  if (rows.length === 0) return [];

  const { data, error } = await supabase.from(TABLE).insert(rows).select("*");
  if (error) throw error;
  return data.map(rowToSlide);
}

// Inserta el seed por defecto solo si la tabla está vacía.
export async function seedSlidesIfEmpty() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase no está configurado (.env.local)");

  const { count, error: countError } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true });
  if (countError) throw countError;

  if ((count ?? 0) > 0) return { seeded: false, count };

  const rows = defaultHomeSlides.map((slide, index) => slideToRow(slide, index));
  const { data, error } = await supabase.from(TABLE).insert(rows).select("*");
  if (error) throw error;
  return { seeded: true, count: data.length };
}

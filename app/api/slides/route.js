import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getSlides,
  replaceSlides,
  isSupabaseConfigured,
} from "../../../lib/supabaseServer";

export const dynamic = "force-dynamic";

// GET /api/slides → lista de slides ordenados (con fallback a seed).
export async function GET() {
  try {
    const { slides, source } = await getSlides();
    return NextResponse.json(
      { slides, source, configured: isSupabaseConfigured() },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al leer slides" },
      { status: 500 },
    );
  }
}

// PUT /api/slides → guarda el conjunto completo (upsert + borra los que faltan).
// Body: { slides: [...] }  (array ordenado; position = índice)
export async function PUT(request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            "Supabase no está configurado. Crea .env.local con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const slides = Array.isArray(body?.slides) ? body.slides : null;
    if (!slides) {
      return NextResponse.json(
        { error: "Body inválido: se espera { slides: [...] }" },
        { status: 400 },
      );
    }

    const saved = await replaceSlides(slides);
    revalidatePath("/");
    return NextResponse.json({ slides: saved }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al guardar slides" },
      { status: 500 },
    );
  }
}

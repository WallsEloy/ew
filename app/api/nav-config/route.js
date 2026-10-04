import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getNavConfig, saveNavConfig, isSupabaseConfigured } from "../../../lib/navConfig";

export const dynamic = "force-dynamic";

// GET /api/nav-config → config del navbar (con fallback a defaults).
export async function GET() {
  try {
    const { config, source } = await getNavConfig();
    return NextResponse.json(
      { config, source, configured: isSupabaseConfigured() },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al leer la config del navbar" },
      { status: 500 },
    );
  }
}

// PUT /api/nav-config → guarda la config completa. Body: { config: {...} }
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
    const config = body?.config;
    if (!config || typeof config !== "object") {
      return NextResponse.json(
        { error: "Body inválido: se espera { config: {...} }" },
        { status: 400 },
      );
    }

    const saved = await saveNavConfig(config);
    // El navbar se pinta desde el layout: hay que regenerar todas las páginas
    revalidatePath("/", "layout");
    return NextResponse.json({ config: saved }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al guardar la config del navbar" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getGraphsConfig, saveGraphsConfig, isSupabaseConfigured } from "../../../lib/graphsConfig";

export const dynamic = "force-dynamic";

// GET /api/graphs → config de los grafos ("Área dos") con fallback a defaults.
export async function GET() {
  try {
    const { config, source } = await getGraphsConfig();
    return NextResponse.json(
      { config, source, configured: isSupabaseConfigured() },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al leer la config de grafos" },
      { status: 500 },
    );
  }
}

// PUT /api/graphs → guarda la config. Body: { config: { scenes: [...] } }
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

    const saved = await saveGraphsConfig(config);
    revalidatePath("/");
    return NextResponse.json({ config: saved }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al guardar la config de grafos" },
      { status: 500 },
    );
  }
}

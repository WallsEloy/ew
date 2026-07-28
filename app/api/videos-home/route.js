import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getVideosHome,
  saveVideosHome,
  isSupabaseConfigured,
} from "../../../lib/videosHomeConfig";

export const dynamic = "force-dynamic";

// GET /api/videos-home → config de los dos módulos de vídeo del Home.
export async function GET() {
  try {
    const { config, source } = await getVideosHome();
    return NextResponse.json(
      { config, source, configured: isSupabaseConfigured() },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al leer la config de vídeos" },
      { status: 500 },
    );
  }
}

// PUT /api/videos-home → guarda la config. Body: { config: { video, proceso } }
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

    const guardado = await saveVideosHome(config);
    revalidatePath("/"); // el home se refresca al instante
    return NextResponse.json({ config: guardado }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al guardar la config de vídeos" },
      { status: 500 },
    );
  }
}

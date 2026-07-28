import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getFocosCarrusel,
  saveFocosCarrusel,
  isSupabaseConfigured,
} from "../../../lib/focoCarrusel";

export const dynamic = "force-dynamic";

// GET /api/carrusel-foco → { ruta de imagen: % horizontal del enfoque }
export async function GET() {
  try {
    const { focos, source } = await getFocosCarrusel();
    return NextResponse.json(
      { focos, source, configured: isSupabaseConfigured() },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al leer los enfoques" },
      { status: 500 },
    );
  }
}

// PUT /api/carrusel-foco → guarda el mapa completo. Body: { focos: {...} }
export async function PUT(request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase no está configurado (.env.local)" },
        { status: 503 },
      );
    }

    const body = await request.json();
    if (!body?.focos || typeof body.focos !== "object") {
      return NextResponse.json(
        { error: "Body inválido: se espera { focos: {...} }" },
        { status: 400 },
      );
    }

    const focos = await saveFocosCarrusel(body.focos);
    revalidatePath("/");
    return NextResponse.json({ focos }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al guardar los enfoques" },
      { status: 500 },
    );
  }
}

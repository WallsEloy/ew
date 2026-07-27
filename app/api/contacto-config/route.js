import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getContactoConfig,
  saveContactoConfig,
  isSupabaseConfigured,
} from "../../../lib/contactoConfig";

export const dynamic = "force-dynamic";

// GET /api/contacto-config → config de Contacto (con fallback a defaults).
export async function GET() {
  try {
    const { config, source } = await getContactoConfig();
    return NextResponse.json(
      { config, source, configured: isSupabaseConfigured() },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al leer la config de Contacto" },
      { status: 500 },
    );
  }
}

// PUT /api/contacto-config → guarda la config completa. Body: { config: {...} }
export async function PUT(request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase no está configurado (.env.local)" },
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

    const saved = await saveContactoConfig(config);
    revalidatePath("/contacto");
    return NextResponse.json({ config: saved }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al guardar la config de Contacto" },
      { status: 500 },
    );
  }
}

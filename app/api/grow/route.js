import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getGrowConfig, saveGrowConfig, isSupabaseConfigured } from "../../../lib/growConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  const { config, source } = await getGrowConfig();
  return NextResponse.json({ config, source, configured: isSupabaseConfigured() });
}

export async function PUT(request) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
    const { config } = await request.json();
    if (!config || typeof config !== "object") return NextResponse.json({ error: "Configuración inválida." }, { status: 400 });
    const saved = await saveGrowConfig(config);
    revalidatePath("/grow/opcion-a");
    revalidatePath("/grow/proyectos/[slug]", "page");
    return NextResponse.json({ config: saved });
  } catch (error) {
    return NextResponse.json({ error: error.message || "No se pudo guardar Grow." }, { status: 500 });
  }
}

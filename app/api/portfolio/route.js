import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getCollectionsForEditor,
  updateCollection,
  isSupabaseConfigured,
} from "../../../lib/portfolioServer";

export const dynamic = "force-dynamic";

const SECTIONS = new Set(["diseno", "galeria"]);

// GET /api/portfolio?section=diseno → colecciones editables.
export async function GET(request) {
  try {
    const section = new URL(request.url).searchParams.get("section") || "diseno";
    if (!SECTIONS.has(section)) {
      return NextResponse.json({ error: "Sección inválida" }, { status: 400 });
    }
    const collections = await getCollectionsForEditor(section);
    return NextResponse.json(
      { collections, section, configured: isSupabaseConfigured() },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al leer las colecciones" },
      { status: 500 },
    );
  }
}

// PUT /api/portfolio → actualiza una colección. Body: { id, section, patch }
export async function PUT(request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase no está configurado (.env.local)" },
        { status: 503 },
      );
    }
    const body = await request.json();
    const { id, patch, section } = body || {};
    if (!id || !patch || typeof patch !== "object") {
      return NextResponse.json(
        { error: "Body inválido: se espera { id, patch }" },
        { status: 400 },
      );
    }

    const updated = await updateCollection(id, patch);
    // Refresca la web pública afectada.
    revalidatePath(section === "galeria" ? "/galeria" : "/diseno");
    return NextResponse.json({ collection: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al guardar la colección" },
      { status: 500 },
    );
  }
}

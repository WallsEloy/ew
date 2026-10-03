import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getProjectsForEditor,
  createProject,
  updateProject,
  deleteProject,
  isSupabaseConfigured,
} from "../../../../lib/portfolioServer";

export const dynamic = "force-dynamic";

// La web pública que hay que refrescar tras cada cambio.
function refrescar(section) {
  revalidatePath(section === "galeria" ? "/galeria" : section === "coding" ? "/coding" : "/diseno");
}

function sinSupabase() {
  return NextResponse.json(
    { error: "Supabase no está configurado (.env.local)" },
    { status: 503 },
  );
}

// GET /api/portfolio/projects?collectionId=… → posts de una colección
export async function GET(request) {
  try {
    const collectionId = new URL(request.url).searchParams.get("collectionId");
    if (!collectionId) {
      return NextResponse.json({ error: "Falta collectionId" }, { status: 400 });
    }
    const data = await getProjectsForEditor(collectionId);
    return NextResponse.json(
      { ...data, configured: isSupabaseConfigured() },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al leer los posts" },
      { status: 500 },
    );
  }
}

// POST /api/portfolio/projects → crea un post vacío. Body: { collectionId, section }
export async function POST(request) {
  try {
    if (!isSupabaseConfigured()) return sinSupabase();
    const { collectionId, section } = (await request.json()) || {};
    if (!collectionId) {
      return NextResponse.json({ error: "Falta collectionId" }, { status: 400 });
    }
    const project = await createProject(collectionId);
    refrescar(section);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al crear el post" },
      { status: 500 },
    );
  }
}

// PUT /api/portfolio/projects → actualiza un post. Body: { id, patch, section }
export async function PUT(request) {
  try {
    if (!isSupabaseConfigured()) return sinSupabase();
    const { id, patch, section } = (await request.json()) || {};
    if (!id || !patch || typeof patch !== "object") {
      return NextResponse.json(
        { error: "Body inválido: se espera { id, patch }" },
        { status: 400 },
      );
    }
    const project = await updateProject(id, patch);
    refrescar(section);
    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al guardar el post" },
      { status: 500 },
    );
  }
}

// DELETE /api/portfolio/projects → borra un post. Body: { id, section }
// El archivo del bucket NO se borra: puede estar reutilizado en otra parte.
export async function DELETE(request) {
  try {
    if (!isSupabaseConfigured()) return sinSupabase();
    const { id, section } = (await request.json()) || {};
    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
    await deleteProject(id);
    refrescar(section);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al borrar el post" },
      { status: 500 },
    );
  }
}

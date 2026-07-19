import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]);

// Recorre public/ (raíz + subcarpetas) y junta las rutas web de las imágenes.
function walk(dir, baseUrl, out) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    const url = `${baseUrl}/${entry.name}`;
    if (entry.isDirectory()) {
      walk(full, url, out);
    } else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
      out.push(url);
    }
  }
}

// GET /api/images → lista de rutas de imágenes disponibles en /public.
// Nota: lee el filesystem; funciona en dev. Para producción en Vercel,
// migrar a un manifest committeado o a Supabase Storage.
export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const out = [];
    walk(publicDir, "", out);
    out.sort((a, b) => a.localeCompare(b));
    return NextResponse.json({ images: out }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al listar imágenes", images: [] },
      { status: 500 },
    );
  }
}

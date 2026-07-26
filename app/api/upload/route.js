import { NextResponse } from "next/server";
import sharp from "sharp";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../lib/supabaseServer";

// sharp usa binarios nativos → runtime Node (no Edge). Sin caché.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "portfolio-assets";
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

// Tipos permitidos para el modo RAW (sin conversión): logos e iconos.
const RAW_TYPES = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Nombre de archivo seguro a partir del nombre original (sin extensión).
function slugify(name) {
  return (
    String(name)
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "img"
  );
}

// POST /api/upload  (multipart/form-data: file, [folder], [raw])
// Modo normal: convierte CUALQUIER imagen a .webp (carrusel).
// Modo raw (raw=true|1): guarda el archivo TAL CUAL, preservando formato
// (SVG/PNG…) — pensado para logos e iconos que no deben pasar a WebP.
// Devuelve { url, path } con la URL pública.
export async function POST(request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase no está configurado (.env.local)" },
      { status: 400 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No se recibió ningún archivo" },
        { status: 400 },
      );
    }
    if (typeof file.size === "number" && file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "La imagen supera el máximo de 15 MB" },
        { status: 400 },
      );
    }

    const rawFlag = String(form.get("raw") || "");
    const raw = rawFlag === "true" || rawFlag === "1";
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const supabase = getSupabaseAdmin();

    let objectBuffer;
    let contentType;
    let ext;

    if (raw) {
      // Sin conversión: preserva formato original (nítido para SVG).
      contentType = file.type || "application/octet-stream";
      ext = RAW_TYPES[contentType];
      if (!ext) {
        return NextResponse.json(
          { error: `Formato no permitido para logo/icono: ${contentType}` },
          { status: 415 },
        );
      }
      objectBuffer = inputBuffer;
    } else {
      // Conversión a WebP. .rotate() respeta la orientación EXIF.
      try {
        objectBuffer = await sharp(inputBuffer)
          .rotate()
          .webp({ quality: 82 })
          .toBuffer();
      } catch (convErr) {
        return NextResponse.json(
          { error: "No se pudo procesar la imagen: " + convErr.message },
          { status: 422 },
        );
      }
      contentType = "image/webp";
      ext = "webp";
    }

    const folder = String(form.get("folder") || (raw ? "nav" : "carrusel")).replace(
      /[^a-z0-9/_-]/gi,
      "",
    );
    const objectPath = `${folder}/${Date.now()}-${slugify(file.name || "img")}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, objectBuffer, {
        contentType,
        cacheControl: "31536000",
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    return NextResponse.json(
      { url: data.publicUrl, path: objectPath },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al subir la imagen" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import sharp from "sharp";
import { comprimirVideo } from "../../../lib/comprimirVideo";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../lib/supabaseServer";

// sharp y ffmpeg usan binarios nativos → runtime Node (no Edge). Sin caché.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Comprimir vídeo lleva su tiempo; con el tope por defecto no llegaría.
export const maxDuration = 300;

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "portfolio-assets";
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB para imágenes
const MAX_BYTES_VIDEO = 60 * 1024 * 1024; // 60 MB para vídeo
// Lado máximo de una imagen convertida. Con 2000 px sobra para cualquier hueco
// del sitio incluso en pantallas de doble densidad.
const MAX_LADO = 2000;

// Tipos permitidos para el modo RAW (sin conversión): logos, iconos y vídeo.
const RAW_TYPES = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  // Vídeo de los módulos del home. Van tal cual: sharp no los toca.
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
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
    const esVideo = String(file.type || "").startsWith("video/");
    const tope = esVideo ? MAX_BYTES_VIDEO : MAX_BYTES;
    if (typeof file.size === "number" && file.size > tope) {
      return NextResponse.json(
        {
          error: esVideo
            ? "El vídeo supera el máximo de 60 MB"
            : "La imagen supera el máximo de 15 MB",
        },
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
    let comprimido = null; // datos del antes/después, para informar al panel
    let bufferOriginal = null; // copia sin comprimir, para poder comparar calidad
    let extOriginal = null;

    if (raw) {
      // Sin conversión: preserva formato original (nítido para SVG).
      contentType = file.type || "application/octet-stream";
      ext = RAW_TYPES[contentType];
      if (!ext) {
        return NextResponse.json(
          { error: `Formato no permitido: ${contentType}` },
          { status: 415 },
        );
      }
      objectBuffer = inputBuffer;

      /*
       * El vídeo se comprime siempre al subir: se acota a 960 px de ancho y se
       * recodifica a H.264 con +faststart. Si algo falla, o si el resultado no
       * mejora el original, se sube el original tal cual: más vale un vídeo
       * pesado que una subida rota.
       */
      if (esVideo) {
        try {
          // El vídeo que se recorre con el scroll necesita fotogramas clave densos
          const paraRecorrer = ["true", "1"].includes(
            String(form.get("recorrible") || ""),
          );
          const resultado = await comprimirVideo(inputBuffer, { paraRecorrer });
          if (resultado) {
            // El original se guarda aparte: el dashboard permite alternar entre
            // las dos versiones para comparar calidad.
            bufferOriginal = inputBuffer;
            extOriginal = RAW_TYPES[file.type] || "mp4";
            objectBuffer = resultado.buffer;
            contentType = "video/mp4";
            ext = "mp4";
            comprimido = {
              bytesAntes: resultado.bytesAntes,
              bytesDespues: resultado.bytesDespues,
              ahorro: Math.round(
                100 - (100 * resultado.bytesDespues) / resultado.bytesAntes,
              ),
            };
          }
        } catch (err) {
          console.error("[upload] no se pudo comprimir el vídeo:", err.message);
        }
      }
    } else {
      /*
       * Conversión a WebP + tope de tamaño. El redimensionado es la mitad del
       * ahorro: las imágenes del carrusel llegaban a 1395 × 6690 px para pintarse
       * a 198 × 950, siete veces más grandes de lo necesario (649 KB → 69 KB al
       * acotarlas). `inside` respeta la proporción y `withoutEnlargement` nunca
       * agranda una imagen pequeña.
       * .rotate() respeta la orientación EXIF.
       */
      try {
        objectBuffer = await sharp(inputBuffer)
          .rotate()
          .resize({
            width: MAX_LADO,
            height: MAX_LADO,
            fit: "inside",
            withoutEnlargement: true,
          })
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

    // Copia sin comprimir junto a la buena, con sufijo -original
    let urlOriginal = null;
    if (bufferOriginal) {
      const rutaOriginal = objectPath.replace(/\.[^.]+$/, `-original.${extOriginal}`);
      const { error: errOriginal } = await supabase.storage
        .from(BUCKET)
        .upload(rutaOriginal, bufferOriginal, {
          contentType: file.type || "video/mp4",
          cacheControl: "31536000",
          upsert: false,
        });
      if (errOriginal) {
        // Que falle la copia no debe tumbar la subida buena
        console.error("[upload] no se pudo guardar el original:", errOriginal.message);
      } else {
        urlOriginal = supabase.storage.from(BUCKET).getPublicUrl(rutaOriginal).data.publicUrl;
      }
    }

    return NextResponse.json(
      { url: data.publicUrl, path: objectPath, comprimido, urlOriginal },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al subir la imagen" },
      { status: 500 },
    );
  }
}

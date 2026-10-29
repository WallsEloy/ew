import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseServer";

// Registro de la comunidad de coleccionistas de las campañas (ARTIFACT,
// HUMANS…).
// Lo usa lib/artifactCampana.js sólo cuando COMUNIDAD_CONECTADA es true.
// Requiere la tabla `artifact_comunidad` (SQL en
// doc/documentos/grow/artifact_landing.md).
const INTERESES = ["avances", "ediciones", "eventos"];

export async function POST(request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabase no está configurado" }, { status: 503 });

  let datos;
  try {
    datos = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  const nombre = String(datos?.nombre || "").trim().slice(0, 120);
  const correo = String(datos?.correo || "").trim().toLowerCase().slice(0, 200);
  const campana = String(datos?.campana || "artifact").trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60) || "artifact";
  const intereses = Array.isArray(datos?.intereses) ? datos.intereses.filter((i) => INTERESES.includes(i)) : [];
  if (nombre.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
    return NextResponse.json({ error: "Nombre o correo inválidos" }, { status: 400 });
  }
  if (datos?.consentimiento !== true) {
    return NextResponse.json({ error: "Falta el consentimiento" }, { status: 400 });
  }

  // upsert por campaña y correo: registrarse dos veces sólo actualiza los
  // intereses; el mismo correo puede seguir varias campañas
  const { error } = await supabase
    .from("artifact_comunidad")
    .upsert({ campana, nombre, correo, intereses, consentimiento: true }, { onConflict: "campana,correo" });
  if (error) {
    console.error("[artifact/comunidad]", error.message);
    return NextResponse.json({ error: "No se pudo guardar el registro" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

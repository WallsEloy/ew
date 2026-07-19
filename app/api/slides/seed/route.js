import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  seedSlidesIfEmpty,
  isSupabaseConfigured,
} from "../../../../lib/supabaseServer";

export const dynamic = "force-dynamic";

// POST /api/slides/seed → inserta los slides por defecto SOLO si la tabla está vacía.
export async function POST() {
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

    const result = await seedSlidesIfEmpty();
    revalidatePath("/");
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al sembrar slides" },
      { status: 500 },
    );
  }
}

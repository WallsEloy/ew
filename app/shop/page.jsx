import Link from "next/link";

import { profiles } from "../../lib/galeriaData";
import { descripcionObra } from "../../lib/shopData";
import ShopPiece from "./ShopPiece";
import Storefront from "./Storefront";
import styles from "./page.module.css";

export const metadata = {
  title: "Shop",
  description:
    "Adquiere las piezas del estudio en wallpaper, archivo digital, impresión firmada o drop de colección.",
};

/*
 * Resuelve la pieza a partir de la URL.
 * 1) Intenta encontrarla en el catálogo local (galería + id).
 * 2) Si no está (por ejemplo galerías que vienen de Supabase), usa la imagen y
 *    el título que mandó la tarjeta como respaldo.
 */
function resolverPieza(searchParams = {}) {
  const { galeria = "", pieza = "", img = "", titulo = "", ref = "" } = searchParams;

  const perfil = profiles.find(
    (p) => p.name?.toLowerCase() === String(galeria).toLowerCase(),
  );
  const post = perfil?.posts?.find((p) => String(p.id) === String(pieza));

  const indice = post ? Number(post.id) : Number(pieza) || 0;
  const referencia = ref || `EW-${String(indice + 1).padStart(3, "0")}`;
  const caption = post?.caption || "";

  return {
    referencia,
    galeria: perfil?.name || galeria || "Estudio",
    titulo:
      (caption ? caption.split("#")[0].trim() : "") ||
      titulo ||
      `Pieza ${referencia}`,
    imagen: post?.image || img || "",
    descripcion: descripcionObra(indice),
    semilla: indice,
    encontrada: Boolean(post),
  };
}

export default function ShopPage({ searchParams }) {
  const pieza = resolverPieza(searchParams);

  if (!pieza.imagen) {
    return (
      <div className={styles.page} style={{ paddingTop: '0' }}>
        <Storefront />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <ShopPiece pieza={pieza} />
    </div>
  );
}

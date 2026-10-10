import Link from "next/link";
import { SECCIONES_ARTICULOS, getArticulos } from "../../lib/articulos";
import styles from "./articulos.module.css";

// Página de artículos de una sección (Grow o Diseño): tarjetas que llevan a
// cada artículo. Cada sección lista solo los suyos.
export default function ListaArticulos({ seccion }) {
  const { nombre, ruta } = SECCIONES_ARTICULOS[seccion];
  const articulos = getArticulos(seccion);

  return (
    <main className={styles.page}>
      <div className={styles.contenido}>
        <p className={styles.eyebrow}>{nombre}</p>
        <h1 className={styles.tituloIndice}>Artículos</h1>

        {articulos.length ? (
          <ul className={styles.lista}>
            {articulos.map((articulo) => (
              <li key={articulo.slug}>
                <Link href={`${ruta}/${articulo.slug}`} className={styles.tarjeta}>
                  <span className={styles.categoria}>{articulo.categoria}</span>
                  <h2>{articulo.titulo}</h2>
                  <p>{articulo.bajada}</p>
                  <span className={styles.leer}>Leer artículo · {articulo.lectura}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.vacio}>Muy pronto publicaremos los primeros artículos.</p>
        )}
      </div>
    </main>
  );
}

import Link from "next/link";
import { SECCIONES_ARTICULOS } from "../../lib/articulos";
import styles from "./articulos.module.css";

// Convierte **texto** en negritas
function rico(texto) {
  return texto.split(/\*\*(.+?)\*\*/g).map((parte, i) => (i % 2 ? <strong key={i}>{parte}</strong> : parte));
}

const fechaLarga = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

// Página de lectura de un artículo, con enlace de regreso a su sección
export default function Articulo({ articulo }) {
  const { ruta } = SECCIONES_ARTICULOS[articulo.seccion];

  return (
    <main className={styles.page}>
      <article className={styles.articulo}>
        <Link href={ruta} className={styles.volver}>
          ← Artículos
        </Link>

        <header className={styles.cabecera}>
          <span className={styles.categoria}>{articulo.categoria}</span>
          <h1 className={styles.titulo}>{articulo.titulo}</h1>
          <p className={styles.bajada}>{articulo.bajada}</p>
          <p className={styles.meta}>
            <time dateTime={articulo.fecha}>{fechaLarga(articulo.fecha)}</time> · {articulo.lectura} de lectura
          </p>
        </header>

        <div className={styles.cuerpo}>
          {articulo.cuerpo.map((bloque, i) => {
            if (bloque.h2) return <h2 key={i}>{bloque.h2}</h2>;
            if (bloque.lista)
              return (
                <ul key={i}>
                  {bloque.lista.map((item, j) => (
                    <li key={j}>{rico(item)}</li>
                  ))}
                </ul>
              );
            return <p key={i}>{rico(bloque.p)}</p>;
          })}
        </div>
      </article>
    </main>
  );
}

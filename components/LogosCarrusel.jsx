import { logosCarrusel } from "../data/logosCarrusel";
import styles from "./LogosCarrusel.module.css";

/*
 * Tira de logotipos que desfila sin fin, sobre negro y en blanco.
 *
 * El bucle es de CSS puro (sin JavaScript, ni estado, ni observadores): la lista
 * se pinta DOS veces seguidas y la pista se desplaza un 50%. Al llegar, la
 * segunda copia está exactamente donde estaba la primera, así que el salto de
 * vuelta al inicio no se ve.
 *
 * La copia duplicada va oculta a los lectores de pantalla para no leer la lista
 * dos veces. El contenido se edita en data/logosCarrusel.js.
 */
function Logo({ logo }) {
  if (logo.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img loading="lazy" decoding="async" src={logo.src} alt={logo.nombre} className={styles.imagen} />
    );
  }
  return <span className={styles.palabra}>{logo.nombre}</span>;
}

export default function LogosCarrusel() {
  const { logos, rotulo } = logosCarrusel;
  if (!logos?.length) return null;

  return (
    <section className={styles.tira} aria-label={rotulo}>
      <div className={styles.pista}>
        <ul className={styles.grupo}>
          {logos.map((logo) => (
            <li key={logo.nombre} className={styles.item}>
              <Logo logo={logo} />
            </li>
          ))}
        </ul>

        {/* Copia para que el bucle no tenga costura */}
        <ul className={styles.grupo} aria-hidden="true">
          {logos.map((logo) => (
            <li key={`copia-${logo.nombre}`} className={styles.item}>
              <Logo logo={logo} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

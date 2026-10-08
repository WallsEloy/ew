import styles from "./HeroSketch.module.css";

/*
 * Hero de la galería Sketch, montado por capas sobre la misma escena de
 * 1400 × 890 (las posiciones salen del montaje de referencia):
 *   A — la mano y el cuerpo, al fondo
 *   B — la pluma, que flota balanceándose 20° a la izquierda y 30° a la derecha
 *   C — los dedos recortados, encima de la pluma
 * Así la pluma pasa por delante de la palma y por detrás de los dedos.
 */
export default function HeroSketch({ name = "Sketch" }) {
  return (
    <div className={styles.hero} role="img" aria-label={`Portada de ${name}: una pluma digital que flota sobre una mano abierta`}>
      <div className={styles.escena}>
        <img src="/sketch/img/a.webp" alt="" className={styles.capaA} width={1400} height={890} decoding="async" />
        <img src="/sketch/img/b.webp" alt="" className={styles.capaB} width={742} height={137} decoding="async" />
        <img src="/sketch/img/c.webp" alt="" className={styles.capaC} width={372} height={239} decoding="async" />
      </div>
    </div>
  );
}

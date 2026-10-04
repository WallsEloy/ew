import styles from "./Highlights.module.css";

export default function Highlights({ highlights }) {
  if (!highlights || highlights.length === 0) return null;

  return (
    // Contenedor desplazable (scroll horizontal) de Historias Destacadas
    <div className={styles.highlightsContainer}>
      {highlights.map((item) => (
        // Elemento individual de Historia (anillo + título)
        <div key={item.id} className={styles.highlightItem}>
          
          {/* Anillo Neutral/Gris alrededor de la foto de la historia */}
          <div className={styles.highlightRing}>
            {/* Imagen recortada en círculo */}
            <img loading="lazy" decoding="async"
              src={item.image}
              alt={item.title}
              className={styles.highlightImage}
            />
          </div>

          {/* Nombre/Título de la Historia Destacada */}
          <span className={styles.highlightTitle}>{item.title}</span>
        </div>
      ))}
    </div>
  );
}

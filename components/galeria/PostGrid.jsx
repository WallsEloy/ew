import styles from "./PostGrid.module.css";

export default function PostGrid({ posts, onClick }) {
  return (
    // Contenedor principal de Layout en formato Grid (Cuadrícula) 
    <div className={styles.gridContainer}>
      {posts.map((post, index) => (
        // Cada bloque/publicación dentro de la cuadrícula
        <div
          key={post.id}
          /* Al hacer click en una foto del grid, se abre la vista completa (FeedModal) de ese post específico */
          onClick={() => onClick(index)}
          className={`${styles.postItem} ${post.isHorizontal ? styles.postHorizontal : ""}`}
        >
          {/* Imagen que sirve como miniatura (thumbnail) de la publicación */}
          {/* Las primeras filas se ven al abrir; el resto se pide al acercarse */}
          <img
            src={post.image}
            alt={post.title || post.caption || ""}
            className={styles.postImage}
            loading={index < 6 ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}

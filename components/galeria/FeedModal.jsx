"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import styles from "./FeedModal.module.css";

// Sub-componente para manejar el estado individual de cada post (Me gusta)
function FeedPost({ post, delay, index }) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={styles.postWrapper}
    >
      {/* 1. Imagen del Post */}
      <img
        src={post.image}
        alt={post.caption || `Publicación ${index + 1}`}
        className={styles.postImg}
        onDoubleClick={toggleLike}
      />

      {/* 2. Contenido Inferior (Interacciones) */}
      <div className={styles.postContent}>
        
        {/* Barra de Acciones */}
        <div className={styles.actionsBar}>
          <button type="button" onClick={toggleLike} className={styles.actionBtn}>
            {liked ? "❤️" : "🤍"}
          </button>
          <button type="button" className={styles.actionBtn}>💬</button>
          <button type="button" className={styles.actionBtn}>✈️</button>
        </div>

        {/* Contador de Likes */}
        <div className={styles.likesText}>
          {likesCount} Me gusta
        </div>

        {/* Título / Pie de foto (Caption) */}
        {post.caption && (
          <div className={styles.caption}>
            <span className={styles.username}>Creador</span>
            {post.caption}
          </div>
        )}

        {/* Comentarios */}
        {post.comments && post.comments.length > 0 && (
          <div className={styles.commentsArea}>
            {post.comments.map((comment) => (
              <div key={comment.id} className={styles.commentItem}>
                <span className={styles.commentUser}>{comment.user}</span>
                <span className={styles.commentText}>{comment.text}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </motion.div>
  );
}

export default function FeedModal({ posts, startIndex, onClose }) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(startIndex);

  const scrollToPost = (index, behavior = "smooth") => {
    const safeIndex = Math.max(0, Math.min(index, posts.length - 1));
    const target = containerRef.current?.children[safeIndex];
    const isDesktop = window.matchMedia("(min-width: 769px)").matches;

    if (target) {
      target.scrollIntoView({
        behavior,
        block: isDesktop ? "center" : "start",
        inline: isDesktop ? "center" : "nearest",
      });
      setActiveIndex(safeIndex);
    }
  };

  useEffect(() => {
    scrollToPost(startIndex, "auto");
  }, [startIndex]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") scrollToPost(activeIndex + 1);
      if (event.key === "ArrowLeft") scrollToPost(activeIndex - 1);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, onClose]);

  const handleDesktopWheel = (event) => {
    if (!window.matchMedia("(min-width: 769px)").matches) return;

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      containerRef.current?.scrollBy({ left: event.deltaY, behavior: "auto" });
    }
  };

  const handleScroll = (event) => {
    if (!window.matchMedia("(min-width: 769px)").matches) return;

    const containerCenter =
      event.currentTarget.scrollLeft + event.currentTarget.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    Array.from(event.currentTarget.children).forEach((post, index) => {
      const postCenter = post.offsetLeft + post.clientWidth / 2;
      const distance = Math.abs(containerCenter - postCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  };

  // Manejador del gesto de arrastrar (swipe)
  const handlePanEnd = (event, info) => {
    if (window.matchMedia("(min-width: 769px)").matches) return;
    // Math.abs lo hace funcionar tanto hacia la DERECHA como hacia la IZQUIERDA. 
    // Cambiamos al eje X para que el modal se cierre con deslizamientos laterales.
    if (Math.abs(info.velocity.x) > 100 || Math.abs(info.offset.x) > 50) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.modalOverlay}
        onPanEnd={handlePanEnd} // Detecta el final del gesto de toque/arrastre
      >
        <button type="button" onClick={onClose} className={styles.closeButton}>
          Cerrar
        </button>

        <button
          type="button"
          className={`${styles.navButton} ${styles.navPrevious}`}
          onClick={() => scrollToPost(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Ver publicación anterior"
        >
          ‹
        </button>

        <div
          ref={containerRef}
          className={styles.postsContainer}
          onWheel={handleDesktopWheel}
          onScroll={handleScroll}
        >
          {posts.map((post, i) => (
            <FeedPost key={post.id} post={post} index={i} delay={i * 0.05} />
          ))}
        </div>

        <button
          type="button"
          className={`${styles.navButton} ${styles.navNext}`}
          onClick={() => scrollToPost(activeIndex + 1)}
          disabled={activeIndex === posts.length - 1}
          aria-label="Ver publicación siguiente"
        >
          ›
        </button>

        <div className={styles.counter} aria-live="polite">
          {activeIndex + 1} / {posts.length}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

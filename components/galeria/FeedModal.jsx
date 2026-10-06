"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { resolveLogoReverso } from "../../lib/logosReverso";
import styles from "./FeedModal.module.css";

function HeartIcon({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4.2-1L3 21l1.5-4.4A8.6 8.6 0 1 1 21 11.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m22 2-7.2 20-4.1-8.7L2 9.2 22 2Zm-11.3 11.3L22 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/*
 * METADATOS DE EJEMPLO (reverso de la tarjeta).
 * Sirven para dos cosas: posicionamiento/SEO (título, descripción, palabras clave,
 * licencia) e información técnica de la pieza (ficha estilo museo/estudio).
 * Cuando el dashboard alimente los posts, basta con enviar `post.meta` con estas
 * mismas llaves; si no viene, se muestran los valores de ejemplo de abajo.
 */
const META_EJEMPLO = [
  { label: "Colección", key: "coleccion", value: "Serie urbana · Vol. 03" },
  { label: "Año", key: "anio", value: "2025" },
  { label: "Ubicación", key: "ubicacion", value: "Ciudad de México, MX" },
  { label: "Técnica", key: "tecnica", value: "Fotografía digital · Luz natural" },
  { label: "Equipo", key: "equipo", value: "Nikon D750 · 50 mm f/1.8" },
  { label: "Exposición", key: "exposicion", value: "f/2.8 · 1/250 s · ISO 400" },
  { label: "Formato", key: "formato", value: "3000 × 4000 px · sRGB" },
  { label: "Licencia", key: "licencia", value: "© Eloy Walls — uso con permiso" },
];

/*
 * LÍMITES DE TEXTO.
 * El reverso NO tiene scroll: todo tiene que caber. Estos topes evitan que un
 * texto largo desborde la tarjeta; lo que sobra se corta con puntos suspensivos.
 */
const LIMITES = {
  titulo: 46,
  valor: 38,
  descripcion: 165,
  etiquetas: 6,
};

// Corta a `maximo` caracteres sin partir la tarjeta
function recortar(texto, maximo) {
  const limpio = String(texto ?? "").trim();
  if (limpio.length <= maximo) return limpio;
  return `${limpio.slice(0, maximo - 1).trimEnd()}…`;
}

// Saca los hashtags del caption y los reutiliza como palabras clave (útil para SEO)
function extraerEtiquetas(caption) {
  if (!caption) return [];
  return (caption.match(/#[\wÁÉÍÓÚáéíóúÑñ-]+/g) || []).map((tag) => tag.slice(1));
}

/*
 * HOLOGRAMA (esquina inferior derecha del reverso).
 * De momento es una REFERENCIA hecha con CSS: anillos girando, núcleo con
 * iridiscencia y líneas de barrido. La idea es sustituirlo por la animación de
 * After Effects: basta con mandar `post.holograma` con la ruta del video
 * (webm con alfa o mp4) y este componente lo pinta en lugar del placeholder.
 * Es decorativo: no recibe clics ni lo lee el lector de pantalla.
 */
function Holograma({ src, activo }) {
  return (
    <div
      className={`${styles.holograma} ${activo ? styles.hologramaActivo : ""}`}
      aria-hidden="true"
    >
      {src ? (
        <video
          className={styles.hologramaMedia}
          src={src}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <>
          <span className={styles.hologramaHalo} />
          <span className={styles.hologramaAnillo} />
          <span className={styles.hologramaAnilloInterno} />
          <span className={styles.hologramaNucleo} />
          <span className={styles.hologramaBarrido} />
        </>
      )}
    </div>
  );
}

// Vista limpia (galería de Fotografía): solo la foto completa, ajustada a su
// propio tamaño, sin textos, botones ni reverso.
function FotoSola({ post, index, delay }) {
  return (
    // Solo aparece con opacidad: si además subiera, el scroll inicial calcularía
    // la posición desplazada y la barra del sitio taparía el borde de arriba.
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className={styles.fotoSola}
    >
      <img
        src={post.image}
        alt={post.caption || `Fotografía ${index + 1}`}
        className={styles.fotoSolaImg}
      />
    </motion.div>
  );
}

// Sub-componente para manejar el estado individual de cada post (Me gusta)
function FeedPost({
  post,
  delay,
  index,
  projectHref,
  allowImageScroll,
  galleryName,
  allowPurchase,
  allowFlip,
}) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isFlipped, setIsFlipped] = useState(false);
  const [fillImageHeight, setFillImageHeight] = useState(false);
  const imageViewportRef = useRef(null);
  const postTitle = (post.caption || `Publicación ${index + 1}`)
    .split("#")[0]
    .trim();

  /*
   * Ficha técnica del reverso.
   * Si la pieza trae ficha propia (desde el dashboard) se muestran SOLO los
   * campos que tienen contenido; si no trae nada, se ven los de ejemplo. Así
   * llenar un campo no deja los otros siete como renglones vacíos.
   */
  const tieneFichaPropia = Object.values(post.meta || {}).some(
    (valor) => typeof valor === "string" && valor.trim(),
  );
  const metaRows = META_EJEMPLO.map((row) => ({
    ...row,
    value: recortar(
      tieneFichaPropia ? post.meta?.[row.key] ?? "" : row.value,
      LIMITES.valor,
    ),
  })).filter((row) => row.value);
  const etiquetas = (post.meta?.etiquetas || extraerEtiquetas(post.caption)).slice(
    0,
    LIMITES.etiquetas,
  );
  const referencia =
    post.meta?.referencia || `EW-${String(index + 1).padStart(3, "0")}`;

  /*
   * Enlace al shop. Mandamos lo mínimo para que la tienda pueda pintar la pieza
   * aunque no la encuentre en el catálogo local (galerías que vienen de Supabase):
   * galería + id para buscarla, e imagen/título como respaldo.
   */
  const shopHref = `/shop?${new URLSearchParams({
    galeria: galleryName || "",
    pieza: String(post.id ?? index),
    ref: referencia,
    titulo: postTitle,
    img: post.image || "",
  }).toString()}`;

  const toggleLike = (event) => {
    event?.stopPropagation();
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const centerImageScroll = () => {
    const viewport = imageViewportRef.current;
    if (!viewport) return;

    viewport.scrollTo({
      left: Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2),
      top: Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2),
      behavior: "instant",
    });
  };

  useEffect(() => {
    if (!allowImageScroll) return undefined;
    const timer = window.setTimeout(centerImageScroll, 160);
    return () => window.clearTimeout(timer);
  }, [allowImageScroll, fillImageHeight, post.image]);

  const handleScrollableImageLoad = (event) => {
    const image = event.currentTarget;
    const viewport = image.parentElement;
    if (!viewport || !image.naturalHeight) return;

    const imageRatio = image.naturalWidth / image.naturalHeight;
    const viewportRatio = viewport.clientWidth / viewport.clientHeight;
    setFillImageHeight(imageRatio > viewportRatio);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        centerImageScroll();
      });
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${styles.postWrapper} ${
        allowImageScroll ? styles.galleryPostWrapper : ""
      } ${allowFlip ? "" : styles.staticPostWrapper}`}
      onClick={
        allowFlip ? () => setIsFlipped((current) => !current) : undefined
      }
    >
      <div className={`${styles.cardInner} ${isFlipped ? styles.cardFlipped : ""}`}>
        <div
          className={`${styles.cardFace} ${styles.cardFront} ${
            allowImageScroll ? styles.galleryCardFront : ""
          }`}
          aria-hidden={isFlipped}
        >
          {/* 1. Imagen del Post */}
          {allowImageScroll ? (
            <div ref={imageViewportRef} className={styles.imageViewport}>
              <img
                src={post.image}
                alt={post.caption || `Publicación ${index + 1}`}
                className={`${styles.postImg} ${
                  fillImageHeight ? styles.postImgFillHeight : ""
                }`}
                onLoad={handleScrollableImageLoad}
              />
            </div>
          ) : (
            <img
              src={post.image}
              alt={post.caption || `Publicación ${index + 1}`}
              className={styles.postImg}
            />
          )}

          {/* 2. Contenido Inferior (Interacciones) */}
          <div className={styles.postContent}>

            {/* El mismo logo que corona el reverso, arriba a la derecha del
                panel de texto: así la cara de enfrente ya lleva la marca.
                Sólo en galería, igual que el título y el EW del panel. */}
            {allowImageScroll && (
              <img
                src={resolveLogoReverso(post.logoReverso)}
                alt=""
                className={styles.frontPanelLogo}
              />
            )}

            {/* Barra de Acciones */}
            <div className={styles.actionsBar}>
          <button
            type="button"
            onClick={toggleLike}
            disabled={isFlipped}
            className={`${styles.actionBtn} ${liked ? styles.likedAction : ""}`}
            aria-label={liked ? "Quitar Me gusta" : "Me gusta"}
          >
            <HeartIcon filled={liked} />
          </button>
              <button type="button" className={styles.actionBtn} aria-label="Comentar" disabled={isFlipped} onClick={(event) => event.stopPropagation()}>
                <CommentIcon />
              </button>
              <button type="button" className={styles.actionBtn} aria-label="Compartir" disabled={isFlipped} onClick={(event) => event.stopPropagation()}>
                <ShareIcon />
              </button>
            </div>

        {allowImageScroll && (
          <h3 className={styles.postTitle}>{postTitle}</h3>
        )}

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

        {/* CTA principal: lleva al shop con la pieza ya seleccionada.
            En Diseño no se vende la pieza, así que ahí no se pinta.
            Va antes del EW: el botón arriba, la firma cerrando debajo. */}
        {allowPurchase && (
          <Link
            href={shopHref}
            className={`${styles.projectButton} ${styles.frontProjectButton} ${styles.acquireButton}`}
            onClick={(event) => event.stopPropagation()}
          >
            Adquirir para tu colección
          </Link>
        )}

        {projectHref && (
          <Link
            href={projectHref}
            className={`${styles.projectButton} ${styles.frontProjectButton}`}
            onClick={(event) => event.stopPropagation()}
          >
            Ver proyecto completo
          </Link>
        )}

        {allowImageScroll && (
          <img
            src="/SVG/ew_white.svg"
            alt="EW"
            className={styles.infoPanelLogo}
          />
        )}

          </div>
        </div>

        {/* Reverso con la ficha técnica. En Diseño la tarjeta no gira, así que
            ni siquiera se monta. */}
        {allowFlip && (
        <div className={`${styles.cardFace} ${styles.cardBack}`} aria-hidden={!isFlipped}>
          {/* Corona: el logotipo elegido para esta pieza en el dashboard
              (morado por defecto). La firma EW cierra abajo. */}
          <img
            src={resolveLogoReverso(post.logoReverso)}
            alt=""
            className={styles.cardBackLogo}
          />

          <div className={styles.metaBody}>
            {/* Encabezado: referencia + título de la pieza */}
            <p className={styles.metaEyebrow}>Ficha técnica · {referencia}</p>
            <h4 className={styles.metaTitle} title={postTitle}>
              {recortar(postTitle, LIMITES.titulo)}
            </h4>

            {/* Metadatos en pares etiqueta / valor */}
            <dl className={styles.metaList}>
              {metaRows.map((row) => (
                <div key={row.key} className={styles.metaRow}>
                  <dt className={styles.metaLabel}>{row.label}</dt>
                  <dd className={styles.metaValue}>{row.value}</dd>
                </div>
              ))}
            </dl>

            {/* Palabras clave: lo que ayuda al posicionamiento */}
            {etiquetas.length > 0 && (
              <ul className={styles.metaTags} aria-label="Palabras clave">
                {etiquetas.map((tag) => (
                  <li key={tag} className={styles.metaTag}>
                    #{tag}
                  </li>
                ))}
              </ul>
            )}

            {/* Descripción larga (alt text): accesibilidad + SEO */}
            {post.caption && (
              <p className={styles.metaDescription}>
                {recortar(post.caption, LIMITES.descripcion)}
              </p>
            )}
          </div>

          {/* Holograma de la esquina inferior derecha (ver nota arriba) */}
          <Holograma src={post.holograma} activo={isFlipped} />

          {projectHref && (
            <Link
              href={projectHref}
              className={styles.projectButton}
              onClick={(event) => event.stopPropagation()}
            >
              Ver proyecto completo
            </Link>
          )}

          {/* Firma de cierre: el EW de siempre, ahora al pie de la ficha */}
          <img src="/SVG/ew_white.svg" alt="EW" className={styles.cardBackFirma} />
        </div>
        )}
      </div>
    </motion.div>
  );
}

export default function FeedModal({
  posts,
  startIndex,
  onClose,
  projectPathPrefix,
  allowImageScroll = false,
  galleryName = "",
  allowPurchase = true,
  allowFlip = true,
  soloFoto = false,
}) {
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

    /*
     * Con el ratón encima de una imagen que se puede recorrer, la rueda la
     * recorre a ella, no al feed. Hay que mirar los DOS ejes: las verticales
     * desbordan en Y (el navegador las pantea solo) y las panorámicas llevan
     * postImgFillHeight, así que desbordan en X y la rueda vertical tiene que
     * traducirse a movimiento horizontal a mano.
     */
    const imageViewport = event.target.closest(`.${styles.imageViewport}`);
    if (imageViewport) {
      if (imageViewport.scrollHeight > imageViewport.clientHeight) return;

      if (imageViewport.scrollWidth > imageViewport.clientWidth) {
        event.preventDefault();
        imageViewport.scrollLeft += event.deltaY || event.deltaX;
        return;
      }
    }

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

  const handleOutsideClick = (event) => {
    const clickedInteractiveContent = event.target.closest(
      `.${styles.postWrapper}, .${styles.fotoSola}, button`,
    );

    if (!clickedInteractiveContent) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.modalOverlay}
        onClick={handleOutsideClick}
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
          {posts.map((post, i) => soloFoto ? (
            <FotoSola key={post.id} post={post} index={i} delay={i * 0.05} />
          ) : (
            <FeedPost
              key={post.id}
              post={post}
              index={i}
              delay={i * 0.05}
              projectHref={
                projectPathPrefix ? `${projectPathPrefix}/${post.id}` : null
              }
              allowImageScroll={allowImageScroll}
              galleryName={galleryName}
              allowPurchase={allowPurchase}
              allowFlip={allowFlip}
            />
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

        {!soloFoto && (
          <div className={styles.counter} aria-live="polite">
            {activeIndex + 1} / {posts.length}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import styles from "./HomeCarousel.module.css";
import { defaultHomeSlides } from "../data/homeSlides";

// Enfoque por defecto cuando la imagen no tiene uno guardado: el sujeto suele
// caer a la izquierda del centro en estas composiciones.
const FOCO_POR_DEFECTO = 35;

const SCROLL_SLIDE_PHASE_START = 0.2;

// Texto legible (negro/blanco) según la luminancia del color de fondo.
function readableTextColor(hex) {
  const m = String(hex).replace("#", "");
  if (m.length !== 6) return undefined;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return undefined;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000" : "#fff";
}

// Estilo del botón del slide. Si buttonColor está vacío, se devuelve undefined
// y el botón conserva el estilo por defecto del tema (amarillo del CSS module).
function slideButtonStyle(color) {
  if (!color) return undefined;
  return {
    background: color,
    borderColor: color,
    color: readableTextColor(color),
    boxShadow: `0 0 15px ${color}80`,
  };
}

function ChromaKeyMemoji({ src }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!video || !canvas || !context) return undefined;

    let frameRequest;
    let stopped = false;
    let drawingStarted = false;

    const drawFrame = () => {
      if (stopped) return;

      if (video.readyState >= 2) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = context.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = frame.data;

        for (let index = 0; index < pixels.length; index += 4) {
          const darkestEdge = Math.max(
            pixels[index],
            pixels[index + 1],
            pixels[index + 2],
          );

          if (darkestEdge <= 6) {
            pixels[index + 3] = 0;
          } else if (darkestEdge < 18) {
            pixels[index + 3] = Math.round(((darkestEdge - 6) / 12) * 255);
          }
        }

        context.putImageData(frame, 0, 0);
      }

      if ("requestVideoFrameCallback" in video) {
        frameRequest = video.requestVideoFrameCallback(drawFrame);
      } else {
        frameRequest = window.requestAnimationFrame(drawFrame);
      }
    };

    const startDrawing = () => {
      if (drawingStarted || stopped) return;
      drawingStarted = true;
      drawFrame();
    };
    video.addEventListener("loadeddata", startDrawing, { once: true });
    video.addEventListener("playing", startDrawing, { once: true });
    if (video.readyState >= 2) startDrawing();
    video.play().then(startDrawing).catch(() => undefined);

    return () => {
      stopped = true;
      video.removeEventListener("loadeddata", startDrawing);
      video.removeEventListener("playing", startDrawing);
      if ("cancelVideoFrameCallback" in video && frameRequest) {
        video.cancelVideoFrameCallback(frameRequest);
      } else if (frameRequest) {
        window.cancelAnimationFrame(frameRequest);
      }
    };
  }, [src]);

  return (
    <>
      <video
        ref={videoRef}
        className={styles.memojiSource}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        className={styles.memojiVideo}
        width="256"
        height="192"
        aria-hidden="true"
      />
    </>
  );
}

export default function HomeCarousel({ slides, focos }) {
  // El contenido llega por prop (desde Supabase). Fallback al seed por defecto.
  const slidesData =
    Array.isArray(slides) && slides.length > 0 ? slides : defaultHomeSlides;
  const sectionRef = useRef(null);
  const scrollBaseIndexRef = useRef(0);
  const scrollStepRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isScrollMode, setIsScrollMode] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  /*
   * Qué slides usan el MODO REVELADO. Se decide por la proporción de la imagen,
   * medida al cargarla, y no con un ajuste manual:
   * - Los lienzos verticales (1395 × 6690) ya se ven como una franja delgada por
   *   su propia proporción: se dejan como estaban.
   * - Una imagen horizontal, en cambio, saldría ancha desde el principio. Con
   *   estas se abre una ventana que empieza estrecha —enfocada en el sujeto— y
   *   crece con el scroll hasta ocupar la pantalla.
   */
  const [horizontales, setHorizontales] = useState({});
  /*
   * Medidas de la franja del modo revelado, en píxeles. La misma proporción que
   * los lienzos verticales (0,2085 × alto de la ventana) para que las dos clases
   * de slide arranquen idénticas en cualquier pantalla.
   */
  const [medidas, setMedidas] = useState({ franja: 0, pantalla: 0 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const PROPORCION_FRANJA = 1395 / 6690; // la de los lienzos del carrusel
    const medir = () =>
      setMedidas({
        franja: Math.round(window.innerHeight * PROPORCION_FRANJA),
        pantalla: window.innerWidth,
      });
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  const evaluarProporcion = (indice, img) => {
    if (!img?.naturalWidth) return;
    const esHorizontal = img.naturalWidth >= img.naturalHeight * 1.1;
    setHorizontales((prev) =>
      prev[indice] === esHorizontal ? prev : { ...prev, [indice]: esHorizontal },
    );
  };

  /*
   * Se mide con una referencia y no sólo con onLoad: si la imagen ya está en
   * caché, termina de cargar antes de que React enganche el manejador y el
   * evento no llega nunca. Con la referencia se comprueba `complete` en el
   * momento y, si aún no lo está, se escucha la carga una vez.
   */
  const medirImagen = (indice) => (nodo) => {
    if (!nodo) return;
    if (nodo.complete) evaluarProporcion(indice, nodo);
    else nodo.addEventListener("load", () => evaluarProporcion(indice, nodo), { once: true });
  };

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const transitionRange = prefersReducedMotion ? [0, 0.04] : [0, 0.18];
  const initialOpacity = useTransform(
    scrollYProgress,
    prefersReducedMotion ? [0, 0.02] : [0, 0.08],
    [1, 0],
  );
  const imageX = useTransform(scrollYProgress, transitionRange, ["0vw", "-20vw"]);
  const imageScale = useTransform(scrollYProgress, transitionRange, [1, 1.12]);

  /*
   * Modo revelado. La ventana se abre de franja a pantalla completa y, mientras,
   * el encuadre se desplaza del punto focal al centro: se lee como una
   * panorámica lenta en lugar de un simple estirón.
   *
   * El 35% es donde está el sujeto en la imagen de referencia (ocupa del 16% al
   * 55% del ancho). Con object-fit: cover, ese valor decide qué franja se ve
   * cuando la ventana es estrecha.
   */
  /*
   * El ancho de la franja se deriva de la ALTURA de la ventana, igual que en los
   * slides clásicos: esos lienzos miden 1395 × 6690 y se pintan a `height:100dvh;
   * width:auto`, así que su franja siempre vale 0,2085 × alto. Con un valor en vw
   * sólo coincidía por casualidad a 1440 × 950; a 1920 × 1080 la franja clásica
   * mide 225px y una de 14vw se iba a 269px.
   */
  const anchoRevelado = useTransform(scrollYProgress, transitionRange, [
    medidas.franja,
    medidas.pantalla,
  ]);
  /*
   * Avance de la panorámica: 0 = encuadre en el punto de enfoque de la imagen,
   * 1 = centrado. Es UN solo valor animado para todos los slides; el enfoque
   * concreto de cada imagen entra como variable CSS (--foco) y el cálculo se
   * hace en la hoja de estilos. Así se evita crear un hook por slide, que sería
   * ilegal dentro del map.
   */
  const avancePan = useTransform(scrollYProgress, transitionRange, [0, 1]);
  const veloRevelado = useTransform(
    scrollYProgress,
    prefersReducedMotion ? [0.015, 0.04] : [0.06, 0.16],
    [0, 1],
  );
  const detailOpacity = useTransform(
    scrollYProgress,
    prefersReducedMotion ? [0.015, 0.04] : [0.08, 0.17],
    [0, 1],
  );
  const detailX = useTransform(
    scrollYProgress,
    prefersReducedMotion ? [0.015, 0.04] : [0.07, 0.17],
    [80, 0],
  );
  const detailTitleY = useTransform(scrollYProgress, [0.08, 0.16], [24, 0]);
  const detailBodyY = useTransform(scrollYProgress, [0.1, 0.18], [32, 0]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 769px) and (orientation: landscape)",
    );
    const syncViewport = () => setIsDesktop(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const nextScrollMode = isDesktop && progress > 0.015;

    if (nextScrollMode) setIsMessageOpen(false);

    if (nextScrollMode && !isScrollMode) {
      scrollBaseIndexRef.current = activeIndex;
      scrollStepRef.current = 0;
    }

    if (nextScrollMode) {
      const slideProgress = Math.max(
        0,
        (progress - SCROLL_SLIDE_PHASE_START) /
          (1 - SCROLL_SLIDE_PHASE_START),
      );
      const nextStep = Math.min(
        slidesData.length - 1,
        Math.floor(slideProgress * (slidesData.length - 1) + 0.0001),
      );

      if (nextStep !== scrollStepRef.current) {
        scrollStepRef.current = nextStep;
        setActiveIndex(
          (scrollBaseIndexRef.current + nextStep) % slidesData.length,
        );
      }
    }

    setIsScrollMode((current) =>
      current === nextScrollMode ? current : nextScrollMode,
    );
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isScrollMode) return;

      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === slidesData.length - 1 ? 0 : current + 1,
        );
      } else if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === 0 ? slidesData.length - 1 : current - 1,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isScrollMode, slidesData.length]);

  useEffect(() => {
    if (isScrollMode) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex((current) =>
        current === slidesData.length - 1 ? 0 : current + 1,
      );
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isScrollMode, slidesData.length]);

  const selectSlide = (index) => {
    if (isScrollMode) {
      scrollBaseIndexRef.current =
        (index - scrollStepRef.current + slidesData.length) % slidesData.length;
    }
    setActiveIndex(index);
  };

  return (
    <section ref={sectionRef} className={styles.scrollSection}>
      <div className={styles.stickyScene}>
        <div className={styles.backgroundGlows} aria-hidden="true">
          <div className={styles.leftGlow} />
          <div className={styles.rightGlow} />
        </div>

        <motion.div
          className={styles.whiteFrame}
          style={{ opacity: isDesktop ? initialOpacity : 1 }}
          aria-hidden="true"
        />

        <motion.div
          className={styles.dots}
          style={{ opacity: isDesktop ? initialOpacity : 1 }}
          aria-label="Seleccionar imagen del carrusel"
        >
          {slidesData.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => selectSlide(index)}
              disabled={isScrollMode}
              className={`${styles.dot} ${
                activeIndex === index ? styles.activeDot : ""
              }`}
              aria-label={`Ir a slide ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
            />
          ))}
        </motion.div>

        <motion.div
          className={`${styles.floatingMemoji} ${isScrollMode ? styles.memojiHidden : ""}`}
          style={{ opacity: isDesktop ? initialOpacity : 1 }}
        >
          <button
            type="button"
            className={styles.memojiTrigger}
            onClick={() => {
              setIsMessageOpen(true);
              setMessageSent(false);
            }}
            aria-label="Abrir mensaje"
            aria-expanded={isMessageOpen}
            aria-controls="memoji-message-panel"
          >
            <ChromaKeyMemoji src="/perfil/IMG_1327-mobile.mp4" />
          </button>
        </motion.div>

        <motion.div
          className={`${styles.floatingMemoji} ${styles.floatingMemojiRight} ${isScrollMode ? styles.memojiHidden : ""}`}
          style={{ opacity: isDesktop ? initialOpacity : 1 }}
        >
          <button
            type="button"
            className={styles.memojiTrigger}
            onClick={() => {
              setIsMessageOpen(true);
              setMessageSent(false);
            }}
            aria-label="Abrir mensaje desde el segundo emoji"
            aria-expanded={isMessageOpen}
            aria-controls="memoji-message-panel"
          >
            <ChromaKeyMemoji src="/perfil/IMG_1329-mobile.mp4" />
          </button>
        </motion.div>

        <AnimatePresence>
          {isMessageOpen && (
            <motion.aside
              id="memoji-message-panel"
              className={styles.messagePanel}
              initial={{ opacity: 0, x: -22, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -16, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              aria-label="Enviar un mensaje"
            >
              <button
                type="button"
                className={styles.messageClose}
                onClick={() => setIsMessageOpen(false)}
                aria-label="Cerrar mensaje"
              >
                ×
              </button>
              <p className={styles.messageEyebrow}>MENSAJE DIRECTO</p>
              <h2>¿Qué tienes en mente?</h2>
              <p className={styles.messageIntro}>
                Déjame una idea, una colaboración o simplemente un saludo.
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!messageText.trim()) return;
                  setMessageSent(true);
                }}
              >
                <label htmlFor="memoji-message">Tu mensaje</label>
                <textarea
                  id="memoji-message"
                  value={messageText}
                  maxLength={280}
                  placeholder="Escribe aquí..."
                  onChange={(event) => {
                    setMessageText(event.target.value);
                    setMessageSent(false);
                  }}
                />
                <div className={styles.messageMeta}>
                  <span>{messageText.length} / 280</span>
                  <button type="submit">Enviar</button>
                </div>
              </form>
              {messageSent && (
                <motion.p
                  className={styles.messageConfirmation}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Vista previa enviada. Aún no se guarda información.
                </motion.p>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        <div
          className={styles.track}
          style={{ transform: `translate3d(-${activeIndex * 100}vw, 0, 0)` }}
        >
          {slidesData.map((slide, index) => (
            <article
              key={slide.id}
              className={styles.slide}
              aria-hidden={activeIndex !== index}
            >
              <motion.div
                className={styles.initialCopy}
                style={{ opacity: isDesktop ? initialOpacity : 1 }}
              >
                <h2>{slide.title}</h2>
                <div className={styles.initialAction}>
                  <h3>{slide.logoText}</h3>
                  <button type="button" style={slideButtonStyle(slide.buttonColor)}>
                    {slide.buttonText}
                  </button>
                </div>
              </motion.div>

              {(() => {
                // Modo revelado sólo en escritorio y sólo con imagen horizontal
                const revelado = isDesktop && horizontales[index];
                return (
                  <>
                    <motion.div
                      className={`${styles.imageAnchor} ${
                        revelado ? styles.imageAnchorRevelado : ""
                      }`}
                      style={revelado ? { width: anchoRevelado } : undefined}
                    >
                      <motion.div
                        className={styles.imageStage}
                        style={{
                          // En modo revelado manda la ventana: mover o escalar
                          // aquí sacaría la imagen de su propio encuadre.
                          x: isDesktop && !revelado ? imageX : 0,
                          scale: isDesktop && !revelado ? imageScale : 1,
                        }}
                      >
                        <motion.img
                          src={slide.image}
                          alt={slide.title}
                          loading={index === 0 ? "eager" : "lazy"}
                          fetchPriority={index === 0 ? "high" : "auto"}
                          ref={medirImagen(index)}
                          onLoad={(e) => evaluarProporcion(index, e.currentTarget)}
                          className={
                            revelado ? styles.heroImageRevelado : styles.heroImage
                          }
                          style={{
                            // El enfoque también se usa en la Franja móvil.
                            // En escritorio, --pan anima desde ese punto al centro.
                            "--foco": focos?.[slide.image] ?? FOCO_POR_DEFECTO,
                            ...(revelado ? { "--pan": avancePan } : {}),
                          }}
                        />
                      </motion.div>
                    </motion.div>

                    {/* Velo para que el texto se lea sobre la imagen revelada */}
                    {revelado && (
                      <motion.div
                        className={styles.veloRevelado}
                        style={{ opacity: veloRevelado }}
                        aria-hidden="true"
                      />
                    )}
                  </>
                );
              })()}

              <motion.div
                className={styles.initialRightCopy}
                style={{ opacity: isDesktop ? initialOpacity : 1 }}
              >
                <div className={styles.copyHeading}>
                  <span className={styles.yellowMark} />
                  <span className={styles.blueMark} />
                  <h3 style={{ color: slide.rightColor }}>{slide.rightTitle}</h3>
                </div>
                <p>{slide.rightText}</p>
              </motion.div>

              <motion.div
                className={styles.editorialCopy}
                style={{
                  opacity: isDesktop ? detailOpacity : 0,
                  x: isDesktop ? detailX : 80,
                  y: "-50%",
                }}
              >
                <motion.p
                  className={styles.eyebrow}
                  style={{ color: slide.rightColor, y: detailTitleY }}
                >
                  {slide.logoText}
                </motion.p>
                <motion.h2 style={{ y: detailTitleY }}>
                  {slide.rightTitle}
                </motion.h2>
                <motion.p className={styles.description} style={{ y: detailBodyY }}>
                  {slide.rightText}
                </motion.p>
                <motion.div
                  className={styles.editorialActions}
                  style={{ y: detailBodyY }}
                >
                  <button type="button" style={slideButtonStyle(slide.buttonColor)}>
                    {slide.buttonText}
                  </button>
                  <div
                    className={styles.editorialDots}
                    aria-label="Seleccionar imagen del carrusel"
                  >
                    {slidesData.map((dotSlide, dotIndex) => (
                      <button
                        key={dotSlide.id}
                        type="button"
                        onClick={() => selectSlide(dotIndex)}
                        disabled={!isScrollMode || activeIndex !== index}
                        className={`${styles.dot} ${
                          activeIndex === dotIndex ? styles.activeDot : ""
                        }`}
                        aria-label={`Ir a slide ${dotIndex + 1}`}
                        aria-current={
                          activeIndex === dotIndex ? "true" : undefined
                        }
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

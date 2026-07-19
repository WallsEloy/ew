"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import styles from "./HomeCarousel.module.css";
import { defaultHomeSlides } from "../data/homeSlides";

const SCROLL_SLIDE_PHASE_START = 0.2;

export default function HomeCarousel({ slides }) {
  // El contenido llega por prop (desde Supabase). Fallback al seed por defecto.
  const slidesData =
    Array.isArray(slides) && slides.length > 0 ? slides : defaultHomeSlides;
  const sectionRef = useRef(null);
  const scrollBaseIndexRef = useRef(0);
  const scrollStepRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isScrollMode, setIsScrollMode] = useState(false);
  const prefersReducedMotion = useReducedMotion();

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
                  <button type="button">{slide.buttonText}</button>
                </div>
              </motion.div>

              <div className={styles.imageAnchor}>
                <motion.div
                  className={styles.imageStage}
                  style={{
                    x: isDesktop ? imageX : 0,
                    scale: isDesktop ? imageScale : 1,
                  }}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    className={styles.heroImage}
                  />
                </motion.div>
              </div>

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
                  <button type="button">{slide.buttonText}</button>
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

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import styles from "./HomeCarousel.module.css";

const slidesData = [
  {
    id: 0,
    title: "Galerias",
    logoText: "HUMANS",
    buttonText: "ver",
    image: "/p-1Mesa-de-trabajo-1.png",
    rightTitle: "OnlyFans",
    rightText:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.",
    rightColor: "#00aff0",
  },
  {
    id: 1,
    title: "Proyectos",
    logoText: "PROJECTS",
    buttonText: "descubrir",
    image: "/p-2Mesa-de-trabajo-1.png",
    rightTitle: "Exclusive",
    rightText:
      "Explora la exclusiva colección de nuestros mejores proyectos, cada uno elaborado con el máximo cuidado y atención al detalle para inspirar tu creatividad.",
    rightColor: "#ff0055",
  },
  {
    id: 2,
    title: "Eventos",
    logoText: "EVENTS",
    buttonText: "asistir",
    image: "/p-3Mesa-de-trabajo-1.png",
    rightTitle: "VIP Pass",
    rightText:
      "Únete a nosotros en nuestros próximos eventos y experimenta de primera mano la atmósfera vibrante de nuestra comunidad enfocada en el arte.",
    rightColor: "#ffd700",
  },
  {
    id: 3,
    title: "Shopping",
    logoText: "STORE",
    buttonText: "comprar",
    image: "/p-4Mesa-de-trabajo-1.png",
    rightTitle: "Merch",
    rightText:
      "Adquiere la última mercancía de nuestras colecciones. Ediciones limitadas disponibles solo para miembros registrados. No te quedes sin la tuya.",
    rightColor: "#ff4500",
  },
  {
    id: 4,
    title: "Contacto",
    logoText: "CONTACT",
    buttonText: "escribir",
    image: "/p-6Mesa-de-trabajo-1.png",
    rightTitle: "Let's Talk",
    rightText:
      "Ponte en contacto con nuestro equipo para consultas de prensa, colaboraciones o cualquier otra pregunta relacionada con nuestro trabajo.",
    rightColor: "#00fa9a",
  },
];

export default function HomeCarousel() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isScrollMode, setIsScrollMode] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const transitionRange = prefersReducedMotion ? [0, 0.12] : [0, 0.82];
  const initialOpacity = useTransform(scrollYProgress, transitionRange, [1, 0]);
  const imageX = useTransform(scrollYProgress, transitionRange, ["0vw", "-20vw"]);
  const imageScale = useTransform(scrollYProgress, transitionRange, [1, 1.12]);
  const detailOpacity = useTransform(
    scrollYProgress,
    prefersReducedMotion ? [0.02, 0.12] : [0.28, 0.72],
    [0, 1],
  );
  const detailX = useTransform(
    scrollYProgress,
    prefersReducedMotion ? [0.02, 0.12] : [0.25, 0.72],
    [80, 0],
  );
  const detailTitleY = useTransform(scrollYProgress, [0.3, 0.7], [24, 0]);
  const detailBodyY = useTransform(scrollYProgress, [0.38, 0.78], [32, 0]);

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
  }, [isScrollMode]);

  useEffect(() => {
    if (isScrollMode) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex((current) =>
        current === slidesData.length - 1 ? 0 : current + 1,
      );
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isScrollMode]);

  const selectSlide = (index) => {
    if (!isScrollMode) setActiveIndex(index);
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
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 769px) 60vw, 100vw"
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
                <motion.button type="button" style={{ y: detailBodyY }}>
                  {slide.buttonText}
                </motion.button>
              </motion.div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

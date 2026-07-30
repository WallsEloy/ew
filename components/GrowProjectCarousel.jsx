"use client";
import Image from "next/image";
import { useState } from "react";
import styles from "./GrowProjectCarousel.module.css";

export default function GrowProjectCarousel({ images, title, eyebrow }) {
  const validImages = images?.filter(Boolean) || [];
  const [active, setActive] = useState(0);
  if (!validImages.length) return null;
  const move = (direction) => setActive((current) => (current + direction + validImages.length) % validImages.length);
  return (
    <section className={styles.carousel} aria-label={`Galería de ${title}`}>
      <div className={styles.track} style={{ transform: `translateX(-${active * 100}%)` }}>
        {validImages.map((image, index) => (
          <div className={styles.slide} key={`${image}-${index}`} aria-hidden={index !== active}>
            <Image src={image} alt={`${title}, imagen ${index + 1}`} fill priority={index === 0} sizes="100vw" className={styles.image} />
          </div>
        ))}
      </div>
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.copy}>
        {eyebrow && <span>{eyebrow}</span>}
        <h1>{title}</h1>
      </div>
      {validImages.length > 1 && <>
        <button type="button" className={`${styles.arrow} ${styles.previous}`} onClick={() => move(-1)} aria-label="Imagen anterior">←</button>
        <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => move(1)} aria-label="Imagen siguiente">→</button>
        <div className={styles.dots} aria-label="Seleccionar imagen">
          {validImages.map((_, index) => <button key={index} type="button" className={index === active ? styles.activeDot : ""} onClick={() => setActive(index)} aria-label={`Ir a imagen ${index + 1}`} aria-current={index === active ? "true" : undefined} />)}
        </div>
      </>}
    </section>
  );
}

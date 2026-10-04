"use client";

import { useEffect, useRef } from "react";

// Video de la galería del proyecto: no se descarga hasta acercarse, se
// reproduce en silencio y en bucle solo mientras está en pantalla, y deja los
// controles para activar el sonido. Con "reducir movimiento" no arranca solo.
export default function VideoTile({ src, poster, label, width, height }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.getAttribute("src")) video.setAttribute("src", src);
          if (!reduceMotion) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.35 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      width={width}
      height={height}
      aria-label={label}
      muted
      loop
      playsInline
      controls
      preload="none"
      controlsList="nodownload noplaybackrate"
      disablePictureInPicture
      onContextMenu={(event) => event.preventDefault()}
    />
  );
}

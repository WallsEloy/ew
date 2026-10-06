"use client";

import { useEffect, useRef } from "react";

// Video de la galería del proyecto: no se descarga hasta acercarse y se
// reproduce en silencio y en bucle solo mientras está en pantalla, como una
// imagen animada: sin controles, botón de reproducción ni línea de tiempo.
// Con "reducir movimiento" se queda en su póster.
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
      preload="none"
      tabIndex={-1}
      disablePictureInPicture
      disableRemotePlayback
      onContextMenu={(event) => event.preventDefault()}
    />
  );
}

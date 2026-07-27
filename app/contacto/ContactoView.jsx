"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Inter } from "next/font/google";
import styles from "./page.module.css";
import { buildVCard, defaultContactoConfig } from "../../data/contactoConfig";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "600", "700"] });

const HALF = 260; // ms de medio giro (coincide con la transición CSS de .perfilInner)
// Los primeros giros son rápidos (dinámicos) y luego el intervalo se va ampliando
// para que la foto no esté girando constantemente.
const FLIP_SCHEDULE = [4000, 4000, 4000, 8000, 15000, 26000, 40000];

// Todo el contenido llega en `config` (Supabase → defaults de data/contactoConfig).
export default function ContactoView({ config = defaultContactoConfig }) {
  const perfil = config.perfil;
  const medios = perfil.medios;
  const stories = config.stories;
  const socials = config.redes;
  const sections = config.secciones;
  const vcardHref = buildVCard(config.vcard);

  const [openSection, setOpenSection] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [activeStory, setActiveStory] = useState(-1);
  const [playlist, setPlaylist] = useState([]);
  const [videoIndex, setVideoIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);

  // Giro periódico de la foto de perfil mostrando el siguiente medio.
  // Se usa UNA sola cara: al llegar al canto (90°, invisible) se cambia el
  // medio y se salta a -90° sin transición, luego se completa el giro a 0°.
  // Así nunca hay dos medios a la vez (evita que el <video> traspase la cara).
  const [currentMedia, setCurrentMedia] = useState(medios[0]);
  const [rot, setRot] = useState(0);
  const [spin, setSpin] = useState(true);
  const profileIdxRef = useRef(0);
  const isFlippingRef = useRef(false);
  const autoTimerRef = useRef(null);
  const autoIdxRef = useRef(0);

  // Ejecuta un giro cambiando el medio "de canto" (90°, invisible).
  // Devuelve false si ya hay un giro en curso.
  const flip = useCallback(() => {
    const n = medios.length;
    if (n < 2 || isFlippingRef.current) return false;
    isFlippingRef.current = true;
    setSpin(true);
    setRot(90); // gira hasta el canto
    setTimeout(() => {
      profileIdxRef.current = (profileIdxRef.current + 1) % n;
      setCurrentMedia(medios[profileIdxRef.current]);
      setSpin(false);
      setRot(-90); // reaparece por el otro canto sin transición
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setSpin(true);
          setRot(0); // completa el giro
          setTimeout(() => {
            isFlippingRef.current = false;
          }, HALF);
        }),
      );
    }, HALF);
    return true;
  }, [medios]);

  // Programa el próximo giro automático con intervalo creciente (FLIP_SCHEDULE).
  const scheduleNext = useCallback(() => {
    if (medios.length < 2) return;
    clearTimeout(autoTimerRef.current);
    const i = Math.min(autoIdxRef.current, FLIP_SCHEDULE.length - 1);
    autoTimerRef.current = setTimeout(() => {
      flip();
      autoIdxRef.current += 1;
      scheduleNext();
    }, FLIP_SCHEDULE[i]);
  }, [flip, medios]);

  useEffect(() => {
    scheduleNext();
    return () => clearTimeout(autoTimerRef.current);
  }, [scheduleNext]);

  // Giro manual al hacer clic en el círculo; además reprograma y amplía el intervalo.
  const handleProfileClick = () => {
    if (flip()) {
      autoIdxRef.current += 1;
      scheduleNext();
    }
  };

  const renderProfileMedia = (media) =>
    media?.type === "video" ? (
      <video
        muted
        autoPlay
        loop
        playsInline
        ref={(el) => {
          if (el) el.muted = true; // asegura autoplay sin sonido
        }}
      >
        {(media.sources || []).map((src) => (
          <source
            key={src}
            src={src}
            type={src.endsWith(".webm") ? "video/webm" : "video/quicktime"}
          />
        ))}
      </video>
    ) : (
      <img src={media?.src} alt={perfil.nombre} />
    );

  const toggleSection = (index) =>
    setOpenSection((current) => (current === index ? null : index));

  const openStory = (index) => {
    const vids = stories[index].videos || [];
    if (!vids.length) return;
    setActiveStory(index);
    setPlaylist(vids);
    setVideoIndex(0);
    setProgress(0);
    setOverlayOpen(true);
  };

  const closeStory = () => {
    setOverlayOpen(false);
    setProgress(0);
    const v = videoRef.current;
    if (v) v.pause();
  };

  const advance = () => {
    const next = videoIndex + 1;
    if (next < playlist.length) {
      setVideoIndex(next);
      setProgress(0);
      return;
    }
    // Saltar a la siguiente categoría con videos.
    let ni = activeStory + 1;
    while (ni < stories.length && (stories[ni].videos || []).length === 0) ni += 1;
    if (ni < stories.length) {
      setActiveStory(ni);
      setPlaylist(stories[ni].videos);
      setVideoIndex(0);
      setProgress(0);
    } else {
      closeStory();
    }
  };

  // Reproduce el video actual cuando cambia la fuente o se abre el overlay.
  useEffect(() => {
    if (!overlayOpen) return;
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [overlayOpen, videoIndex, playlist]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.duration && v.duration !== Infinity) {
      setProgress((v.currentTime / v.duration) * 100);
    }
  };

  return (
    <main className={`${styles.page} ${inter.className}`}>
      <div className={styles.card}>
        {/* COLUMNA IZQUIERDA */}
        <div className={styles.leftColumn}>
          <div
            className={styles.perfilFlip}
            onClick={handleProfileClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleProfileClick();
            }}
          >
            <div
              className={styles.perfilInner}
              style={{
                transform: `rotateY(${rot}deg)`,
                transition: spin ? undefined : "none",
              }}
            >
              <div className={styles.perfilFace}>{renderProfileMedia(currentMedia)}</div>
            </div>
          </div>
          <div className={styles.name}>{perfil.nombre}</div>
          <div className={styles.role}>{perfil.rol}</div>

          <a
            className={styles.btnPurple}
            href={config.agencia.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {config.agencia.label}
          </a>
          <p className={styles.descAgencia}>{config.agencia.descripcion}</p>

          {/* STORIES */}
          <div className={styles.storiesRow}>
            {stories.map((story, index) => (
              <button
                key={story.id || story.label}
                type="button"
                className={`${styles.story} ${activeStory === index && overlayOpen ? styles.active : ""}`}
                onClick={() => openStory(index)}
              >
                <span
                  className={styles.storyCircle}
                  style={{ backgroundImage: `url(${story.cover})` }}
                />
                <span className={styles.storyLabel}>{story.label}</span>
              </button>
            ))}
          </div>

          {/* REDES */}
          <div className={styles.socialRow}>
            {socials.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className={styles.socialIcon}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={s.icon} className={styles.icon} alt={s.alt} />
              </a>
            ))}
          </div>

          <p className={styles.asesoria}>{config.asesoria.titulo}</p>
          <a
            className={styles.btnGreen}
            href={config.asesoria.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {config.asesoria.label}
          </a>

          <a className={styles.btnContact} href={vcardHref} download="EloyWalls.vcf">
            {config.vcard.label}
          </a>
        </div>

        {/* COLUMNA DERECHA — ACORDEONES */}
        <div className={styles.rightColumn}>
          {sections.map((section, index) => (
            <div
              key={section.title}
              className={`${styles.section} ${openSection === index ? styles.active : ""}`}
              onClick={() => toggleSection(index)}
            >
              <h3>{section.title}</h3>
              <div className={styles.content}>
                <p>
                  {(section.lines || []).map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < section.lines.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          ))}
          <div className={styles.pie}>
            <p>Desarrollado por</p>
            <img src="/Imagenes/ew.png" className={styles.logoEw} alt="EW" />
          </div>
        </div>
      </div>

      {/* OVERLAY DE VIDEO */}
      {overlayOpen && (
        <div
          className={styles.storyOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeStory();
          }}
        >
          <div className={styles.storyWrapper}>
            <div className={styles.storyProgress}>
              {playlist.map((_, i) => (
                <div key={i} className={styles.progressSegment}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width:
                        i < videoIndex
                          ? "100%"
                          : i === videoIndex
                            ? `${progress}%`
                            : "0%",
                    }}
                  />
                </div>
              ))}
            </div>
            <video
              ref={videoRef}
              src={playlist[videoIndex]}
              playsInline
              onEnded={advance}
              onClick={advance}
              onTimeUpdate={handleTimeUpdate}
            />
            <button type="button" className={styles.closeStory} onClick={closeStory}>
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Inter } from "next/font/google";
import styles from "./page.module.css";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "600", "700"] });

// Stories tipo Instagram. Cada categoría reproduce una playlist de videos.
const stories = [
  {
    id: "proyectos",
    label: "Proyectos",
    cover: "/Imagenes/icon_1.jpg",
    videos: [
      "/Videos/Proyectos/d.mp4",
      "/Videos/Proyectos/recor480.mp4",
      "/Videos/Proyectos/c.mp4",
    ],
  },
  {
    id: "code",
    label: "CODE",
    cover: "/Imagenes/icon_2.jpg",
    videos: ["/Videos/code/1108.mp4", "/Videos/code/Codi.mp4"],
  },
  {
    id: "conferencias",
    label: "Conferencias",
    cover: "/Imagenes/icon_3.jpg",
    videos: [
      "/Videos/Conferencia/vido2.mp4",
      "/Videos/Conferencia/vido1_1.mp4",
      "/Videos/Conferencia/vido_3.mp4",
    ],
  },
  {
    id: "design",
    label: "Design",
    cover: "/Imagenes/icon_4.jpg",
    videos: [
      "/Videos/desing/A1.mp4",
      "/Videos/desing/A2.mp4",
      "/Videos/desing/B1.mp4",
      "/Videos/desing/B2.mp4",
      "/Videos/desing/1129.mp4",
    ],
  },
  {
    id: "branding",
    label: "Branding",
    cover: "/Imagenes/icon_5.jpg",
    videos: [
      "/Videos/branding/1.mp4",
      "/Videos/branding/A1.mp4",
      "/Videos/branding/A2.mp4",
      "/Videos/branding/B2.mp4",
      "/Videos/branding/C1.mp4",
      "/Videos/branding/c2.mp4",
      "/Videos/branding/cel.mp4",
    ],
  },
  {
    // La carpeta Artes está vacía en el material original; el story queda sin video.
    id: "artes",
    label: "Artes",
    cover: "/Imagenes/icon_6.jpg",
    videos: [],
  },
];

const socials = [
  { href: "https://www.facebook.com/jorsheloy", icon: "/Imagenes/icon_7.png", alt: "Facebook" },
  { href: "https://www.instagram.com/eloy_walls/", icon: "/Imagenes/icon_8.png", alt: "Instagram" },
  { href: "https://www.linkedin.com/in/eloy-walls-6490832b3/", icon: "/Imagenes/icon_9.png", alt: "LinkedIn" },
  { href: "https://www.tiktok.com/@eloy_walls", icon: "/Imagenes/icon_10.png", alt: "TikTok" },
];

const sections = [
  {
    title: "Servicios",
    lines: [
      "• Desarrollo integral de branding y diseño estratégico.",
      "• Entrenamiento y personalización de neuronas IA para empresas.",
      "• Implementación de soluciones basadas en inteligencia artificial.",
      "• Creación y administración de campañas con KPIs orientadas a resultados.",
      "• Estudios de mercado, análisis de data points y diagnóstico comercial.",
    ],
  },
  {
    title: "Estudios",
    lines: [
      "Licenciatura en Medios Interactivos — formación creativa y tecnológica orientada al diseño, desarrollo digital y soluciones interactivas.",
      "Licenciatura en Derecho — enfoque en contratos, conciliación mercantil y análisis normativo aplicado a negocios.",
    ],
  },
  {
    title: "Experiencia Profesional",
    lines: [
      "Experiencia en diseño digital, producción publicitaria, campañas de marketing, gestión creativa y optimización de procesos para marcas y negocios.",
    ],
  },
  {
    title: "Trayectoria Emprendedora",
    lines: [
      "Fundación de múltiples proyectos enfocados en innovación, transformación digital, optimización de procesos y estrategias para negocios emergentes.",
    ],
  },
  {
    title: "Desarrollo Autónomo",
    lines: [
      "Desarrollo de automatizaciones inteligentes, creación de agentes especializados, modelos de flujo y sistemas orientados a eficiencia operativa.",
    ],
  },
  {
    title: "Experiencia en IA",
    lines: [
      "Dominio en modelos de IA, generación avanzada de imágenes, entrenamiento de agentes inteligentes, administración de servidores y pipelines de automatización.",
    ],
  },
  {
    title: "Conferencias",
    lines: [
      "Charlas y capacitaciones sobre marketing estratégico, inteligencia artificial, liderazgo creativo, innovación y metodologías de crecimiento.",
    ],
  },
  {
    title: "Habilidades",
    lines: [
      "Habilidades en liderazgo efectivo, comunicación estratégica, creatividad aplicada, dirección de equipos multidisciplinarios y resolución de problemas.",
    ],
  },
  {
    title: "Habilidades Técnicas",
    lines: [
      "Manejo profesional de HTML, CSS, JavaScript, modelado 3D, Adobe Suite, IA aplicada, pipelines creativos y herramientas para optimización digital.",
    ],
  },
  {
    title: "Software y Tecnologías",
    lines: [
      "Experiencia con Adobe Suite, Meta Ads, Google Ads, herramientas de IA, sistemas de automatización, analítica comercial y ecosistemas multimediales.",
    ],
  },
];

const VCARD =
  "data:text/vcard;charset=utf-8,BEGIN%3AVCARD%0AVERSION%3A3.0%0AFN%3AEloy%20Walls%0AORG%3AAgencia%20Dreamoun%0ATITLE%3ACEO%20y%20Director%20Creativo%0ATEL%3BTYPE%3ACELL%3A%2B524171033804%0AEND%3AVCARD";

// Foto de perfil como tarjeta que gira: alterna la foto y video(s) (muteados).
// Para sumar más videos, agrégalos al array y el flip mostrará "el siguiente".
// Cada video usa .webm (ligero, Chrome/Firefox/Edge) con fallback .MOV (Safari).
const PROFILE_MEDIA = [
  { type: "image", src: "/Imagenes/428646700_2628303167349157_8166977006435626776_n.jpg" },
  { type: "video", sources: ["/perfil/IMG_1327.webm", "/perfil/IMG_1327.MOV"] },
  { type: "video", sources: ["/perfil/IMG_1329.webm", "/perfil/IMG_1329.MOV"] },
];
const HALF = 260; // ms de medio giro (coincide con la transición CSS de .perfilInner)
// Los primeros giros son rápidos (dinámicos) y luego el intervalo se va ampliando
// para que la foto no esté girando constantemente.
const FLIP_SCHEDULE = [4000, 4000, 4000, 8000, 15000, 26000, 40000];

export default function ContactPage() {
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
  const [currentMedia, setCurrentMedia] = useState(PROFILE_MEDIA[0]);
  const [rot, setRot] = useState(0);
  const [spin, setSpin] = useState(true);
  const profileIdxRef = useRef(0);
  const isFlippingRef = useRef(false);
  const autoTimerRef = useRef(null);
  const autoIdxRef = useRef(0);

  // Ejecuta un giro cambiando el medio "de canto" (90°, invisible).
  // Devuelve false si ya hay un giro en curso.
  const flip = useCallback(() => {
    const n = PROFILE_MEDIA.length;
    if (n < 2 || isFlippingRef.current) return false;
    isFlippingRef.current = true;
    setSpin(true);
    setRot(90); // gira hasta el canto
    setTimeout(() => {
      profileIdxRef.current = (profileIdxRef.current + 1) % n;
      setCurrentMedia(PROFILE_MEDIA[profileIdxRef.current]);
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
  }, []);

  // Programa el próximo giro automático con intervalo creciente (FLIP_SCHEDULE).
  const scheduleNext = useCallback(() => {
    if (PROFILE_MEDIA.length < 2) return;
    clearTimeout(autoTimerRef.current);
    const i = Math.min(autoIdxRef.current, FLIP_SCHEDULE.length - 1);
    autoTimerRef.current = setTimeout(() => {
      flip();
      autoIdxRef.current += 1;
      scheduleNext();
    }, FLIP_SCHEDULE[i]);
  }, [flip]);

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
    media.type === "video" ? (
      <video
        muted
        autoPlay
        loop
        playsInline
        ref={(el) => {
          if (el) el.muted = true; // asegura autoplay sin sonido
        }}
      >
        {media.sources.map((src) => (
          <source
            key={src}
            src={src}
            type={src.endsWith(".webm") ? "video/webm" : "video/quicktime"}
          />
        ))}
      </video>
    ) : (
      <img src={media.src} alt="Eloy Walls" />
    );

  const toggleSection = (index) =>
    setOpenSection((current) => (current === index ? null : index));

  const openStory = (index) => {
    const vids = stories[index].videos;
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
    while (ni < stories.length && stories[ni].videos.length === 0) ni += 1;
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
          <div className={styles.name}>Eloy Walls</div>
          <div className={styles.role}>CEO / Director Creativo</div>

          <a
            className={styles.btnPurple}
            href="https://www.instagram.com/dreamoun_agencia"
            target="_blank"
            rel="noopener noreferrer"
          >
            dreamoun.&amp;Co.
          </a>
          <p className={styles.descAgencia}>
            Agencia creativa y tecnológica enfocada en potenciar marcas mediante diseño,
            IA, automatización y estrategias basadas en Data Point.
          </p>

          {/* STORIES */}
          <div className={styles.storiesRow}>
            {stories.map((story, index) => (
              <button
                key={story.id}
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

          <p className={styles.asesoria}>Agendar asesoría</p>
          <a
            className={styles.btnGreen}
            href="https://wa.me/524171033804"
            target="_blank"
            rel="noopener noreferrer"
          >
            Whatsapp
          </a>

          <a className={styles.btnContact} href={VCARD} download="EloyWalls.vcf">
            Guardar contacto 📱
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
                  {section.lines.map((line, i) => (
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

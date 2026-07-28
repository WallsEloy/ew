"use client";

import { useEffect, useRef, useState } from "react";
import { moduloVideo } from "../data/moduloVideo";
import { fuenteElegida } from "../data/videosHome";
import { alAcercarse, conexionLimitada } from "../lib/conexion";
import styles from "./VideoModulo.module.css";

/*
 * Módulo de vídeo del Home, debajo del carrusel.
 *
 * El vídeo es el fondo a sangre; encima van el texto y una placa de ficha con
 * los datos de la pieza (mismo lenguaje que la ficha técnica del reverso de las
 * tarjetas de Galería). El contenido se edita en data/moduloVideo.js y los
 * colores en el bloque de variables de VideoModulo.module.css.
 *
 * Comportamientos que no se ven en el marcado:
 * - La entrada se dispara al asomar en pantalla (IntersectionObserver), no al
 *   cargar la página: si no, la animación se pierde antes de que nadie la vea.
 * - Con "reducir movimiento" activado el vídeo no se reproduce: se queda en el
 *   póster, que es el mismo fotograma con el que arranca.
 * - El sonido va ACTIVO por defecto. Ningún navegador deja arrancar un vídeo con
 *   audio sin permiso, así que se intenta sin silencio y, si lo bloquean, el
 *   vídeo empieza mudo y el audio entra en el primer gesto del visitante (que es
 *   lo que el navegador considera permiso). Si alguien silencia a mano, se
 *   recuerda su decisión y ya no se le vuelve a activar.
 * - La onda de debajo del botón dibuja el audio REAL del vídeo (Web Audio), no
 *   una animación decorativa: si está en silencio, la línea se queda plana.
 * - El vídeo NO se pide hasta que el bloque se acerca a la pantalla, y con línea
 *   mala o ahorro de datos no se pide nunca: se queda el póster. Son 2,5 MB que
 *   en una conexión pobre bloquearían el resto de la página.
 */
const CLAVE_SONIDO = "moduloVideo:sonido";
export default function VideoModulo({ config }) {
  // La config llega del dashboard (site_settings). Sin ella, los valores del
  // archivo de datos, que es lo que se ve sin Supabase.
  // fuenteElegida resuelve el interruptor comprimida/original del dashboard
  const { video, poster, logo, antetitulo, titulo, texto, ficha } = config
    ? { ...config, video: fuenteElegida(config) }
    : moduloVideo;
  const seccionRef = useRef(null);
  const videoRef = useRef(null);
  const [dentro, setDentro] = useState(false);
  const [enPausa, setEnPausa] = useState(false);
  const [sinMovimiento, setSinMovimiento] = useState(false);
  const [conSonido, setConSonido] = useState(false);
  const [aLaVista, setALaVista] = useState(false);
  // Fuente del vídeo: null hasta que el bloque se acerca (y nunca con línea mala)
  const [fuente, setFuente] = useState(null);
  // Si el visitante pausa a mano, volver a la sección no debe reanudarlo
  const pausadoPorUsuario = useRef(false);
  // Onda: lienzo y cadena de Web Audio (fuente → ganancia → analizador → salida)
  const ondaRef = useRef(null);
  const audioRef = useRef({ ctx: null, analizador: null, ganancia: null });

  /*
   * Un mismo observador para dos cosas: disparar la entrada (una vez) y saber si
   * el módulo está a la vista. Lo segundo importa por el sonido: fuera de
   * pantalla el vídeo se pausa, porque si no seguiría sonando cuando el botón de
   * silenciar ya no está al alcance —y de paso deja de consumir batería—.
   */
  useEffect(() => {
    const seccion = seccionRef.current;
    if (!seccion) return undefined;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) setDentro(true);
        setALaVista(entrada.isIntersecting);
      },
      { threshold: 0.25 },
    );
    observador.observe(seccion);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || sinMovimiento) return;

    if (!aLaVista) {
      v.pause();
    } else if (!pausadoPorUsuario.current) {
      v.play().catch(() => {});
    }
  }, [aLaVista, sinMovimiento]);

  // Se pide el vídeo sólo al acercarse; con línea limitada se queda el póster
  useEffect(() => {
    if (conexionLimitada()) return undefined;
    return alAcercarse(seccionRef.current, () => setFuente(video), "700px");
  }, [video]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const aplicar = () => {
      setSinMovimiento(media.matches);
      if (media.matches) {
        videoRef.current?.pause();
        setEnPausa(true);
      }
    };
    aplicar();
    media.addEventListener("change", aplicar);
    return () => media.removeEventListener("change", aplicar);
  }, []);

  /*
   * Sonido activo al entrar. El navegador sólo deja arrancar con audio si ya
   * hay "permiso" (visitas previas, interacción con el sitio); si lo rechaza,
   * se reproduce mudo y se espera al primer gesto real —clic, toque o tecla—,
   * que es lo que cuenta como permiso. Un scroll no sirve: los navegadores no
   * lo consideran activación.
   */
  useEffect(() => {
    const v = videoRef.current;
    if (!v || sinMovimiento || !fuente) return undefined;
    if (window.localStorage?.getItem(CLAVE_SONIDO) === "off") return undefined;

    let cancelado = false;
    const gestos = ["pointerdown", "keydown", "touchstart"];

    const conAudio = () => {
      v.muted = false;
      return v.play().then(() => {
        if (cancelado) return;
        montarAudio();
        if (audioRef.current.ganancia) audioRef.current.ganancia.gain.value = 1;
        setConSonido(true);
      });
    };

    const alPrimerGesto = () => {
      conAudio().catch(() => {});
      quitarGestos();
    };

    const quitarGestos = () =>
      gestos.forEach((g) => window.removeEventListener(g, alPrimerGesto));

    conAudio().catch(() => {
      // Bloqueado: arranca mudo y queda a la espera del primer gesto
      v.muted = true;
      v.play().catch(() => {});
      gestos.forEach((g) =>
        window.addEventListener(g, alPrimerGesto, { once: false, passive: true }),
      );
    });

    return () => {
      cancelado = true;
      quitarGestos();
    };
  }, [sinMovimiento, fuente]);

  /*
   * Cadena de audio para la onda. Sólo puede montarse tras un gesto del
   * visitante (los navegadores arrancan el AudioContext suspendido) y una única
   * vez por elemento: createMediaElementSource no admite dos llamadas.
   *
   * La ganancia es la que manda en el silencio: al enrutar el vídeo por Web
   * Audio, apoyarse sólo en video.muted da resultados distintos según el
   * navegador. Con ganancia 0 el analizador lee ceros y la onda queda plana,
   * que es justo lo que debe verse cuando no suena.
   */
  const montarAudio = () => {
    const v = videoRef.current;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!v || !AC || audioRef.current.ctx) return;

    try {
      const ctx = new AC();
      const fuente = ctx.createMediaElementSource(v);
      const ganancia = ctx.createGain();
      const analizador = ctx.createAnalyser();
      analizador.fftSize = 256;
      fuente.connect(ganancia);
      ganancia.connect(analizador);
      analizador.connect(ctx.destination);
      ganancia.gain.value = v.muted ? 0 : 1;
      audioRef.current = { ctx, analizador, ganancia };
      ctx.resume().catch(() => {});
    } catch {
      // Sin Web Audio la onda se queda plana; el sonido sigue funcionando
    }
  };

  // Dibujo de la onda: un bucle mientras el módulo esté a la vista
  useEffect(() => {
    const lienzo = ondaRef.current;
    if (!lienzo) return undefined;

    const ctx2d = lienzo.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const ajustar = () => {
      const { width, height } = lienzo.getBoundingClientRect();
      lienzo.width = Math.max(1, Math.round(width * dpr));
      lienzo.height = Math.max(1, Math.round(height * dpr));
    };
    ajustar();
    window.addEventListener("resize", ajustar);

    let animacion;
    const muestras = new Uint8Array(128);

    const pintar = () => {
      const { analizador } = audioRef.current;
      const w = lienzo.width;
      const h = lienzo.height;
      ctx2d.clearRect(0, 0, w, h);

      if (analizador) analizador.getByteTimeDomainData(muestras);
      else muestras.fill(128); // sin analizador: línea plana

      ctx2d.lineWidth = Math.max(1, 1.4 * dpr);
      ctx2d.strokeStyle = "#ffe7a4"; // --vi-oro-luz
      ctx2d.lineJoin = "round";
      ctx2d.lineCap = "round";
      ctx2d.beginPath();

      // 128 es el cero. La pista es discreta, así que se amplifica para que la
      // onda se lea en 22px de alto, con tope para que no se salga de la caja.
      const AMPLIFICACION = 3.2;
      const punto = (i) => {
        const desvio = ((muestras[i] - 128) / 128) * AMPLIFICACION;
        const acotado = Math.max(-1, Math.min(1, desvio));
        return { x: (i / (muestras.length - 1)) * w, y: h / 2 + acotado * (h / 2 - ctx2d.lineWidth) };
      };

      const p0 = punto(0);
      ctx2d.moveTo(p0.x, p0.y);
      // Curvas entre puntos medios: la línea queda continua en vez de dentada
      for (let i = 1; i < muestras.length - 1; i++) {
        const a = punto(i);
        const b = punto(i + 1);
        ctx2d.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
      }
      ctx2d.stroke();

      animacion = window.requestAnimationFrame(pintar);
    };

    if (aLaVista && !sinMovimiento) pintar();
    else {
      muestras.fill(128);
      pintar();
      window.cancelAnimationFrame(animacion);
    }

    return () => {
      window.cancelAnimationFrame(animacion);
      window.removeEventListener("resize", ajustar);
    };
  }, [aLaVista, sinMovimiento]);

  const alternarSonido = () => {
    const v = videoRef.current;
    if (!v) return;
    const siguiente = v.muted; // si estaba mudo, ahora suena

    if (siguiente) montarAudio(); // el clic es el gesto que permite el AudioContext
    audioRef.current.ctx?.resume().catch(() => {});
    if (audioRef.current.ganancia) {
      audioRef.current.ganancia.gain.value = siguiente ? 1 : 0;
    }

    v.muted = !siguiente;
    setConSonido(siguiente);
    // La decisión manual manda sobre el arranque automático de la próxima visita
    window.localStorage?.setItem(CLAVE_SONIDO, siguiente ? "on" : "off");
    if (siguiente) v.play().catch(() => {});
  };

  const alternarReproduccion = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      pausadoPorUsuario.current = false;
      v.play();
      setEnPausa(false);
    } else {
      pausadoPorUsuario.current = true;
      v.pause();
      setEnPausa(true);
    }
  };

  return (
    <section
      ref={seccionRef}
      className={`${styles.modulo} ${dentro ? styles.dentro : ""}`}
      aria-labelledby="modulo-video-titulo"
    >
      <video
        ref={videoRef}
        className={styles.video}
        src={fuente || undefined}
        poster={poster}
        autoPlay={!sinMovimiento}
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Velo: sin él, el texto de la izquierda compite con la figura */}
      <div className={styles.velo} aria-hidden="true" />

      <div className={styles.contenido}>
        {/* Logotipo que corona los textos; se cambia en el dashboard */}
        {logo && <img src={logo} alt="" className={styles.logo} />}

        <p className={styles.antetitulo}>
          <span className={styles.regla} aria-hidden="true" />
          {antetitulo}
        </p>

        <h2 id="modulo-video-titulo" className={styles.titulo}>
          {titulo}
        </h2>

        <p className={styles.texto}>{texto}</p>
      </div>

      {/* Placa de ficha: los datos de la pieza, como en el reverso de las tarjetas */}
      <dl className={styles.placa}>
        {ficha.map((fila) => (
          <div key={fila.etiqueta} className={styles.placaFila}>
            <dt className={styles.placaEtiqueta}>{fila.etiqueta}</dt>
            <dd className={styles.placaValor}>{fila.valor}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.controles}>
        {/* Sonido: el botón y, debajo, la onda del audio que está sonando */}
        <div className={styles.grupoSonido}>
          {/* Mientras esté mudo el botón se enciende: el navegador exige un gesto
              para dar sonido, así que hay que dejar claro que hay audio y que
              está a un clic. Con sonido, vuelve a ser discreto. */}
          <button
            type="button"
            className={`${styles.control} ${!conSonido ? styles.controlLlamada : ""}`}
            onClick={alternarSonido}
            aria-pressed={conSonido}
            aria-label={conSonido ? "Silenciar el vídeo" : "Activar el sonido del vídeo"}
          >
            {conSonido ? "Silenciar" : "Activar sonido"}
          </button>

          {/* Decorativa: lo que dice ya lo dice el botón */}
          <canvas ref={ondaRef} className={styles.onda} aria-hidden="true" />
        </div>

        <button
          type="button"
          className={styles.control}
          onClick={alternarReproduccion}
          aria-label={enPausa ? "Reproducir el vídeo" : "Pausar el vídeo"}
        >
          {enPausa ? "Reproducir" : "Pausar"}
        </button>
      </div>
    </section>
  );
}

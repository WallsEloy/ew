"use client";

import { useEffect, useState } from "react";
import {
  defaultVideosHome,
  mergeVideosHome,
  makeCapituloVacio,
  makeFichaVacia,
} from "../../data/videosHome";
import { fetchJson } from "../../lib/fetchJson";

const inputCls =
  "box-border w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#00aff0]";
const labelCls = "block text-[11px] uppercase tracking-wide text-gray-400 mb-1";
const btnCls =
  "box-border px-3 py-1.5 rounded text-sm font-medium border border-[#333] bg-[#1a1a1a] text-white hover:bg-[#262626] disabled:opacity-40";
const primaryBtnCls =
  "box-border px-4 py-1.5 rounded text-sm font-bold bg-[#00aff0] text-white hover:opacity-90 disabled:opacity-40";
const cajaCls = "rounded border border-[#242424] bg-[#0d0d0d] p-4";

/*
 * Saca un fotograma del vídeo elegido y lo devuelve como JPEG, además de sus
 * datos. Se hace en el navegador con un <canvas>: el archivo es local (blob),
 * así que el lienzo no queda contaminado y no hace falta ffmpeg en el servidor.
 *
 * El póster importa: es la primera imagen que se ve mientras el vídeo carga y la
 * única que se ve con "reducir movimiento". Si no se regenera al cambiar el
 * vídeo, quedaría el fotograma del anterior.
 */
async function sacarPoster(file, fraccion = 0.5) {
  const url = URL.createObjectURL(file);
  try {
    const v = document.createElement("video");
    v.muted = true;
    v.preload = "auto";
    v.src = url;

    await new Promise((ok, err) => {
      const t = setTimeout(() => err(new Error("el vídeo tardó demasiado en cargar")), 20000);
      v.addEventListener("loadeddata", () => { clearTimeout(t); ok(); }, { once: true });
      v.addEventListener("error", () => { clearTimeout(t); err(new Error("no se pudo leer el vídeo")); }, { once: true });
    });

    await new Promise((ok) => {
      v.addEventListener("seeked", ok, { once: true });
      v.currentTime = (v.duration || 1) * fraccion;
    });

    const lienzo = document.createElement("canvas");
    lienzo.width = v.videoWidth;
    lienzo.height = v.videoHeight;
    lienzo.getContext("2d").drawImage(v, 0, 0);
    const blob = await new Promise((ok) => lienzo.toBlob(ok, "image/jpeg", 0.82));

    return { blob, duracion: v.duration, ancho: v.videoWidth, alto: v.videoHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function subir(archivo, nombre, { recorrible = false } = {}) {
  const fd = new FormData();
  fd.append("file", archivo, nombre);
  fd.append("raw", "true");
  fd.append("folder", "home-videos");
  // El módulo de proceso busca fotogramas con el scroll: los necesita densos
  if (recorrible) fd.append("recorrible", "true");
  // El servidor comprime el vídeo y cuenta cuánto ahorró (ver lib/comprimirVideo)
  return fetchJson("/api/upload", { method: "POST", body: fd });
}

export default function VideosHomeEditor() {
  const [config, setConfig] = useState(defaultVideosHome);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(null); // "video" | "proceso"
  const [configurado, setConfigurado] = useState(true);
  const [sucio, setSucio] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [datos, setDatos] = useState({}); // datos del último vídeo subido

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJson("/api/videos-home");
        if (data?.config) setConfig(mergeVideosHome(data.config));
        setConfigurado(Boolean(data?.configured));
      } catch (err) {
        setMensaje({ tipo: "error", texto: "No se pudo cargar: " + err.message });
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const patch = (bloque, campos) => {
    setConfig((prev) => ({ ...prev, [bloque]: { ...prev[bloque], ...campos } }));
    setSucio(true);
  };

  // Sube el vídeo y, en el mismo paso, su póster recién sacado del propio vídeo
  const cambiarVideo = async (bloque, file) => {
    setSubiendo(bloque);
    setMensaje(null);
    try {
      const { blob, duracion, ancho, alto } = await sacarPoster(file);
      const [video, poster] = await Promise.all([
        subir(file, file.name, { recorrible: bloque === "proceso" }),
        subir(blob, `${file.name.replace(/\.[^.]+$/, "")}-poster.jpg`),
      ]);

      patch(bloque, {
        src: video.url,
        poster: poster.url,
        srcOriginal: video.urlOriginal || "",
        bytes: video.comprimido?.bytesDespues || file.size,
        bytesOriginal: video.comprimido?.bytesAntes || file.size,
      });
      const mb = (b) => Math.round((b / 1024 / 1024) * 100) / 100;
      setDatos((d) => ({
        ...d,
        [bloque]: {
          duracion: Math.round(duracion * 10) / 10,
          medida: `${ancho} × ${alto}`,
          peso: mb(file.size),
          comprimido: video.comprimido
            ? `${mb(video.comprimido.bytesAntes)} → ${mb(video.comprimido.bytesDespues)} MB (−${video.comprimido.ahorro} %)`
            : null,
        },
      }));
      setMensaje({
        tipo: "ok",
        texto: video.comprimido
          ? `Vídeo comprimido y subido con su póster (−${video.comprimido.ahorro} % de peso). Recuerda guardar.`
          : "Vídeo y póster subidos (ya estaba optimizado). Recuerda guardar.",
      });
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    } finally {
      setSubiendo(null);
    }
  };

  const guardar = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      await fetchJson("/api/videos-home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      setSucio(false);
      setMensaje({ tipo: "ok", texto: "Guardado. El home ya muestra los cambios." });
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <p className="text-sm text-gray-400">Cargando…</p>;

  const CampoVideo = ({ bloque, etiqueta, aviso }) => {
    const b = config[bloque];
    const info = datos[bloque];
    const mb = (bytes) => (bytes ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : "—");
    const original = b.calidad === "original";
    const hayOriginal = Boolean(b.srcOriginal);

    return (
      <div className={cajaCls}>
        <p className="text-sm text-gray-300 mb-3">{etiqueta}</p>

        {/* Interruptor de calidad: para comparar en el sitio real cómo se ve
            cada versión. Lo que se guarda aquí es lo que sirve el home. */}
        <div className="mb-4 rounded border border-[#1f1f1f] bg-[#111] p-3">
          <label className={labelCls}>Versión que se reproduce en el sitio</label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={!original ? primaryBtnCls : btnCls}
              aria-pressed={!original}
              onClick={() => patch(bloque, { calidad: "comprimida" })}
            >
              Comprimida · {mb(b.bytes)}
            </button>
            <button
              className={original ? primaryBtnCls : btnCls}
              aria-pressed={original}
              disabled={!hayOriginal}
              title={hayOriginal ? undefined : "No hay copia sin comprimir guardada"}
              onClick={() => patch(bloque, { calidad: "original" })}
            >
              Original · {mb(b.bytesOriginal)}
            </button>
            {b.bytes && b.bytesOriginal ? (
              <span className="text-[11px] text-gray-500">
                la comprimida pesa un{" "}
                {Math.round(100 - (100 * b.bytes) / b.bytesOriginal)} % menos
              </span>
            ) : null}
          </div>

          {original && bloque === "proceso" && (
            <p className="mt-2 text-xs text-amber-300">
              La original no lleva fotogramas clave densos, así que el recorrido con
              el scroll irá a saltos. Es normal: es lo que se está comparando.
            </p>
          )}
          {!hayOriginal && (
            <p className="mt-2 text-xs text-gray-500">
              Sube un vídeo para que se guarde también su copia sin comprimir.
            </p>
          )}
        </div>

        <label className={labelCls}>
          Vídeo comprimido (ruta o URL)
        </label>
        <input
          className={inputCls}
          value={b.src}
          placeholder="/Videos/… o https://…"
          onChange={(e) => patch(bloque, { src: e.target.value })}
        />

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className={`${btnCls} cursor-pointer ${subiendo === bloque ? "opacity-40" : ""}`}>
            {subiendo === bloque ? "Subiendo…" : "Subir vídeo ↑"}
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              disabled={subiendo === bloque}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) cambiarVideo(bloque, f);
                e.target.value = "";
              }}
            />
          </label>
          <span className="text-[11px] text-gray-500">
            MP4 (H.264) o WebM · máx. 60 MB · el póster se genera solo
          </span>
        </div>

        {info && (
          <p className="mt-2 text-xs text-gray-400">
            Subido: {info.medida} · {info.duracion} s · {info.peso} MB
            {info.comprimido && (
              <span className="text-emerald-300"> · comprimido {info.comprimido}</span>
            )}
          </p>
        )}
        {aviso && info && info.duracion > 20 && (
          <p className="mt-2 text-xs text-amber-300">{aviso}</p>
        )}

        <div className="mt-3">
          <label className={labelCls}>Copia sin comprimir (ruta o URL)</label>
          <input
            className={inputCls}
            value={b.srcOriginal}
            placeholder="/Videos/…/originales/…"
            onChange={(e) => patch(bloque, { srcOriginal: e.target.value })}
          />
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className={labelCls}>Póster (se regenera al subir vídeo)</label>
            <input
              className={inputCls}
              value={b.poster}
              placeholder="/Videos/…/poster.jpg"
              onChange={(e) => patch(bloque, { poster: e.target.value })}
            />
          </div>
          <div className="rounded border border-[#222] bg-[#6b7280] h-20 w-36 overflow-hidden flex items-center justify-center">
            {b.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.poster} alt="Póster" className="max-h-20 max-w-full object-contain" />
            ) : (
              <span className="text-black/60 text-xs">sin póster</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashRoot flex flex-col gap-4">
      {!configurado && (
        <p className="rounded border border-amber-800 bg-amber-950/40 px-3 py-2 text-sm text-amber-200">
          Supabase no está configurado: se ven los valores por defecto y no se
          puede guardar.
        </p>
      )}

      {mensaje && (
        <p
          className={`rounded px-3 py-2 text-sm ${
            mensaje.tipo === "ok"
              ? "border border-emerald-800 bg-emerald-950/40 text-emerald-200"
              : "border border-red-900 bg-red-950/40 text-red-200"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      {/* ---------------- Módulo de vídeo ---------------- */}
      <CampoVideo
        bloque="video"
        etiqueta="Módulo de vídeo (se reproduce en bucle, con sonido y onda)"
      />

      <div className={cajaCls}>
        <p className="text-sm text-gray-300 mb-3">Textos del módulo de vídeo</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Antetítulo</label>
            <input
              className={inputCls}
              value={config.video.antetitulo}
              onChange={(e) => patch("video", { antetitulo: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Título</label>
            <input
              className={inputCls}
              value={config.video.titulo}
              onChange={(e) => patch("video", { titulo: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Texto</label>
            <textarea
              className={`${inputCls} h-24 resize-y`}
              value={config.video.texto}
              onChange={(e) => patch("video", { texto: e.target.value })}
            />
          </div>
        </div>

        <p className="text-[11px] uppercase tracking-wide text-gray-400 mt-4 mb-2">
          Placa de ficha
        </p>
        <div className="flex flex-col gap-2">
          {config.video.ficha.map((f, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto] gap-2">
              <input
                className={inputCls}
                value={f.etiqueta}
                placeholder="Formato"
                onChange={(e) => {
                  const ficha = [...config.video.ficha];
                  ficha[i] = { ...ficha[i], etiqueta: e.target.value };
                  patch("video", { ficha });
                }}
              />
              <input
                className={inputCls}
                value={f.valor}
                placeholder="1280 × 720 · 10 s en bucle"
                onChange={(e) => {
                  const ficha = [...config.video.ficha];
                  ficha[i] = { ...ficha[i], valor: e.target.value };
                  patch("video", { ficha });
                }}
              />
              <button
                className={btnCls}
                onClick={() =>
                  patch("video", { ficha: config.video.ficha.filter((_, j) => j !== i) })
                }
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            className={btnCls}
            onClick={() => patch("video", { ficha: [...config.video.ficha, makeFichaVacia()] })}
          >
            Añadir fila +
          </button>
        </div>
      </div>

      {/* ---------------- Módulo de proceso ---------------- */}
      <CampoVideo
        bloque="proceso"
        etiqueta="Módulo de proceso (el vídeo se recorre con el scroll)"
        aviso="Este vídeo se recorre con el scroll: por encima de ~20 s el avance se nota a saltos. Lo ideal son 8–15 s."
      />

      <div className={cajaCls}>
        <p className="text-sm text-gray-300 mb-1">Textos del recorrido</p>
        <p className="text-xs text-gray-500 mb-3">
          Cada texto ocupa una pantalla de scroll: si añades uno, la sección se
          alarga sola.
        </p>

        <div className="flex flex-col gap-3">
          {config.proceso.capitulos.map((c, i) => (
            <div key={i} className="rounded border border-[#1f1f1f] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wide text-gray-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <button
                  className={btnCls}
                  disabled={config.proceso.capitulos.length <= 1}
                  onClick={() =>
                    patch("proceso", {
                      capitulos: config.proceso.capitulos.filter((_, j) => j !== i),
                    })
                  }
                >
                  Quitar
                </button>
              </div>
              <input
                className={`${inputCls} mb-2`}
                value={c.titulo}
                placeholder="Título del capítulo"
                onChange={(e) => {
                  const capitulos = [...config.proceso.capitulos];
                  capitulos[i] = { ...capitulos[i], titulo: e.target.value };
                  patch("proceso", { capitulos });
                }}
              />
              <textarea
                className={`${inputCls} h-20 resize-y`}
                value={c.texto}
                placeholder="Una línea que acompañe al título"
                onChange={(e) => {
                  const capitulos = [...config.proceso.capitulos];
                  capitulos[i] = { ...capitulos[i], texto: e.target.value };
                  patch("proceso", { capitulos });
                }}
              />
            </div>
          ))}
          <button
            className={btnCls}
            onClick={() =>
              patch("proceso", {
                capitulos: [...config.proceso.capitulos, makeCapituloVacio()],
              })
            }
          >
            Añadir texto +
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Texto del botón</label>
            <input
              className={inputCls}
              value={config.proceso.boton.texto}
              onChange={(e) =>
                patch("proceso", { boton: { ...config.proceso.boton, texto: e.target.value } })
              }
            />
          </div>
          <div>
            <label className={labelCls}>Destino del botón</label>
            <input
              className={inputCls}
              value={config.proceso.boton.href}
              placeholder="/diseno"
              onChange={(e) =>
                patch("proceso", { boton: { ...config.proceso.boton, href: e.target.value } })
              }
            />
          </div>
        </div>
      </div>

      {/* Barra pegada al pie: el formulario es largo y el botón de guardar tiene
          que estar a mano sin bajar hasta el fondo. */}
      <div className="sticky bottom-0 z-10 -mx-1 flex items-center gap-3 border-t border-[#242424] bg-[#0a0a0a]/95 px-1 py-3 backdrop-blur">
        <button
          className={primaryBtnCls}
          onClick={guardar}
          disabled={guardando || !configurado}
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
        {sucio ? (
          <span className="text-xs text-amber-300">Cambios sin guardar</span>
        ) : (
          <span className="text-xs text-gray-500">Todo guardado</span>
        )}
      </div>
    </div>
  );
}

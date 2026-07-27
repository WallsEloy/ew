"use client";

import { useEffect, useState } from "react";

import {
  makeBlankRed,
  makeBlankSeccion,
  makeBlankStory,
} from "../../data/contactoConfig";
import { fetchJson } from "../../lib/fetchJson";

const inputCls =
  "box-border w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#00aff0]";
const labelCls = "block text-[11px] uppercase tracking-wide text-gray-400 mb-1";
const btnCls =
  "box-border px-3 py-1.5 rounded text-sm font-medium border border-[#333] bg-[#1a1a1a] text-white hover:bg-[#262626] disabled:opacity-40";
const primaryBtnCls =
  "box-border px-4 py-1.5 rounded text-sm font-bold bg-[#00aff0] text-white hover:opacity-90 disabled:opacity-40";
const dangerBtnCls =
  "box-border px-3 py-1.5 rounded text-sm font-medium border border-red-900 bg-red-950/50 text-red-200 hover:bg-red-900/50 disabled:opacity-40";
const cardCls = "box-border rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-4";

// Una línea por renglón, tanto para los textos de los acordeones como para los
// videos de un story o las fuentes de un video de perfil.
const aLineas = (texto) =>
  String(texto || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

// Campo de imagen con subida (se convierte a WebP salvo que sea raw)
function CampoImagen({ label, value, uploading, hint, onUrl, onUpload, raw }) {
  return (
    <div className="flex flex-col gap-2">
      <label className={labelCls}>{label}</label>
      <input
        className={inputCls}
        value={value ?? ""}
        placeholder="/ruta o https://…"
        onChange={(e) => onUrl(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <label className={`${btnCls} cursor-pointer ${uploading ? "opacity-40" : ""}`}>
          {uploading ? "Subiendo…" : "Subir ↑"}
          <input
            type="file"
            accept={raw ? "image/svg+xml,image/png,image/jpeg,image/webp,image/gif" : "image/*"}
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
        </label>
        <span className="text-[11px] text-gray-500">{hint}</span>
      </div>
      <div className="rounded border border-[#222] bg-[#151515] flex items-center justify-center h-20 overflow-hidden">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="max-h-20 max-w-full object-contain" />
        ) : (
          <span className="text-xs text-gray-500">sin imagen</span>
        )}
      </div>
    </div>
  );
}

export default function ContactoEditor() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJson("/api/contacto-config");
        setConfig(data.config);
      } catch (err) {
        setMessage({ type: "error", text: err.message });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const patch = (parche) => {
    setConfig((prev) => ({ ...prev, ...parche }));
    setDirty(true);
  };

  const patchGrupo = (grupo, parche) => {
    setConfig((prev) => ({ ...prev, [grupo]: { ...prev[grupo], ...parche } }));
    setDirty(true);
  };

  // Utilidades para las listas (stories, redes, secciones, medios de perfil)
  const patchLista = (clave, index, parche) =>
    patch({
      [clave]: config[clave].map((item, i) =>
        i === index ? { ...item, ...parche } : item,
      ),
    });

  const quitarDeLista = (clave, index) =>
    patch({ [clave]: config[clave].filter((_, i) => i !== index) });

  const moverEnLista = (clave, index, dir) => {
    const destino = index + dir;
    if (destino < 0 || destino >= config[clave].length) return;
    const copia = [...config[clave]];
    [copia[index], copia[destino]] = [copia[destino], copia[index]];
    patch({ [clave]: copia });
  };

  const subir = async (key, file, { raw = false, onUrl }) => {
    setUploadingKey(key);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "contacto");
      if (raw) fd.append("raw", "true");
      const data = await fetchJson("/api/upload", { method: "POST", body: fd });
      onUrl(data.url);
      setMessage({ type: "ok", text: "Archivo subido. Recuerda guardar." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploadingKey(null);
    }
  };

  const guardar = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const data = await fetchJson("/api/contacto-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      setConfig(data.config);
      setDirty(false);
      setMessage({ type: "ok", text: "Contacto guardado." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400">Cargando…</p>;
  if (!config) return <p className="text-gray-400">No se pudo cargar la configuración.</p>;

  return (
    <div className="text-white flex flex-col gap-4">
      {message && (
        <div
          className={`rounded px-4 py-3 text-sm border ${
            message.type === "ok"
              ? "border-green-700 bg-green-950/40 text-green-200"
              : "border-red-700 bg-red-950/40 text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Barra de guardado, siempre visible arriba */}
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-[#0a0a0a]/95 py-2">
        {dirty ? (
          <span className="text-[11px] text-amber-400">● cambios sin guardar</span>
        ) : (
          <span className="text-[11px] text-gray-500">todo guardado</span>
        )}
        <div className="flex-1" />
        <button
          className={dirty ? primaryBtnCls : btnCls}
          onClick={guardar}
          disabled={saving}
        >
          {saving ? "Guardando…" : "Guardar contacto"}
        </button>
      </div>

      {/* --- Perfil --- */}
      <section className={cardCls}>
        <h2 className="text-sm font-bold text-gray-300 mb-3">Perfil</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className={labelCls}>Nombre</label>
            <input
              className={inputCls}
              value={config.perfil.nombre ?? ""}
              onChange={(e) => patchGrupo("perfil", { nombre: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Rol</label>
            <input
              className={inputCls}
              value={config.perfil.rol ?? ""}
              onChange={(e) => patchGrupo("perfil", { rol: e.target.value })}
            />
          </div>
        </div>

        <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">
          Medios de la foto giratoria
        </p>
        <div className="flex flex-col gap-3">
          {config.perfil.medios.map((medio, i) => (
            <div key={i} className="rounded border border-[#242424] bg-[#0a0a0a] p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] text-gray-500">#{i + 1}</span>
                <button
                  className={medio.type === "video" ? primaryBtnCls : btnCls}
                  onClick={() =>
                    patch({
                      perfil: {
                        ...config.perfil,
                        medios: config.perfil.medios.map((m, j) =>
                          j === i
                            ? m.type === "video"
                              ? { type: "image", src: "" }
                              : { type: "video", sources: [] }
                            : m,
                        ),
                      },
                    })
                  }
                >
                  {medio.type === "video" ? "Video" : "Imagen"}
                </button>
                <div className="flex-1" />
                <button
                  className={btnCls}
                  onClick={() =>
                    patch({
                      perfil: {
                        ...config.perfil,
                        medios: (() => {
                          const c = [...config.perfil.medios];
                          if (i === 0) return c;
                          [c[i - 1], c[i]] = [c[i], c[i - 1]];
                          return c;
                        })(),
                      },
                    })
                  }
                  disabled={i === 0}
                  aria-label="Subir"
                >
                  ↑
                </button>
                <button
                  className={dangerBtnCls}
                  onClick={() =>
                    patch({
                      perfil: {
                        ...config.perfil,
                        medios: config.perfil.medios.filter((_, j) => j !== i),
                      },
                    })
                  }
                >
                  Quitar
                </button>
              </div>

              {medio.type === "video" ? (
                <div>
                  <label className={labelCls}>
                    Fuentes del video (una por línea: .webm y .MOV)
                  </label>
                  <textarea
                    className={`${inputCls} min-h-[70px] resize-y`}
                    value={(medio.sources || []).join("\n")}
                    placeholder={"/perfil/video.webm\n/perfil/video.MOV"}
                    onChange={(e) =>
                      patch({
                        perfil: {
                          ...config.perfil,
                          medios: config.perfil.medios.map((m, j) =>
                            j === i ? { ...m, sources: aLineas(e.target.value) } : m,
                          ),
                        },
                      })
                    }
                  />
                </div>
              ) : (
                <CampoImagen
                  label="Foto"
                  value={medio.src}
                  uploading={uploadingKey === `perfil-${i}`}
                  hint="Se convierte a WebP"
                  onUrl={(v) =>
                    patch({
                      perfil: {
                        ...config.perfil,
                        medios: config.perfil.medios.map((m, j) =>
                          j === i ? { ...m, src: v } : m,
                        ),
                      },
                    })
                  }
                  onUpload={(file) =>
                    subir(`perfil-${i}`, file, {
                      onUrl: (url) =>
                        patch({
                          perfil: {
                            ...config.perfil,
                            medios: config.perfil.medios.map((m, j) =>
                              j === i ? { ...m, src: url } : m,
                            ),
                          },
                        }),
                    })
                  }
                />
              )}
            </div>
          ))}
          <div>
            <button
              className={btnCls}
              onClick={() =>
                patch({
                  perfil: {
                    ...config.perfil,
                    medios: [...config.perfil.medios, { type: "image", src: "" }],
                  },
                })
              }
            >
              + Añadir medio
            </button>
          </div>
        </div>
      </section>

      {/* --- Agencia --- */}
      <section className={cardCls}>
        <h2 className="text-sm font-bold text-gray-300 mb-3">Botón de agencia</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Texto</label>
            <input
              className={inputCls}
              value={config.agencia.label ?? ""}
              onChange={(e) => patchGrupo("agencia", { label: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Enlace</label>
            <input
              className={inputCls}
              value={config.agencia.href ?? ""}
              onChange={(e) => patchGrupo("agencia", { href: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Descripción</label>
            <textarea
              className={`${inputCls} min-h-[70px] resize-y`}
              value={config.agencia.descripcion ?? ""}
              onChange={(e) => patchGrupo("agencia", { descripcion: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* --- Stories --- */}
      <section className={cardCls}>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-bold text-gray-300">Historias</h2>
          <span className="text-[11px] text-gray-500">
            {config.stories.length} categorías
          </span>
          <div className="flex-1" />
          <button
            className={btnCls}
            onClick={() => patch({ stories: [...config.stories, makeBlankStory()] })}
          >
            + Añadir historia
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {config.stories.map((story, i) => (
            <div key={i} className="rounded border border-[#242424] bg-[#0a0a0a] p-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] text-gray-500">#{i + 1}</span>
                <span className="text-sm text-gray-300">
                  {story.label || "Sin nombre"}
                </span>
                <span className="text-[11px] text-gray-500">
                  {(story.videos || []).length} videos
                </span>
                <div className="flex-1" />
                <button
                  className={btnCls}
                  onClick={() => moverEnLista("stories", i, -1)}
                  disabled={i === 0}
                  aria-label="Subir"
                >
                  ↑
                </button>
                <button
                  className={btnCls}
                  onClick={() => moverEnLista("stories", i, 1)}
                  disabled={i === config.stories.length - 1}
                  aria-label="Bajar"
                >
                  ↓
                </button>
                <button
                  className={dangerBtnCls}
                  onClick={() => quitarDeLista("stories", i)}
                >
                  Quitar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
                <CampoImagen
                  label="Portada"
                  value={story.cover}
                  uploading={uploadingKey === `story-${i}`}
                  hint="Se convierte a WebP"
                  onUrl={(v) => patchLista("stories", i, { cover: v })}
                  onUpload={(file) =>
                    subir(`story-${i}`, file, {
                      onUrl: (url) => patchLista("stories", i, { cover: url }),
                    })
                  }
                />
                <div className="flex flex-col gap-3">
                  <div>
                    <label className={labelCls}>Nombre</label>
                    <input
                      className={inputCls}
                      value={story.label ?? ""}
                      onChange={(e) =>
                        patchLista("stories", i, { label: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Videos (una ruta por línea)</label>
                    <textarea
                      className={`${inputCls} min-h-[90px] resize-y`}
                      value={(story.videos || []).join("\n")}
                      placeholder={"/Videos/Proyectos/uno.mp4\n/Videos/Proyectos/dos.mp4"}
                      onChange={(e) =>
                        patchLista("stories", i, { videos: aLineas(e.target.value) })
                      }
                    />
                    <span className="text-[11px] text-gray-500">
                      Sin videos, la historia se ve pero no abre nada.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Redes --- */}
      <section className={cardCls}>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-bold text-gray-300">Redes sociales</h2>
          <div className="flex-1" />
          <button
            className={btnCls}
            onClick={() => patch({ redes: [...config.redes, makeBlankRed()] })}
          >
            + Añadir red
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {config.redes.map((red, i) => (
            <div key={i} className="rounded border border-[#242424] bg-[#0a0a0a] p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-300">{red.alt || `Red ${i + 1}`}</span>
                <div className="flex-1" />
                <button
                  className={btnCls}
                  onClick={() => moverEnLista("redes", i, -1)}
                  disabled={i === 0}
                  aria-label="Subir"
                >
                  ↑
                </button>
                <button
                  className={btnCls}
                  onClick={() => moverEnLista("redes", i, 1)}
                  disabled={i === config.redes.length - 1}
                  aria-label="Bajar"
                >
                  ↓
                </button>
                <button
                  className={dangerBtnCls}
                  onClick={() => quitarDeLista("redes", i)}
                >
                  Quitar
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className={labelCls}>Nombre</label>
                  <input
                    className={inputCls}
                    value={red.alt ?? ""}
                    placeholder="Instagram"
                    onChange={(e) => patchLista("redes", i, { alt: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Enlace</label>
                  <input
                    className={inputCls}
                    value={red.href ?? ""}
                    onChange={(e) => patchLista("redes", i, { href: e.target.value })}
                  />
                </div>
                <CampoImagen
                  label="Icono"
                  value={red.icon}
                  raw
                  uploading={uploadingKey === `red-${i}`}
                  hint="Sin convertir (PNG/SVG)"
                  onUrl={(v) => patchLista("redes", i, { icon: v })}
                  onUpload={(file) =>
                    subir(`red-${i}`, file, {
                      raw: true,
                      onUrl: (url) => patchLista("redes", i, { icon: url }),
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Asesoría y contacto --- */}
      <section className={cardCls}>
        <h2 className="text-sm font-bold text-gray-300 mb-3">Asesoría y contacto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className={labelCls}>Título</label>
            <input
              className={inputCls}
              value={config.asesoria.titulo ?? ""}
              onChange={(e) => patchGrupo("asesoria", { titulo: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Texto del botón</label>
            <input
              className={inputCls}
              value={config.asesoria.label ?? ""}
              onChange={(e) => patchGrupo("asesoria", { label: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Enlace (WhatsApp)</label>
            <input
              className={inputCls}
              value={config.asesoria.href ?? ""}
              onChange={(e) => patchGrupo("asesoria", { href: e.target.value })}
            />
          </div>
        </div>

        <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">
          Tarjeta de contacto (.vcf que se descarga)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Texto del botón</label>
            <input
              className={inputCls}
              value={config.vcard.label ?? ""}
              onChange={(e) => patchGrupo("vcard", { label: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Nombre</label>
            <input
              className={inputCls}
              value={config.vcard.nombre ?? ""}
              onChange={(e) => patchGrupo("vcard", { nombre: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Organización</label>
            <input
              className={inputCls}
              value={config.vcard.organizacion ?? ""}
              onChange={(e) => patchGrupo("vcard", { organizacion: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Puesto</label>
            <input
              className={inputCls}
              value={config.vcard.puesto ?? ""}
              onChange={(e) => patchGrupo("vcard", { puesto: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Teléfono</label>
            <input
              className={inputCls}
              value={config.vcard.telefono ?? ""}
              placeholder="+524171033804"
              onChange={(e) => patchGrupo("vcard", { telefono: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* --- Acordeones --- */}
      <section className={cardCls}>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-bold text-gray-300">Acordeones</h2>
          <span className="text-[11px] text-gray-500">
            {config.secciones.length} secciones
          </span>
          <div className="flex-1" />
          <button
            className={btnCls}
            onClick={() =>
              patch({ secciones: [...config.secciones, makeBlankSeccion()] })
            }
          >
            + Añadir sección
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {config.secciones.map((seccion, i) => (
            <div key={i} className="rounded border border-[#242424] bg-[#0a0a0a] p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] text-gray-500">#{i + 1}</span>
                <div className="flex-1" />
                <button
                  className={btnCls}
                  onClick={() => moverEnLista("secciones", i, -1)}
                  disabled={i === 0}
                  aria-label="Subir"
                >
                  ↑
                </button>
                <button
                  className={btnCls}
                  onClick={() => moverEnLista("secciones", i, 1)}
                  disabled={i === config.secciones.length - 1}
                  aria-label="Bajar"
                >
                  ↓
                </button>
                <button
                  className={dangerBtnCls}
                  onClick={() => quitarDeLista("secciones", i)}
                >
                  Quitar
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className={labelCls}>Título</label>
                  <input
                    className={inputCls}
                    value={seccion.title ?? ""}
                    onChange={(e) =>
                      patchLista("secciones", i, { title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Contenido (una línea por renglón)</label>
                  <textarea
                    className={`${inputCls} min-h-[110px] resize-y`}
                    value={(seccion.lines || []).join("\n")}
                    onChange={(e) =>
                      patchLista("secciones", i, { lines: aLineas(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

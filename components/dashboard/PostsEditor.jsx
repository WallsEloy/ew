"use client";

import { useEffect, useState } from "react";

import { FICHA_CAMPOS } from "../../lib/fichaCampos";
import {
  LOGOS_REVERSO,
  LOGO_REVERSO_DEFECTO,
  normalizarLogoReverso,
} from "../../lib/logosReverso";
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

// Convierte "uno, dos" → ["uno","dos"] y al revés lo hace el servidor
function parseEtiquetas(texto) {
  return String(texto || "")
    .split(",")
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean);
}

export default function PostsEditor({ collectionId, section = "diseno" }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [hidingId, setHidingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [dirty, setDirty] = useState(() => new Set());
  const [flashId, setFlashId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const data = await fetchJson(
          `/api/portfolio/projects?collectionId=${collectionId}`,
        );
        if (!cancelado) setPosts(data.projects || []);
      } catch (err) {
        if (!cancelado) setMessage({ type: "error", text: err.message });
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [collectionId]);

  const markDirty = (id) => setDirty((d) => new Set(d).add(id));

  const patchPost = (id, patch) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    markDirty(id);
    setFlashId((f) => (f === id ? null : f));
  };

  const patchFicha = (id, key, value) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ficha: { ...p.ficha, [key]: value } } : p,
      ),
    );
    markDirty(id);
  };

  // --- Imagen ---------------------------------------------------------------

  const subirImagen = async (id, file) => {
    setUploadingId(id);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "portfolio");
      const data = await fetchJson("/api/upload", { method: "POST", body: fd });
      patchPost(id, { coverPath: data.url, coverUrl: data.url });
      setMessage({ type: "ok", text: "Imagen subida. Recuerda guardar el post." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploadingId(null);
    }
  };

  // Solo desasocia la imagen del post; el archivo sigue en el bucket
  const quitarImagen = (id) => patchPost(id, { coverPath: "", coverUrl: "" });

  // --- Visibilidad ----------------------------------------------------------

  /*
   * Ocultar/mostrar se guarda solo, sin pasar por "Guardar": es una acción de
   * un clic y así el cambio se ve en la web al instante. Si falla, se revierte.
   */
  const alternarVisibilidad = async (post) => {
    const nuevoValor = !post.published;
    setHidingId(post.id);
    setMessage(null);
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, published: nuevoValor } : p)),
    );

    try {
      await fetchJson("/api/portfolio/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          patch: { published: nuevoValor },
          section,
        }),
      });
      setMessage({
        type: "ok",
        text: nuevoValor
          ? "Publicación visible en la web."
          : "Publicación oculta en la web.",
      });
    } catch (err) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, published: !nuevoValor } : p)),
      );
      setMessage({ type: "error", text: err.message });
    } finally {
      setHidingId(null);
    }
  };

  // --- Alta, guardado, borrado y orden --------------------------------------

  const crear = async () => {
    setCreating(true);
    setMessage(null);
    try {
      const data = await fetchJson("/api/portfolio/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId, section }),
      });
      setPosts((prev) => [...prev, data.project]);
      setMessage({
        type: "ok",
        text: "Post creado. Súbele una imagen y publícalo cuando esté listo.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setCreating(false);
    }
  };

  const guardar = async (id) => {
    setSavingId(id);
    setMessage(null);
    try {
      const p = posts.find((x) => x.id === id);
      const patch = {
        title: p.title,
        caption: p.caption,
        cover_path: p.coverPath || null,
        published: p.published,
        position: p.position,
        metadata: {
          isHorizontal: p.isHorizontal,
          likes: Number(p.likes) || 0,
          holograma: p.holograma || "",
          logoReverso: normalizarLogoReverso(p.logoReverso),
          ficha: { ...p.ficha, etiquetas: parseEtiquetas(p.etiquetas) },
        },
      };
      await fetchJson("/api/portfolio/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, patch, section }),
      });
      setDirty((d) => {
        const n = new Set(d);
        n.delete(id);
        return n;
      });
      setFlashId(id);
      setTimeout(() => setFlashId((f) => (f === id ? null : f)), 2500);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingId(null);
    }
  };

  const borrar = async (id) => {
    setDeletingId(id);
    setMessage(null);
    try {
      await fetchJson("/api/portfolio/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, section }),
      });
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setConfirmId(null);
      setMessage({ type: "ok", text: "Post eliminado." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  // Intercambia dos posts y guarda las dos posiciones de una vez
  const mover = async (index, dir) => {
    const destino = index + dir;
    if (destino < 0 || destino >= posts.length) return;

    const siguiente = [...posts];
    [siguiente[index], siguiente[destino]] = [siguiente[destino], siguiente[index]];
    const reordenados = siguiente.map((p, i) => ({ ...p, position: i }));
    setPosts(reordenados);

    const cambiados = [reordenados[index], reordenados[destino]];
    try {
      await Promise.all(
        cambiados.map((p) =>
          fetchJson("/api/portfolio/projects", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: p.id,
              patch: { position: p.position },
              section,
            }),
          }),
        ),
      );
    } catch (err) {
      setMessage({ type: "error", text: "No se pudo guardar el orden: " + err.message });
    }
  };

  if (loading) return <p className="text-sm text-gray-400">Cargando posts…</p>;

  const ocupado = savingId !== null || deletingId !== null;

  return (
    <div>
      {message && (
        <div
          className={`mb-3 rounded px-3 py-2 text-sm border ${
            message.type === "ok"
              ? "border-green-700 bg-green-950/40 text-green-200"
              : "border-red-700 bg-red-950/40 text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] text-gray-500">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </span>
        <div className="flex-1" />
        <button className={primaryBtnCls} onClick={crear} disabled={creating}>
          {creating ? "Creando…" : "+ Nuevo post"}
        </button>
      </div>

      {!posts.length && (
        <p className="text-sm text-gray-400">
          Esta colección todavía no tiene posts. Crea uno para empezar.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {posts.map((p, index) => (
          <div
            key={p.id}
            className="box-border rounded-lg border border-[#242424] bg-[#0a0a0a] p-3"
          >
            {/* Cabecera del post */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] text-gray-500">#{index + 1}</span>
              <span className="text-sm font-medium text-gray-300">
                {p.title || p.caption?.slice(0, 40) || "Sin título"}
              </span>
              {!p.published && (
                <span className="rounded border border-[#3a3a3a] px-2 py-0.5 text-[11px] text-gray-400">
                  Oculto en la web
                </span>
              )}
              {dirty.has(p.id) ? (
                <span className="text-[11px] text-amber-400">● sin guardar</span>
              ) : flashId === p.id ? (
                <span className="text-[11px] text-green-400">✓ Guardado</span>
              ) : null}
              <div className="flex-1" />
              <button
                className={p.published ? btnCls : primaryBtnCls}
                onClick={() => alternarVisibilidad(p)}
                disabled={hidingId === p.id}
                title={
                  p.published
                    ? "Quitar esta publicación de la web (se guarda al instante)"
                    : "Volver a mostrarla en la web (se guarda al instante)"
                }
              >
                {hidingId === p.id
                  ? "Guardando…"
                  : p.published
                    ? "Ocultar"
                    : "Mostrar"}
              </button>
              <button
                className={btnCls}
                onClick={() => mover(index, -1)}
                disabled={index === 0 || ocupado}
                aria-label="Subir post"
              >
                ↑
              </button>
              <button
                className={btnCls}
                onClick={() => mover(index, 1)}
                disabled={index === posts.length - 1 || ocupado}
                aria-label="Bajar post"
              >
                ↓
              </button>
              <button
                className={dirty.has(p.id) ? primaryBtnCls : btnCls}
                onClick={() => guardar(p.id)}
                disabled={ocupado}
              >
                {savingId === p.id ? "Guardando…" : "Guardar"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
              {/* Imagen */}
              <div className="flex flex-col gap-2">
                <div className="rounded border border-[#222] bg-[#151515] flex items-center justify-center h-[180px] overflow-hidden">
                  {p.coverUrl || p.coverPath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.coverUrl || p.coverPath}
                      alt="Vista previa"
                      className="max-h-[180px] max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">sin imagen</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <label
                    className={`${btnCls} cursor-pointer ${
                      uploadingId === p.id ? "opacity-40" : ""
                    }`}
                  >
                    {uploadingId === p.id ? "Subiendo…" : "Subir imagen ↑"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingId === p.id}
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0];
                        if (file) subirImagen(p.id, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <button
                    className={btnCls}
                    onClick={() => quitarImagen(p.id)}
                    disabled={!p.coverPath}
                  >
                    Quitar imagen
                  </button>
                </div>

                <input
                  className={inputCls}
                  value={p.coverPath ?? ""}
                  placeholder="/ruta o https://…"
                  onChange={(e) =>
                    patchPost(p.id, {
                      coverPath: e.target.value,
                      coverUrl: e.target.value,
                    })
                  }
                />
                <span className="text-[11px] text-gray-500">
                  Se convierte a WebP. Máx. 15 MB.
                </span>
              </div>

              {/* Textos y datos */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className={labelCls}>Título</label>
                  <input
                    className={inputCls}
                    value={p.title ?? ""}
                    placeholder="Identidad visual Yadi"
                    onChange={(e) => patchPost(p.id, { title: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Descripción (se muestra como pie de la tarjeta)
                  </label>
                  <textarea
                    className={`${inputCls} min-h-[80px] resize-y`}
                    value={p.caption ?? ""}
                    placeholder="Identidad visual Yadi ☀️ #visualidentity"
                    onChange={(e) => patchPost(p.id, { caption: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Me gusta</label>
                    <input
                      className={inputCls}
                      type="number"
                      min="0"
                      value={p.likes ?? 0}
                      onChange={(e) => patchPost(p.id, { likes: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Etiquetas (separadas por coma)</label>
                    <input
                      className={inputCls}
                      value={p.etiquetas ?? ""}
                      placeholder="branding, identidad"
                      onChange={(e) => patchPost(p.id, { etiquetas: e.target.value })}
                    />
                  </div>
                  {/* Botón en vez de checkbox: el reset del dashboard estira
                      los input y rompe las casillas */}
                  <div>
                    <label className={labelCls}>Formato</label>
                    <button
                      className={p.isHorizontal ? primaryBtnCls : btnCls}
                      onClick={() =>
                        patchPost(p.id, { isHorizontal: !p.isHorizontal })
                      }
                      title="Cómo ocupa el post en la cuadrícula"
                    >
                      {p.isHorizontal ? "Horizontal" : "Vertical"}
                    </button>
                  </div>
                </div>

                {/* Ficha técnica: lo que sale en el reverso de la tarjeta */}
                <details className="rounded border border-[#242424] bg-[#0d0d0d]">
                  <summary className="cursor-pointer px-3 py-2 text-sm text-gray-300">
                    Ficha técnica de la pieza
                  </summary>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 pt-0">
                    {FICHA_CAMPOS.map((campo) => (
                      <div key={campo.key}>
                        <label className={labelCls}>{campo.label}</label>
                        <input
                          className={inputCls}
                          value={p.ficha?.[campo.key] ?? ""}
                          placeholder={campo.placeholder}
                          onChange={(e) =>
                            patchFicha(p.id, campo.key, e.target.value)
                          }
                        />
                      </div>
                    ))}
                    {/* Cuál de los dos logotipos corona el reverso. Botones en
                        vez de radios por lo mismo que el Formato de arriba. */}
                    <div className="sm:col-span-2">
                      <label className={labelCls}>
                        Logo del reverso (arriba)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {LOGOS_REVERSO.map((logo) => {
                          const activo =
                            (p.logoReverso || LOGO_REVERSO_DEFECTO) === logo.key;
                          return (
                            <button
                              key={logo.key}
                              className={`box-border flex items-center gap-2 rounded border px-3 py-2 text-sm ${
                                activo
                                  ? "border-[#00aff0] bg-[#00aff0]/10 text-white"
                                  : "border-[#333] bg-[#111] text-gray-400 hover:bg-[#1a1a1a]"
                              }`}
                              aria-pressed={activo}
                              onClick={() =>
                                patchPost(p.id, { logoReverso: logo.key })
                              }
                            >
                              <img
                                src={logo.src}
                                alt=""
                                className="h-3 w-auto"
                              />
                              {logo.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>
                        Holograma (URL de video, opcional)
                      </label>
                      <input
                        className={inputCls}
                        value={p.holograma ?? ""}
                        placeholder="https://…/holograma.webm"
                        onChange={(e) =>
                          patchPost(p.id, { holograma: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </details>

                {/* Borrado */}
                <div className="flex items-center gap-2">
                  {confirmId === p.id ? (
                    <>
                      <span className="text-sm text-red-200">
                        ¿Eliminar este post? No se puede deshacer.
                      </span>
                      <button
                        className={dangerBtnCls}
                        onClick={() => borrar(p.id)}
                        disabled={deletingId === p.id}
                      >
                        {deletingId === p.id ? "Eliminando…" : "Sí, eliminar"}
                      </button>
                      <button className={btnCls} onClick={() => setConfirmId(null)}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      className={dangerBtnCls}
                      onClick={() => setConfirmId(p.id)}
                      disabled={ocupado}
                    >
                      Eliminar post
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

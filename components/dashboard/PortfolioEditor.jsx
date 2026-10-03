"use client";

import { useEffect, useState } from "react";

import PostsEditor from "./PostsEditor";
import { fetchJson } from "../../lib/fetchJson";

const inputCls =
  "box-border w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#00aff0]";
const labelCls = "block text-[11px] uppercase tracking-wide text-gray-400 mb-1";
const btnCls =
  "box-border px-3 py-1.5 rounded text-sm font-medium border border-[#333] bg-[#1a1a1a] text-white hover:bg-[#262626] disabled:opacity-40";
const primaryBtnCls =
  "box-border px-4 py-1.5 rounded text-sm font-bold bg-[#00aff0] text-white hover:opacity-90 disabled:opacity-40";
const previewBox =
  "rounded border border-[#222] bg-[#6b7280] flex items-center justify-center h-20 overflow-hidden";

/*
 * La cuenta atrás se guarda como ISO en UTC (mismo final para todo el mundo),
 * pero el <input type="datetime-local"> habla en hora local del navegador. Estas
 * dos funciones traducen en cada dirección.
 */
function isoAInputLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function inputLocalAIso(valor) {
  if (!valor) return "";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

// Campo de imagen reutilizable (avatar = WebP; logo = sin convertir).
function AssetField({ label, value, preview, uploading, accept, hint, onUrl, onUpload }) {
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
            accept={accept}
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
      <div className={previewBox}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="max-h-20 max-w-full object-contain" />
        ) : (
          <span className="text-black/60 text-xs">sin imagen</span>
        )}
      </div>
    </div>
  );
}

// Editor de colecciones de portafolio. Sirve para Diseño y para Galería:
// lo único que cambia es `section`.
export default function PortfolioEditor({ section = "diseno" }) {
  const [cols, setCols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [configured, setConfigured] = useState(true);
  const [dirty, setDirty] = useState(() => new Set());
  const [flashId, setFlashId] = useState(null);
  const [message, setMessage] = useState(null);
  // Colección con el gestor de posts abierto (se carga solo al abrirlo)
  const [openPostsId, setOpenPostsId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJson(`/api/portfolio?section=${section}`);
        setCols(data.collections || []);
        setConfigured(Boolean(data.configured));
      } catch (err) {
        setMessage({ type: "error", text: "No se pudo cargar: " + err.message });
      } finally {
        setLoading(false);
      }
    })();
  }, [section]);

  const markDirty = (id) => setDirty((d) => new Set(d).add(id));

  const patchCol = (id, patch) => {
    setCols((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    markDirty(id);
    setFlashId((f) => (f === id ? null : f));
  };

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= cols.length) return;
    setCols((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((c, i) => ({ ...c, position: i }));
    });
    setDirty((d) => {
      const n = new Set(d);
      cols.forEach((c) => n.add(c.id));
      return n;
    });
  };

  const uploadAsset = async (id, file, raw, field) => {
    setUploadingKey(`${field}-${id}`);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (raw) fd.append("raw", "true");
      fd.append("folder", "portfolio");
      const data = await fetchJson("/api/upload", { method: "POST", body: fd });
      // Qué par de campos toca cada destino. Mapa en vez de encadenar ifs, para
      // que añadir un asset nuevo sea una línea. Las portadas van por índice
      // dentro de una lista, así que se resuelven aparte.
      if (field.startsWith("portada-")) {
        patchPortada(id, Number(field.slice("portada-".length)), data.url);
      } else {
        const destinos = {
          avatar: { avatarPath: data.url, avatarUrl: data.url },
          logo: { logoPath: data.url, logoUrl: data.url },
          presentacion: {
            presentacionLogoPath: data.url,
            presentacionLogoUrl: data.url,
          },
        };
        patchCol(id, destinos[field] || destinos.logo);
      }
      setMessage({ type: "ok", text: "Archivo subido. Recuerda guardar." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploadingKey(null);
    }
  };

  // --- Portadas del carrusel (lista ordenada) ---
  const listaPortadas = (c) => (Array.isArray(c.portadas) ? c.portadas : []);

  const patchPortada = (id, index, path) => {
    setCols((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const portadas = [...listaPortadas(c)];
        portadas[index] = { path, url: path };
        return { ...c, portadas };
      }),
    );
    markDirty(id);
  };

  const anadirPortada = (id) =>
    setCols((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, portadas: [...listaPortadas(c), { path: "", url: "" }] }
          : c,
      ),
    );

  const quitarPortada = (id, index) => {
    setCols((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, portadas: listaPortadas(c).filter((_, i) => i !== index) }
          : c,
      ),
    );
    markDirty(id);
  };

  const save = async (id) => {
    setSavingId(id);
    setMessage(null);
    try {
      const c = cols.find((x) => x.id === id);
      const patch = {
        name: c.name,
        bio: c.bio,
        avatar_path: c.avatarPath,
        logo_path: c.logoPath,
        portadas: listaPortadas(c)
          .map((p) => p.path)
          .filter(Boolean),
        presentacion: {
          logo: c.presentacionLogoPath,
          descripcion: c.presentacionDescripcion,
          contador: {
            activo: Boolean(c.contadorActivo),
            hasta: c.contadorHasta,
            etiqueta: c.contadorEtiqueta,
          },
        },
        stats: { followers: c.followers, following: c.following },
        published: c.published,
        position: c.position,
      };
      await fetchJson("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, section, patch }),
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

  if (loading) return <p className="text-gray-400">Cargando…</p>;

  const busy = savingId !== null;

  if (!cols.length) {
    return (
      <p className="text-gray-400">
        No hay perfiles de {section === "galeria" ? "Galería" : "Diseño"} en Supabase.{" "}
        {configured ? "" : "(Supabase no está configurado.)"}
      </p>
    );
  }

  return (
    <div className="text-white">
      {message && (
        <div
          className={`mb-4 rounded px-4 py-3 text-sm border ${
            message.type === "ok"
              ? "border-green-700 bg-green-950/40 text-green-200"
              : "border-red-700 bg-red-950/40 text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {cols.map((c, index) => (
          <div
            key={c.id}
            className="box-border rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-4"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm font-bold text-gray-300">{c.name || "Perfil"}</span>
              <span className="text-[11px] text-gray-500">{c.postsCount} posts</span>
              {dirty.has(c.id) ? (
                <span className="text-[11px] text-amber-400">● sin guardar</span>
              ) : flashId === c.id ? (
                <span className="text-[11px] text-green-400">✓ Guardado</span>
              ) : null}
              <div className="flex-1" />
              <button
                className={c.published ? primaryBtnCls : btnCls}
                onClick={() => patchCol(c.id, { published: !c.published })}
                title="Alternar visibilidad en la web"
              >
                {c.published ? "Publicado" : "Oculto"}
              </button>
              <button
                className={btnCls}
                onClick={() => move(index, -1)}
                disabled={index === 0 || busy}
                aria-label="Subir"
              >
                ↑
              </button>
              <button
                className={btnCls}
                onClick={() => move(index, 1)}
                disabled={index === cols.length - 1 || busy}
                aria-label="Bajar"
              >
                ↓
              </button>
              <button
                className={dirty.has(c.id) ? primaryBtnCls : btnCls}
                onClick={() => save(c.id)}
                disabled={busy}
              >
                {savingId === c.id ? "Guardando…" : "Guardar perfil"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Izquierda: textos */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className={labelCls}>Nombre</label>
                  <input
                    className={inputCls}
                    value={c.name ?? ""}
                    onChange={(e) => patchCol(c.id, { name: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Bio</label>
                  <textarea
                    className={`${inputCls} min-h-[90px] resize-y`}
                    value={c.bio ?? ""}
                    onChange={(e) => patchCol(c.id, { bio: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Seguidores</label>
                    <input
                      className={inputCls}
                      value={c.followers ?? ""}
                      placeholder="8.5K"
                      onChange={(e) => patchCol(c.id, { followers: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Seguidos</label>
                    <input
                      className={inputCls}
                      value={c.following ?? ""}
                      placeholder="120"
                      onChange={(e) => patchCol(c.id, { following: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Derecha: avatar + logo + portada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AssetField
                  label="Avatar"
                  value={c.avatarPath}
                  preview={c.avatarUrl || c.avatarPath}
                  uploading={uploadingKey === `avatar-${c.id}`}
                  accept="image/*"
                  hint="Se convierte a WebP"
                  onUrl={(v) => patchCol(c.id, { avatarPath: v, avatarUrl: v })}
                  onUpload={(file) => uploadAsset(c.id, file, false, "avatar")}
                />
                <AssetField
                  label="Logo"
                  value={c.logoPath}
                  preview={c.logoUrl || c.logoPath}
                  uploading={uploadingKey === `logo-${c.id}`}
                  accept="image/svg+xml,image/png,image/jpeg,image/webp"
                  hint="Sin convertir"
                  onUrl={(v) => patchCol(c.id, { logoPath: v, logoUrl: v })}
                  onUpload={(file) => uploadAsset(c.id, file, true, "logo")}
                />
                {/* Presentación: logo + descripción + cuenta atrás. Uno por
                    galería; se ve sobre el carrusel y también en móvil. */}
                <div className="sm:col-span-2 rounded border border-[#242424] bg-[#0d0d0d] p-3">
                  <p className="text-sm text-gray-300 mb-3">
                    Presentación de la cabecera
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AssetField
                      label="Logotipo"
                      value={c.presentacionLogoPath}
                      preview={c.presentacionLogoUrl || c.presentacionLogoPath}
                      uploading={uploadingKey === `presentacion-${c.id}`}
                      accept="image/svg+xml,image/png,image/jpeg,image/webp"
                      hint="Sin convertir"
                      onUrl={(v) =>
                        patchCol(c.id, {
                          presentacionLogoPath: v,
                          presentacionLogoUrl: v,
                        })
                      }
                      onUpload={(file) =>
                        uploadAsset(c.id, file, true, "presentacion")
                      }
                    />

                    <div>
                      <label className={labelCls}>Descripción</label>
                      <textarea
                        className={`${inputCls} h-[136px] resize-y`}
                        value={c.presentacionDescripcion ?? ""}
                        placeholder="Texto que acompaña a la portada…"
                        onChange={(e) =>
                          patchCol(c.id, {
                            presentacionDescripcion: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Cuenta atrás: se enciende y se apaga sin perder la fecha */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Cuenta atrás</label>
                      <button
                        className={c.contadorActivo ? primaryBtnCls : btnCls}
                        aria-pressed={Boolean(c.contadorActivo)}
                        onClick={() =>
                          patchCol(c.id, { contadorActivo: !c.contadorActivo })
                        }
                      >
                        {c.contadorActivo ? "Activada" : "Desactivada"}
                      </button>
                    </div>

                    <div>
                      <label className={labelCls}>Hasta (fecha y hora)</label>
                      <input
                        type="datetime-local"
                        className={inputCls}
                        value={isoAInputLocal(c.contadorHasta)}
                        onChange={(e) =>
                          patchCol(c.id, {
                            contadorHasta: inputLocalAIso(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Etiqueta (opcional)</label>
                      <input
                        className={inputCls}
                        value={c.contadorEtiqueta ?? ""}
                        placeholder="Faltan para el estreno"
                        onChange={(e) =>
                          patchCol(c.id, { contadorEtiqueta: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {c.contadorActivo && !c.contadorHasta && (
                    <p className="mt-2 text-xs text-amber-300">
                      La cuenta atrás está activada pero sin fecha: no se pintará
                      hasta que pongas una.
                    </p>
                  )}
                </div>

                {/* Portadas del carrusel: lista ordenada. El orden de esta lista
                    es el orden en que las rota el carrusel. */}
                <div className="sm:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className={labelCls}>
                      Portadas del carrusel (sólo escritorio)
                    </span>
                    <button
                      className={btnCls}
                      onClick={() => anadirPortada(c.id)}
                    >
                      Añadir portada +
                    </button>
                  </div>

                  {listaPortadas(c).length === 0 && (
                    <p className="text-xs text-gray-500 mb-2">
                      Sin portadas: en escritorio no se pinta el carrusel.
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {listaPortadas(c).map((portada, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <AssetField
                          label={`Portada ${i + 1}`}
                          value={portada.path}
                          preview={portada.url || portada.path}
                          uploading={uploadingKey === `portada-${i}-${c.id}`}
                          accept="image/*"
                          hint="Panorámica; se convierte a WebP y se acota a 2000 px"
                          onUrl={(v) => patchPortada(c.id, i, v)}
                          onUpload={(file) =>
                            // raw=false: las portadas son fotos, así que pasan por
                            // el conversor a WebP y por el tope de tamaño
                            uploadAsset(c.id, file, false, `portada-${i}`)
                          }
                        />
                        <button
                          className={btnCls}
                          onClick={() => quitarPortada(c.id, i)}
                        >
                          Quitar portada {i + 1}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Gestor de imágenes/posts de la colección */}
            <div className="mt-4 border-t border-[#242424] pt-3">
              <button
                className={btnCls}
                onClick={() =>
                  setOpenPostsId((current) => (current === c.id ? null : c.id))
                }
              >
                {openPostsId === c.id
                  ? `Ocultar ${section === "coding" ? "proyectos Coding" : c.slug === "diseno" || /web/i.test(`${c.name} ${c.bio}`) ? "proyectos Web" : "imágenes"} ▲`
                  : `${section === "coding" ? "Proyectos Coding" : c.slug === "diseno" || /web/i.test(`${c.name} ${c.bio}`) ? "Proyectos Web" : "Imágenes del perfil"} ▼`}
              </button>

              {openPostsId === c.id && (
                <div className="mt-3">
                  <PostsEditor
                    collectionId={c.id}
                    section={section}
                    webMode={section === "coding" || c.slug === "diseno" || /web/i.test(`${c.name} ${c.bio}`)}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const inputCls =
  "box-border w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#00aff0]";
const labelCls = "block text-[11px] uppercase tracking-wide text-gray-400 mb-1";
const btnCls =
  "box-border px-3 py-1.5 rounded text-sm font-medium border border-[#333] bg-[#1a1a1a] text-white hover:bg-[#262626] disabled:opacity-40";
const primaryBtnCls =
  "box-border px-4 py-1.5 rounded text-sm font-bold bg-[#00aff0] text-white hover:opacity-90 disabled:opacity-40";
const previewBox =
  "rounded border border-[#222] bg-[#6b7280] flex items-center justify-center h-20 overflow-hidden";

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

export default function DisenoEditor() {
  const [cols, setCols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [configured, setConfigured] = useState(true);
  const [dirty, setDirty] = useState(() => new Set());
  const [flashId, setFlashId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetch("/api/portfolio?section=diseno").then((r) => r.json());
        setCols(data.collections || []);
        setConfigured(Boolean(data.configured));
      } catch (err) {
        setMessage({ type: "error", text: "No se pudo cargar: " + err.message });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir");
      if (field === "avatar") patchCol(id, { avatarPath: data.url, avatarUrl: data.url });
      else patchCol(id, { logoPath: data.url, logoUrl: data.url });
      setMessage({ type: "ok", text: "Archivo subido. Recuerda guardar." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploadingKey(null);
    }
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
        stats: { followers: c.followers, following: c.following },
        published: c.published,
        position: c.position,
      };
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, section: "diseno", patch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
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
        No hay perfiles de Diseño en Supabase.{" "}
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

              {/* Derecha: avatar + logo */}
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

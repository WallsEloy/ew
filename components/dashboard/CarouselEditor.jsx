"use client";

import { useEffect, useState } from "react";
import { makeBlankSlide } from "../../data/homeSlides";

let keyCounter = 0;
const withKey = (slide) => ({ _key: `s${keyCounter++}`, ...slide });

const TEXT_FIELDS = [
  { name: "title", label: "Título (izquierda)", placeholder: "Galerias" },
  { name: "logoText", label: "Subtítulo / eyebrow", placeholder: "HUMANS" },
  { name: "buttonText", label: "Texto del botón", placeholder: "ver" },
  { name: "rightTitle", label: "Título derecho", placeholder: "OnlyFans" },
];

export default function CarouselEditor() {
  const [slides, setSlides] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [message, setMessage] = useState(null); // { type, text }
  const [uploadingKey, setUploadingKey] = useState(null);
  const [savingKey, setSavingKey] = useState(null); // slide guardándose (o "__all__")
  const [dirtyKeys, setDirtyKeys] = useState(() => new Set()); // slides con cambios sin guardar
  const [flashKey, setFlashKey] = useState(null); // slide recién guardado (feedback en línea)

  useEffect(() => {
    (async () => {
      try {
        const [slidesRes, imagesRes] = await Promise.all([
          fetch("/api/slides").then((r) => r.json()),
          fetch("/api/images").then((r) => r.json()),
        ]);
        setSlides((slidesRes.slides || []).map(withKey));
        setConfigured(Boolean(slidesRes.configured));
        setImages(imagesRes.images || []);
      } catch (err) {
        setMessage({ type: "error", text: "No se pudo cargar: " + err.message });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const markDirty = (key) =>
    setDirtyKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });

  const updateField = (key, field, value) => {
    setSlides((prev) =>
      prev.map((s) => (s._key === key ? { ...s, [field]: value } : s)),
    );
    markDirty(key);
    setFlashKey((k) => (k === key ? null : k));
  };

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    const aKey = slides[index]._key;
    const bKey = slides[target]._key;
    setSlides((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirtyKeys((prev) => new Set(prev).add(aKey).add(bKey));
  };

  const removeSlide = (key) => {
    setSlides((prev) => prev.filter((s) => s._key !== key));
    setDirtyKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setMessage({
      type: "ok",
      text: "Slide quitado. Guarda cualquier slide (o «Guardar todo») para persistir la eliminación.",
    });
  };

  const addSlide = () => {
    const slide = withKey(makeBlankSlide());
    setSlides((prev) => [...prev, slide]);
    markDirty(slide._key);
  };

  // Sube un archivo del ordenador; el servidor lo convierte a WebP y lo guarda
  // en Storage. Al terminar, fija la URL pública como imagen del slide.
  const uploadImage = async (key, file) => {
    setUploadingKey(key);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir la imagen");
      updateField(key, "image", data.url);
      setMessage({
        type: "ok",
        text: "Imagen subida y convertida a WebP. Recuerda guardar los cambios.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploadingKey(null);
    }
  };

  // El backend reemplaza SIEMPRE el conjunto completo (replaceSlides borra y
  // reinserta), así que cualquier guardado —global o por slide— envía TODOS los
  // slides. Nunca se envía uno solo: eso borraría el resto.
  const putAllSlides = async () => {
    const payload = slides.map(({ _key, ...rest }) => rest);
    const res = await fetch("/api/slides", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slides: payload }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al guardar");
    return data.slides || [];
  };

  // Reasigna las claves internas conservando el orden (para no perder el foco ni
  // el feedback en línea de la tarjeta recién guardada).
  const rekeyByIndex = (returned, prev) =>
    returned.map((s, i) => ({ _key: prev[i]?._key ?? `s${keyCounter++}`, ...s }));

  const flash = (key) => {
    setFlashKey(key);
    setTimeout(() => setFlashKey((k) => (k === key ? null : k)), 2500);
  };

  // Guarda desde el botón de un slide concreto (persiste todo el conjunto).
  const saveSlide = async (key) => {
    setSavingKey(key);
    setMessage(null);
    try {
      const saved = await putAllSlides();
      setSlides((prev) => rekeyByIndex(saved, prev));
      setDirtyKeys(new Set());
      flash(key);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingKey(null);
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const saved = await putAllSlides();
      setSlides((prev) => rekeyByIndex(saved, prev));
      setDirtyKeys(new Set());
      setMessage({ type: "ok", text: "Cambios guardados. Recarga el home para verlos." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const restoreDefaults = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/slides/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al restaurar");
      const reload = await fetch("/api/slides").then((r) => r.json());
      setSlides((reload.slides || []).map(withKey));
      setDirtyKeys(new Set());
      setMessage({
        type: "ok",
        text: data.seeded
          ? "Slides por defecto insertados."
          : "La tabla ya tenía datos; no se sobrescribió.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "box-border w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#00aff0]";
  const labelCls = "block text-[11px] uppercase tracking-wide text-gray-400 mb-1";
  const btnCls =
    "box-border px-3 py-1.5 rounded text-sm font-medium border border-[#333] bg-[#1a1a1a] text-white hover:bg-[#262626] disabled:opacity-40";
  const primaryBtnCls =
    "box-border px-3 py-1.5 rounded text-sm font-bold bg-[#00aff0] text-white hover:opacity-90 disabled:opacity-40";
  const busy = saving || savingKey !== null;

  return (
    <div className="dashRoot text-white">
      {/* Estilos de los controles en globals.css (.dashRoot ...): este proyecto usa
          Tailwind v4 sin Preflight (ver MEMORY.md) y los estilos UA de los form controls
          ganan a las utilidades, así que se resetean con CSS scopeado. */}

      {/* Barra de acciones */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <a href="/" target="_blank" className="text-sm text-[#00aff0] underline">
          Ver home ↗
        </a>
        <div className="flex-1" />
        <button
          className={btnCls}
          onClick={restoreDefaults}
          disabled={busy || loading}
        >
          Restaurar por defecto
        </button>
        <button
          className="box-border px-4 py-1.5 rounded text-sm font-bold bg-[#00aff0] text-white hover:opacity-90 disabled:opacity-40"
          onClick={save}
          disabled={busy || loading}
          title="Guarda todos los slides (necesario tras reordenar o quitar)"
        >
          {saving ? "Guardando…" : "Guardar todo"}
        </button>
      </div>

      {!configured && (
        <div className="mb-4 rounded border border-yellow-600 bg-yellow-950/40 px-4 py-3 text-sm text-yellow-200">
          Supabase no está configurado. Puedes editar y previsualizar, pero{" "}
          <strong>los cambios no se guardarán</strong> hasta crear{" "}
          <code>.env.local</code> con las claves de Supabase.
        </div>
      )}

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

      {loading ? (
        <p className="text-gray-400">Cargando…</p>
      ) : (
        <div className="flex flex-col gap-4">
          {slides.map((slide, index) => (
            <div
              key={slide._key}
              className="box-border rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-4"
            >
              {/* Cabecera de la tarjeta */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm font-bold text-gray-300">
                  Slide {index + 1}
                </span>
                {dirtyKeys.has(slide._key) ? (
                  <span className="text-[11px] text-amber-400">
                    ● sin guardar
                  </span>
                ) : flashKey === slide._key ? (
                  <span className="text-[11px] text-green-400">✓ Guardado</span>
                ) : null}
                <div className="flex-1" />
                <button
                  className={dirtyKeys.has(slide._key) ? primaryBtnCls : btnCls}
                  onClick={() => saveSlide(slide._key)}
                  disabled={busy}
                  title="Guardar este slide"
                >
                  {savingKey === slide._key ? "Guardando…" : "Guardar slide"}
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
                  disabled={index === slides.length - 1 || busy}
                  aria-label="Bajar"
                >
                  ↓
                </button>
                <button
                  className="box-border px-3 py-1.5 rounded text-sm border border-red-800 bg-red-950/40 text-red-300 hover:bg-red-900/40 disabled:opacity-40"
                  onClick={() => removeSlide(slide._key)}
                  disabled={busy}
                >
                  Quitar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Columna izquierda: textos */}
                <div className="flex flex-col gap-3">
                  {TEXT_FIELDS.map((f) => (
                    <div key={f.name}>
                      <label className={labelCls}>{f.label}</label>
                      <input
                        className={inputCls}
                        value={slide[f.name] ?? ""}
                        placeholder={f.placeholder}
                        onChange={(e) =>
                          updateField(slide._key, f.name, e.target.value)
                        }
                      />
                    </div>
                  ))}
                  <div>
                    <label className={labelCls}>Párrafo (texto derecho)</label>
                    <textarea
                      className={`${inputCls} min-h-[90px] resize-y`}
                      value={slide.rightText ?? ""}
                      onChange={(e) =>
                        updateField(slide._key, "rightText", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Color de acento</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="box-border h-9 w-12 rounded border border-[#333] bg-[#111] p-0"
                        value={slide.rightColor || "#00aff0"}
                        onChange={(e) =>
                          updateField(slide._key, "rightColor", e.target.value)
                        }
                      />
                      <input
                        className={inputCls}
                        value={slide.rightColor ?? ""}
                        onChange={(e) =>
                          updateField(slide._key, "rightColor", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Color del botón</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="box-border h-9 w-12 rounded border border-[#333] bg-[#111] p-0"
                        value={slide.buttonColor || "#facc15"}
                        onChange={(e) =>
                          updateField(slide._key, "buttonColor", e.target.value)
                        }
                      />
                      <input
                        className={inputCls}
                        value={slide.buttonColor ?? ""}
                        placeholder="vacío = amarillo por defecto"
                        onChange={(e) =>
                          updateField(slide._key, "buttonColor", e.target.value)
                        }
                      />
                      {slide.buttonColor ? (
                        <button
                          type="button"
                          className={btnCls}
                          onClick={() => updateField(slide._key, "buttonColor", "")}
                          title="Volver al color por defecto"
                        >
                          Limpiar
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Columna derecha: imagen */}
                <div className="flex flex-col gap-3">
                  <div>
                    <label className={labelCls}>Imagen (ruta o URL)</label>
                    <input
                      className={inputCls}
                      value={slide.image ?? ""}
                      placeholder="/carrusel/… o https://…"
                      onChange={(e) =>
                        updateField(slide._key, "image", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      className={`${btnCls} cursor-pointer ${
                        uploadingKey === slide._key ? "opacity-40" : ""
                      }`}
                    >
                      {uploadingKey === slide._key
                        ? "Subiendo…"
                        : "Subir imagen ↑"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingKey === slide._key}
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (file) uploadImage(slide._key, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <span className="text-[11px] text-gray-500">
                      Se convierte a WebP automáticamente
                    </span>
                  </div>

                  <div>
                    <label className={labelCls}>o elegir existente</label>
                    <select
                      className={inputCls}
                      value={images.includes(slide.image) ? slide.image : ""}
                      onChange={(e) =>
                        updateField(slide._key, "image", e.target.value)
                      }
                    >
                      <option value="">— elegir de /public —</option>
                      {images.map((img) => (
                        <option key={img} value={img}>
                          {img}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 rounded border border-[#222] bg-black flex items-center justify-center min-h-[180px] overflow-hidden">
                    {slide.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={slide.image}
                        alt="preview"
                        className="max-h-[240px] max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-600 text-sm">sin imagen</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            className="box-border rounded-lg border border-dashed border-[#333] py-3 text-sm text-gray-300 hover:bg-[#141414]"
            onClick={addSlide}
          >
            + Agregar slide
          </button>
        </div>
      )}
    </div>
  );
}

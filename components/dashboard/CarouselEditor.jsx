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

  const updateField = (key, field, value) => {
    setSlides((prev) =>
      prev.map((s) => (s._key === key ? { ...s, [field]: value } : s)),
    );
  };

  const move = (index, dir) => {
    setSlides((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeSlide = (key) =>
    setSlides((prev) => prev.filter((s) => s._key !== key));

  const addSlide = () =>
    setSlides((prev) => [...prev, withKey(makeBlankSlide())]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // Quitar la clave interna antes de enviar.
      const payload = slides.map(({ _key, ...rest }) => rest);
      const res = await fetch("/api/slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setSlides((data.slides || []).map(withKey));
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
        <button className={btnCls} onClick={restoreDefaults} disabled={saving || loading}>
          Restaurar por defecto
        </button>
        <button
          className="box-border px-4 py-1.5 rounded text-sm font-bold bg-[#00aff0] text-white hover:opacity-90 disabled:opacity-40"
          onClick={save}
          disabled={saving || loading}
        >
          {saving ? "Guardando…" : "Guardar cambios"}
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
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-bold text-gray-300">
                  Slide {index + 1}
                </span>
                <div className="flex-1" />
                <button
                  className={btnCls}
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Subir"
                >
                  ↑
                </button>
                <button
                  className={btnCls}
                  onClick={() => move(index, 1)}
                  disabled={index === slides.length - 1}
                  aria-label="Bajar"
                >
                  ↓
                </button>
                <button
                  className="box-border px-3 py-1.5 rounded text-sm border border-red-800 bg-red-950/40 text-red-300 hover:bg-red-900/40"
                  onClick={() => removeSlide(slide._key)}
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
                </div>

                {/* Columna derecha: imagen */}
                <div className="flex flex-col gap-3">
                  <div>
                    <label className={labelCls}>Imagen</label>
                    <select
                      className={inputCls}
                      value={slide.image ?? ""}
                      onChange={(e) =>
                        updateField(slide._key, "image", e.target.value)
                      }
                    >
                      <option value="">— sin imagen —</option>
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

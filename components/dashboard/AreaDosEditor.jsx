"use client";

import { useEffect, useState } from "react";
import {
  defaultGraphsConfig,
  mergeGraphsConfig,
  makeBlankScene,
} from "../../data/graphsConfig";

const inputCls =
  "box-border w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#00aff0]";
const labelCls = "block text-[11px] uppercase tracking-wide text-gray-400 mb-1";
const btnCls =
  "box-border px-3 py-1.5 rounded text-sm font-medium border border-[#333] bg-[#1a1a1a] text-white hover:bg-[#262626] disabled:opacity-40";
const primaryBtnCls =
  "box-border px-4 py-1.5 rounded text-sm font-bold bg-[#00aff0] text-white hover:opacity-90 disabled:opacity-40";

export default function AreaDosEditor() {
  const [scenes, setScenes] = useState(defaultGraphsConfig.scenes);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetch("/api/graphs").then((r) => r.json());
        if (data?.config) setScenes(mergeGraphsConfig(data.config).scenes);
        setConfigured(Boolean(data?.configured));
      } catch (err) {
        setMessage({ type: "error", text: "No se pudo cargar: " + err.message });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setScene = (index, field, value) => {
    setScenes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
    setDirty(true);
  };
  const addScene = () => {
    setScenes((prev) => [...prev, makeBlankScene()]);
    setDirty(true);
  };
  const removeScene = (index) => {
    setScenes((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
    setDirty(true);
  };
  const moveScene = (index, dir) => {
    const target = index + dir;
    setScenes((prev) => {
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/graphs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: { scenes } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setScenes(mergeGraphsConfig(data.config).scenes);
      setDirty(false);
      setMessage({
        type: "ok",
        text: "Guardado. Recarga el home para ver los cambios.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400">Cargando…</p>;

  return (
    <div className="text-white">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <a href="/" target="_blank" className="text-sm text-[#00aff0] underline">
          Ver home ↗
        </a>
        <span className="text-[11px] text-gray-500">{scenes.length} escenas</span>
        {dirty && <span className="text-[11px] text-amber-400">● sin guardar</span>}
        <div className="flex-1" />
        <button className={dirty ? primaryBtnCls : btnCls} onClick={save} disabled={saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      {!configured && (
        <div className="mb-4 rounded border border-yellow-600 bg-yellow-950/40 px-4 py-3 text-sm text-yellow-200">
          Supabase no está configurado. Puedes editar y previsualizar, pero{" "}
          <strong>los cambios no se guardarán</strong>.
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

      <div className="flex flex-col gap-4">
        {scenes.map((scene, index) => (
          <div
            key={index}
            className="box-border rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-gray-300">
                Escena {index + 1}
              </span>
              <div className="flex-1" />
              <button
                className={btnCls}
                onClick={() => moveScene(index, -1)}
                disabled={index === 0}
                aria-label="Subir"
              >
                ↑
              </button>
              <button
                className={btnCls}
                onClick={() => moveScene(index, 1)}
                disabled={index === scenes.length - 1}
                aria-label="Bajar"
              >
                ↓
              </button>
              <button
                className="box-border px-3 py-1.5 rounded text-sm border border-red-800 bg-red-950/40 text-red-300 hover:bg-red-900/40 disabled:opacity-40"
                onClick={() => removeScene(index)}
                disabled={scenes.length <= 1}
                title={scenes.length <= 1 ? "Debe quedar al menos una escena" : "Quitar"}
              >
                Quitar
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className={labelCls}>Título</label>
                <input
                  className={inputCls}
                  value={scene.title ?? ""}
                  placeholder="Conexiones"
                  onChange={(e) => setScene(index, "title", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Texto</label>
                <textarea
                  className={`${inputCls} min-h-[90px] resize-y`}
                  value={scene.text ?? ""}
                  onChange={(e) => setScene(index, "text", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        <button
          className="box-border rounded-lg border border-dashed border-[#333] py-3 text-sm text-gray-300 hover:bg-[#141414]"
          onClick={addScene}
        >
          + Agregar escena
        </button>
      </div>
    </div>
  );
}

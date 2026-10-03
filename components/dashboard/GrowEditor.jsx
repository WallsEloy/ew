"use client";

import { useEffect, useState } from "react";
import { defaultGrowConfig, makeBlankGrowProject, mergeGrowConfig } from "../../data/growPage";

const input = "box-border w-full rounded border border-[#333] bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-[#d946ef]";
const label = "mb-1 block text-[11px] uppercase tracking-wide text-gray-400";
const button = "rounded border border-[#333] bg-[#1a1a1a] px-3 py-2 text-sm text-white disabled:opacity-40";

export default function GrowEditor() {
  const [config, setConfig] = useState(defaultGrowConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch("/api/grow").then((response) => response.json()).then((data) => {
      if (data.config) setConfig(mergeGrowConfig(data.config));
    }).catch((error) => setMessage({ type: "error", text: error.message })).finally(() => setLoading(false));
  }, []);

  const patch = (values) => { setConfig((current) => ({ ...current, ...values })); setDirty(true); };
  const patchProject = (index, values) => {
    setConfig((current) => ({ ...current, projects: current.projects.map((item, itemIndex) => itemIndex === index ? { ...item, ...values } : item) }));
    setDirty(true);
  };

  const uploadImage = async (index, file, fieldName = "image") => {
    setUploading(`${index}-${fieldName}`);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "grow");
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo subir la imagen");
      patchProject(index, { [fieldName]: data.url });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally { setUploading(null); }
  };

  const save = async () => {
    setSaving(true); setMessage(null);
    try {
      const response = await fetch("/api/grow", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ config }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo guardar");
      setConfig(mergeGrowConfig(data.config)); setDirty(false);
      setMessage({ type: "ok", text: "Grow guardado correctamente." });
    } catch (error) { setMessage({ type: "error", text: error.message }); }
    finally { setSaving(false); }
  };

  if (loading) return <p className="text-gray-400">Cargando…</p>;

  return (
    <div className="text-white">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <a href="/grow/opcion-a" target="_blank" className="text-sm text-[#d946ef] underline">Ver página ↗</a>
        {dirty && <span className="text-xs text-amber-400">● sin guardar</span>}
        <div className="flex-1" />
        <button className="rounded bg-[#d946ef] px-4 py-2 text-sm font-bold text-white disabled:opacity-40" onClick={save} disabled={saving || !dirty}>{saving ? "Guardando…" : "Guardar"}</button>
      </div>
      {message && <p className={`mb-4 rounded border p-3 text-sm ${message.type === "ok" ? "border-green-800 text-green-300" : "border-red-800 text-red-300"}`}>{message.text}</p>}

      <section className="mb-6 grid gap-4 rounded-lg border border-[#292929] bg-[#0d0d0d] p-4 md:grid-cols-2">
        <label><span className={label}>Antetítulo</span><input className={input} value={config.eyebrow} onChange={(event) => patch({ eyebrow: event.target.value })} /></label>
        <label><span className={label}>Título general</span><input className={input} value={config.title} onChange={(event) => patch({ title: event.target.value })} /></label>
      </section>

      <div className="flex flex-col gap-5">
        {config.projects.map((project, index) => (
          <section key={index} className="rounded-lg border border-[#292929] bg-[#0d0d0d] p-4">
            <div className="mb-4 flex items-center gap-2"><strong>Proyecto {index + 1}</strong><div className="flex-1" /><button className={button} disabled={config.projects.length === 1} onClick={() => patch({ projects: config.projects.filter((_, i) => i !== index) })}>Quitar</button></div>
            <div className="grid gap-3 md:grid-cols-2">
              <label><span className={label}>Slug de la página</span><input className={input} value={project.slug} onChange={(event) => patchProject(index, { slug: event.target.value })} /></label>
              <label><span className={label}>Categoría</span><input className={input} value={project.eyebrow} onChange={(event) => patchProject(index, { eyebrow: event.target.value })} /></label>
              <label><span className={label}>Título</span><input className={input} value={project.title} onChange={(event) => patchProject(index, { title: event.target.value })} /></label>
              <label><span className={label}>Texto del botón</span><input className={input} value={project.action} onChange={(event) => patchProject(index, { action: event.target.value })} /></label>
              <label className="md:col-span-2"><span className={label}>Imagen</span><input className={input} value={project.image} onChange={(event) => patchProject(index, { image: event.target.value })} /><input className="mt-2 text-xs" type="file" accept="image/*" disabled={uploading === `${index}-image`} onChange={(event) => event.target.files?.[0] && uploadImage(index, event.target.files[0], "image")} /></label>
              <label className="md:col-span-2"><span className={label}>Logo superior derecha (URL)</span><input className={input} value={project.clientLogo || ""} onChange={(event) => patchProject(index, { clientLogo: event.target.value })} /><input className="mt-2 text-xs" type="file" accept="image/*" disabled={uploading === `${index}-clientLogo`} onChange={(event) => event.target.files?.[0] && uploadImage(index, event.target.files[0], "clientLogo")} /></label>
              <label className="md:col-span-2"><span className={label}>Figma (enlace para compartir)</span><input className={input} placeholder="https://www.figma.com/design/…" value={project.figmaUrl || ""} onChange={(event) => patchProject(index, { figmaUrl: event.target.value })} /></label>
              <label className="md:col-span-2"><span className={label}>Prototipo de Figma (enlace)</span><input className={input} placeholder="https://www.figma.com/proto/…" value={project.figmaPrototypeUrl || ""} onChange={(event) => patchProject(index, { figmaPrototypeUrl: event.target.value })} /></label>
              <label className="md:col-span-2"><span className={label}>Introducción de la página</span><textarea className={`${input} min-h-20`} value={project.summary} onChange={(event) => patchProject(index, { summary: event.target.value })} /></label>
              <label className="md:col-span-2"><span className={label}>Cuerpo del proyecto</span><textarea className={`${input} min-h-28`} value={project.body} onChange={(event) => patchProject(index, { body: event.target.value })} /></label>
            </div>
          </section>
        ))}
        <button className={`${button} border-dashed`} onClick={() => patch({ projects: [...config.projects, makeBlankGrowProject(config.projects.length)] })}>+ Agregar proyecto</button>
      </div>
    </div>
  );
}

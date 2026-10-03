"use client";

import { useEffect, useState } from "react";
import { Background, Controls, MarkerType, MiniMap, ReactFlow } from "@xyflow/react";
import { FLOW_EDGE_DEFINITIONS, FLOW_NODE_DEFINITIONS, defaultFlowConfig, mergeFlowConfig } from "../../data/growFlow";

const field = "w-full rounded border border-[#333] bg-[#111] px-2 py-2 text-sm text-white outline-none focus:border-[#00aff0]";
const SOCIAL_NODE_IDS = new Set(["audience", "social", "ads", "landing", "facebook-ads"]);

function EyeIcon({ hidden }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {hidden && <path d="m4 4 16 16" />}
    </svg>
  );
}

function TrashIcon() {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" /></svg>;
}

export default function GrowFlowEditor() {
  const [growConfig, setGrowConfig] = useState(null);
  const [flow, setFlow] = useState(defaultFlowConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState(null);
  const [newNodeLabel, setNewNodeLabel] = useState("Nuevo módulo");
  const [uploadingIcon, setUploadingIcon] = useState(null);

  useEffect(() => {
    fetch("/api/grow").then((response) => response.json()).then((data) => {
      if (!data.config) throw new Error("No se recibió la configuración de Grow.");
      setGrowConfig(data.config);
      setFlow(mergeFlowConfig(data.config.flow));
    }).catch((error) => setMessage({ type: "error", text: error.message })).finally(() => setLoading(false));
  }, []);

  const patchNode = (id, values) => {
    setFlow((current) => ({ ...current, nodes: { ...current.nodes, [id]: { ...current.nodes[id], ...values } } }));
    setDirty(true);
  };

  const patchCustomNode = (id, values) => {
    setFlow((current) => ({ ...current, customNodes: current.customNodes.map((node) => node.id === id ? { ...node, ...values } : node) }));
    setDirty(true);
  };

  const addNode = () => {
    const label = newNodeLabel.trim();
    if (!label) return;
    const id = `custom-${Date.now()}`;
    setFlow((current) => ({ ...current, customNodes: [...current.customNodes, { id, label, title: label, category: "Nodo personalizado", x: 600, y: 700, visible: true, color: "#6842e4", icon: "◆", iconImage: "" }] }));
    setNewNodeLabel("Nuevo módulo"); setDirty(true);
  };

  const uploadIcon = async (id, file, custom = false, fieldName = "iconImage") => {
    setUploadingIcon(`${id}-${fieldName}`); setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file); form.append("folder", "grow-flow-icons");
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo subir la imagen.");
      if (custom) patchCustomNode(id, { [fieldName]: data.url });
      else patchNode(id, { [fieldName]: data.url });
    } catch (error) { setMessage({ type: "error", text: error.message }); }
    finally { setUploadingIcon(null); }
  };

  const connect = ({ source, target }) => {
    if (!source || !target || source === target) return;
    const id = `custom-edge-${Date.now()}`;
    setFlow((current) => ({ ...current, customEdges: [...current.customEdges, { id, source, target, enabled: true }] }));
    setDirty(true);
  };

  const canvasNodes = [
    ...FLOW_NODE_DEFINITIONS.filter((node) => flow.nodes[node.id]?.visible !== false).map((node) => ({ 
      id: node.id, 
      position: { x: flow.nodes[node.id].x, y: flow.nodes[node.id].y }, 
      data: { label: `${flow.nodes[node.id].iconImage ? "▣　" : flow.nodes[node.id].icon ? `${flow.nodes[node.id].icon}　` : ""}${flow.nodes[node.id].title || node.label}` }, 
      style: { border: `1px solid ${flow.nodes[node.id].subColor || "#4b3f62"}`, borderRadius: 10, background: flow.nodes[node.id].color || "#17131c", color: "#fff", fontSize: 11, width: 170, display: "flex", justifyContent: "center", alignItems: "center" } 
    })),
    ...flow.customNodes.filter((node) => node.visible !== false).map((node) => ({ 
      id: node.id, 
      position: { x: node.x, y: node.y }, 
      data: { label: `${node.iconImage ? "▣　" : node.icon ? `${node.icon}　` : ""}${node.title || node.label}` }, 
      style: { border: "1px solid #00aff0", borderRadius: 10, background: node.color || "#10212a", color: "#fff", fontSize: 11, width: 170, display: "flex", justifyContent: "center", alignItems: "center" } 
    })),
  ];
  const visibleIds = new Set(canvasNodes.map((node) => node.id));
  const canvasEdges = [
    ...FLOW_EDGE_DEFINITIONS.filter((edge) => flow.edges[edge.id] !== false).map((edge) => ({ id: edge.id, source: edge.source, target: edge.target })),
    ...flow.customEdges.filter((edge) => edge.enabled !== false),
  ].filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)).map((edge) => ({ ...edge, type: "smoothstep", animated: true, style: { stroke: "#2f80ff", strokeWidth: 1.5, strokeDasharray: "7 7" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#2f80ff" } }));

  const moveNode = (_, node) => {
    if (flow.nodes[node.id]) patchNode(node.id, { x: Math.round(node.position.x), y: Math.round(node.position.y) });
    else patchCustomNode(node.id, { x: Math.round(node.position.x), y: Math.round(node.position.y) });
  };

  const deleteEdges = (deleted) => {
    const ids = new Set(deleted.map((edge) => edge.id));
    setFlow((current) => ({
      ...current,
      edges: Object.fromEntries(Object.entries(current.edges).map(([id, enabled]) => [id, ids.has(id) ? false : enabled])),
      customEdges: current.customEdges.filter((edge) => !ids.has(edge.id)),
    }));
    setDirty(true);
  };

  const deleteNodes = (deleted) => {
    const ids = new Set(deleted.map((node) => node.id));
    setFlow((current) => ({
      ...current,
      nodes: Object.fromEntries(Object.entries(current.nodes).map(([id, value]) => [id, ids.has(id) ? { ...value, visible: false } : value])),
      customNodes: current.customNodes.filter((node) => !ids.has(node.id)),
      customEdges: current.customEdges.filter((edge) => !ids.has(edge.source) && !ids.has(edge.target)),
    }));
    setDirty(true);
  };

  const removeNode = (id, custom = false) => {
    setFlow((current) => ({
      ...current,
      nodes: custom ? current.nodes : { ...current.nodes, [id]: { ...current.nodes[id], visible: false } },
      edges: custom ? current.edges : Object.fromEntries(Object.entries(current.edges).map(([edgeId, enabled]) => {
        const definition = FLOW_EDGE_DEFINITIONS.find((edge) => edge.id === edgeId);
        return [edgeId, definition?.source === id || definition?.target === id ? false : enabled];
      })),
      customNodes: custom ? current.customNodes.filter((node) => node.id !== id) : current.customNodes,
      customEdges: current.customEdges.filter((edge) => edge.source !== id && edge.target !== id),
    }));
    setDirty(true);
  };

  const reset = () => { setFlow(mergeFlowConfig(defaultFlowConfig)); setDirty(true); setMessage(null); };

  const save = async () => {
    if (!growConfig) return;
    setSaving(true); setMessage(null);
    try {
      const config = { ...growConfig, flow };
      const response = await fetch("/api/grow", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ config }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo guardar el flujo.");
      setGrowConfig(data.config); setFlow(mergeFlowConfig(data.config.flow)); setDirty(false);
      setMessage({ type: "ok", text: "Flujo guardado correctamente." });
    } catch (error) { setMessage({ type: "error", text: error.message }); }
    finally { setSaving(false); }
  };

  if (loading) return <p className="text-sm text-gray-400">Cargando flujo…</p>;

  return (
    <div className="text-white">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <a href="/grow/proyectos/identidad-visual" target="_blank" rel="noreferrer" className="text-sm text-[#00aff0] underline">Ver flujo público ↗</a>
        {dirty && <span className="text-xs text-amber-400">● sin guardar</span>}
        <div className="flex-1" />
        <button type="button" onClick={reset} className="rounded border border-[#3a3a3a] px-3 py-2 text-sm">Restaurar posiciones</button>
        <button type="button" onClick={save} disabled={!dirty || saving || !growConfig} className="rounded bg-[#00aff0] px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{saving ? "Guardando…" : "Guardar flujo"}</button>
      </div>

      {message && <p className={`mb-4 rounded border p-3 text-sm ${message.type === "ok" ? "border-green-800 text-green-300" : "border-red-800 text-red-300"}`}>{message.text}</p>}

      <section className="mb-6 rounded-lg border border-[#292929] bg-[#0d0d0d] p-4">
        <div className="mb-3 flex flex-wrap items-end gap-2">
          <div className="mr-auto"><h2 className="text-lg font-semibold">Lienzo editable</h2><p className="text-xs text-gray-400">Arrastra nodos y une los círculos. Selecciona una línea o nodo y pulsa Supr para eliminarlo.</p></div>
          <label><span className="mb-1 block text-[10px] uppercase text-gray-500">Nombre del nodo</span><input className={`${field} w-52`} value={newNodeLabel} onChange={(event) => setNewNodeLabel(event.target.value)} /></label>
          <button type="button" onClick={addNode} className="rounded bg-[#d946ef] px-4 py-2 text-sm font-bold">+ Agregar nodo</button>
        </div>
        <div className="h-[620px] overflow-hidden rounded border border-[#28232d] bg-[#080708]">
          <ReactFlow nodes={canvasNodes} edges={canvasEdges} onNodeDragStop={moveNode} onConnect={connect} onEdgesDelete={deleteEdges} onNodesDelete={deleteNodes} fitView minZoom={0.15} maxZoom={1.5} deleteKeyCode={["Backspace", "Delete"]}>
            <Background gap={22} size={1} color="#38313d" />
            <MiniMap nodeColor="#5333c7" maskColor="rgba(0,0,0,.72)" />
            <Controls />
          </ReactFlow>
        </div>
      </section>

      <section className="mb-6 rounded-lg border border-[#292929] bg-[#0d0d0d] p-4">
        <h2 className="mb-1 text-lg font-semibold">Nodos</h2>
        <p className="mb-4 text-xs text-gray-400">Edita la posición en el lienzo o desactiva un módulo. Las conexiones huérfanas se ocultan automáticamente.</p>
        <div className="grid gap-3 lg:grid-cols-2">
          {FLOW_NODE_DEFINITIONS.map((node) => {
            const value = flow.nodes[node.id];
            return (
              <article key={node.id} className="flex flex-col gap-3 rounded border border-[#252525] bg-black/30 p-3">
                <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                  <div><span className="mb-1 block text-[10px] uppercase text-gray-500">Categoría</span><strong className="flex min-h-[38px] items-center rounded border border-[#252525] bg-[#080808] px-3 text-sm text-gray-300">{node.category}</strong></div>
                  <label><span className="mb-1 block text-[10px] uppercase text-gray-500">Título personalizado</span><input className={field} value={value.title || node.label} onChange={(event) => patchNode(node.id, { title: event.target.value })} /></label>
                </div>
                <div className="grid gap-3 grid-cols-[auto_auto_64px_64px_1fr] items-end">
                  <button type="button" aria-label={value.visible ? `Ocultar ${node.label}` : `Mostrar ${node.label}`} aria-pressed={!value.visible} title={value.visible ? "Ocultar nodo" : "Mostrar nodo"} onClick={() => patchNode(node.id, { visible: !value.visible })} className={`grid h-9 w-9 place-items-center rounded border ${value.visible ? "border-[#3a3a3a] text-gray-300" : "border-[#00aff0] bg-[#08202a] text-[#00aff0]"}`}><EyeIcon hidden={!value.visible} /></button>
                  <button type="button" aria-label={`Eliminar ${node.label}`} title="Eliminar nodo y sus conexiones" onClick={() => removeNode(node.id)} className="grid h-9 w-9 place-items-center rounded border border-red-950 text-red-400 hover:bg-red-950/40"><TrashIcon /></button>
                  <label><span className="mb-1 block text-[10px] uppercase text-gray-500">Color</span><input type="color" className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent p-0" value={value.color || "#6842e4"} onChange={(event) => patchNode(node.id, { color: event.target.value })} /></label>
                  {SOCIAL_NODE_IDS.has(node.id) ? <label><span className="mb-1 block text-[10px] uppercase text-gray-500">Subcolor</span><input type="color" className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent p-0" value={value.subColor || "#25f4ee"} onChange={(event) => patchNode(node.id, { subColor: event.target.value })} /></label> : <span aria-hidden="true" />}
                  <div><span className="mb-1 block text-[10px] uppercase text-gray-500">Imagen del icono</span><input type="url" className={`${field} mb-2`} value={value.iconImage || ""} placeholder="https://…/icono.svg" onChange={(event) => patchNode(node.id, { iconImage: event.target.value })} /><div className="flex items-center gap-2">{value.iconImage && <img src={value.iconImage} alt="" className="h-9 w-9 rounded bg-white object-contain" />}<input type="file" accept="image/*" disabled={uploadingIcon === `${node.id}-iconImage`} className="min-w-0 text-xs" onChange={(event) => event.target.files?.[0] && uploadIcon(node.id, event.target.files[0], false, "iconImage")} />{value.iconImage && <button type="button" className="text-xs text-red-300" onClick={() => patchNode(node.id, { iconImage: "" })}>Quitar</button>}</div></div>
                  {node.id.includes("landing-page") && (
                    <div><span className="mb-1 block text-[10px] uppercase text-gray-500">Imagen de ejemplo</span><input type="url" className={`${field} mb-2`} value={value.previewImage || ""} placeholder="https://…/preview.jpg" onChange={(event) => patchNode(node.id, { previewImage: event.target.value })} /><div className="flex items-center gap-2">{value.previewImage && <img src={value.previewImage} alt="" className="h-9 w-9 rounded bg-white object-cover" />}<input type="file" accept="image/*" disabled={uploadingIcon === `${node.id}-previewImage`} className="min-w-0 text-xs" onChange={(event) => event.target.files?.[0] && uploadIcon(node.id, event.target.files[0], false, "previewImage")} />{value.previewImage && <button type="button" className="text-xs text-red-300" onClick={() => patchNode(node.id, { previewImage: "" })}>Quitar</button>}</div></div>
                  )}
                </div>
              </article>
            );
          })}
          {flow.customNodes.map((node) => (
            <article key={node.id} className="flex flex-col gap-3 rounded border border-[#00aff0]/40 bg-[#07151c] p-3">
              <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                <div><span className="mb-1 block text-[10px] uppercase text-gray-500">Categoría</span><strong className="flex min-h-[38px] items-center rounded border border-[#174153] bg-[#061016] px-3 text-sm text-[#7ddcff]">{node.category || "Nodo personalizado"}</strong></div>
                <label><span className="mb-1 block text-[10px] uppercase text-gray-500">Título personalizado</span><input className={field} value={node.title || node.label} onChange={(event) => patchCustomNode(node.id, { title: event.target.value, label: event.target.value })} /></label>
              </div>
              <div className="grid gap-3 grid-cols-[auto_auto_64px_1fr] items-end">
                <button type="button" aria-label={node.visible ? `Ocultar ${node.label}` : `Mostrar ${node.label}`} aria-pressed={!node.visible} title={node.visible ? "Ocultar nodo" : "Mostrar nodo"} onClick={() => patchCustomNode(node.id, { visible: !node.visible })} className={`grid h-9 w-9 place-items-center rounded border ${node.visible ? "border-[#3a3a3a] text-gray-300" : "border-[#00aff0] bg-[#08202a] text-[#00aff0]"}`}><EyeIcon hidden={!node.visible} /></button>
                <button type="button" aria-label={`Eliminar ${node.label}`} title="Eliminar nodo y sus conexiones" onClick={() => removeNode(node.id, true)} className="grid h-9 w-9 place-items-center rounded border border-red-950 text-red-400 hover:bg-red-950/40"><TrashIcon /></button>
                <label><span className="mb-1 block text-[10px] uppercase text-gray-500">Color</span><input type="color" className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent p-0" value={node.color || "#6842e4"} onChange={(event) => patchCustomNode(node.id, { color: event.target.value })} /></label>
                <div><span className="mb-1 block text-[10px] uppercase text-gray-500">Imagen del icono</span><input type="url" className={`${field} mb-2`} value={node.iconImage || ""} placeholder="https://…/icono.svg" onChange={(event) => patchCustomNode(node.id, { iconImage: event.target.value })} /><div className="flex items-center gap-2">{node.iconImage && <img src={node.iconImage} alt="" className="h-9 w-9 rounded bg-white object-contain" />}<input type="file" accept="image/*" disabled={uploadingIcon === `${node.id}-iconImage`} className="min-w-0 text-xs" onChange={(event) => event.target.files?.[0] && uploadIcon(node.id, event.target.files[0], true, "iconImage")} />{node.iconImage && <button type="button" className="text-xs text-red-300" onClick={() => patchCustomNode(node.id, { iconImage: "" })}>Quitar</button>}</div></div>
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}

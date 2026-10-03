"use client";

import { useEffect, useState } from "react";
import {
  defaultNavConfig,
  mergeNavConfig,
  makeBlankPill,
  makeBlankNavLink,
  makeBlankDropdownItem,
  PILL_ICON_PRESETS,
} from "../../data/navConfig";

const inputCls =
  "box-border w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#00aff0]";
const labelCls = "block text-[11px] uppercase tracking-wide text-gray-400 mb-1";
const btnCls =
  "box-border px-3 py-1.5 rounded text-sm font-medium border border-[#333] bg-[#1a1a1a] text-white hover:bg-[#262626] disabled:opacity-40";
const primaryBtnCls =
  "box-border px-4 py-1.5 rounded text-sm font-bold bg-[#00aff0] text-white hover:opacity-90 disabled:opacity-40";
const cardCls = "box-border rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-4";

// Preview sobre gris medio: logos claros u oscuros quedan visibles.
const previewBox =
  "rounded border border-[#222] bg-[#6b7280] flex items-center justify-center h-16 overflow-hidden";

// A nivel de módulo (no dentro del render) para no remontar el input al teclear.
function LogoField({ which, label, value, images, uploading, onUrl, onUpload }) {
  return (
    <div className="flex flex-col gap-2">
      <label className={labelCls}>{label}</label>
      <input
        className={inputCls}
        value={value ?? ""}
        placeholder="/SVG/… o https://…"
        onChange={(e) => onUrl(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <label className={`${btnCls} cursor-pointer ${uploading ? "opacity-40" : ""}`}>
          {uploading ? "Subiendo…" : "Subir SVG/PNG ↑"}
          <input
            type="file"
            accept="image/svg+xml,image/png,image/jpeg,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
        </label>
        <span className="text-[11px] text-gray-500">Se guarda sin convertir</span>
      </div>
      {images.length > 0 && (
        <select
          className={inputCls}
          value={images.includes(value) ? value : ""}
          onChange={(e) => e.target.value && onUrl(e.target.value)}
        >
          <option value="">— elegir existente (SVG/PNG) —</option>
          {images.map((img) => (
            <option key={img} value={img}>
              {img}
            </option>
          ))}
        </select>
      )}
      <div className={previewBox}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="preview" className="max-h-12 max-w-full object-contain" />
        ) : (
          <span className="text-black/60 text-xs">sin logo</span>
        )}
      </div>
    </div>
  );
}

export default function NavegadoresEditor() {
  const [config, setConfig] = useState(defaultNavConfig);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(null); // 'logo-desktop' | 'pill-2' | ...
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [cfgRes, imgRes] = await Promise.all([
          fetch("/api/nav-config").then((r) => r.json()),
          fetch("/api/images").then((r) => r.json()),
        ]);
        if (cfgRes?.config) setConfig(mergeNavConfig(cfgRes.config));
        setConfigured(Boolean(cfgRes?.configured));
        // Para logos: solo SVG/PNG de /public.
        setImages(
          (imgRes.images || []).filter((p) => /\.(svg|png)$/i.test(p)),
        );
      } catch (err) {
        setMessage({ type: "error", text: "No se pudo cargar: " + err.message });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- Setters (inmutables + marcar dirty) -----------------------------------
  const setLogo = (which, url) => {
    setConfig((c) => ({ ...c, logos: { ...c.logos, [which]: url } }));
    setDirty(true);
  };
  const setAuth = (which, field, value) => {
    setConfig((c) => ({
      ...c,
      auth: { ...c.auth, [which]: { ...c.auth[which], [field]: value } },
    }));
    setDirty(true);
  };
  const setPill = (index, patch) => {
    setConfig((c) => ({
      ...c,
      dock: c.dock.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));
    setDirty(true);
  };
  const addPill = () => {
    setConfig((c) => ({ ...c, dock: [...c.dock, makeBlankPill()] }));
    setDirty(true);
  };
  const removePill = (index) => {
    setConfig((c) => ({ ...c, dock: c.dock.filter((_, i) => i !== index) }));
    setDirty(true);
  };
  const movePill = (index, dir) => {
    const target = index + dir;
    setConfig((c) => {
      if (target < 0 || target >= c.dock.length) return c;
      const dock = [...c.dock];
      [dock[index], dock[target]] = [dock[target], dock[index]];
      return { ...c, dock };
    });
    setDirty(true);
  };

  const setNavLink = (index, patch) => {
    setConfig((c) => ({
      ...c,
      navLinks: c.navLinks.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));
    setDirty(true);
  };
  const addNavLink = () => {
    setConfig((c) => ({ ...c, navLinks: [...c.navLinks, makeBlankNavLink()] }));
    setDirty(true);
  };
  const removeNavLink = (index) => {
    setConfig((c) => ({ ...c, navLinks: c.navLinks.filter((_, i) => i !== index) }));
    setDirty(true);
  };
  const moveNavLink = (index, dir) => {
    const target = index + dir;
    setConfig((c) => {
      if (target < 0 || target >= c.navLinks.length) return c;
      const navLinks = [...c.navLinks];
      [navLinks[index], navLinks[target]] = [navLinks[target], navLinks[index]];
      return { ...c, navLinks };
    });
    setDirty(true);
  };

  const setDropdownItem = (linkIndex, ddIndex, patch) => {
    setConfig((c) => ({
      ...c,
      navLinks: c.navLinks.map((p, i) => {
        if (i !== linkIndex) return p;
        const dropdown = p.dropdown.map((dd, j) => j === ddIndex ? { ...dd, ...patch } : dd);
        return { ...p, dropdown };
      })
    }));
    setDirty(true);
  };
  const addDropdownItem = (linkIndex) => {
    setConfig((c) => ({
      ...c,
      navLinks: c.navLinks.map((p, i) => {
        if (i !== linkIndex) return p;
        return { ...p, dropdown: [...(p.dropdown || []), makeBlankDropdownItem()] };
      })
    }));
    setDirty(true);
  };
  const removeDropdownItem = (linkIndex, ddIndex) => {
    setConfig((c) => ({
      ...c,
      navLinks: c.navLinks.map((p, i) => {
        if (i !== linkIndex) return p;
        return { ...p, dropdown: p.dropdown.filter((_, j) => j !== ddIndex) };
      })
    }));
    setDirty(true);
  };
  const moveDropdownItem = (linkIndex, ddIndex, dir) => {
    const target = ddIndex + dir;
    setConfig((c) => ({
      ...c,
      navLinks: c.navLinks.map((p, i) => {
        if (i !== linkIndex) return p;
        if (target < 0 || target >= p.dropdown.length) return p;
        const dropdown = [...p.dropdown];
        [dropdown[ddIndex], dropdown[target]] = [dropdown[target], dropdown[ddIndex]];
        return { ...p, dropdown };
      })
    }));
    setDirty(true);
  };

  // --- Subida sin conversión (logos e iconos) --------------------------------
  const uploadRaw = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("raw", "true");
    fd.append("folder", "nav");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al subir el archivo");
    return data.url;
  };

  const uploadLogo = async (which, file) => {
    setUploading(`logo-${which}`);
    setMessage(null);
    try {
      const url = await uploadRaw(file);
      setLogo(which, url);
      setMessage({ type: "ok", text: "Logo subido. Recuerda guardar." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploading(null);
    }
  };

  const uploadPillIcon = async (index, file) => {
    setUploading(`pill-${index}`);
    setMessage(null);
    try {
      const url = await uploadRaw(file);
      setPill(index, { icon: url, iconType: "image" });
      setMessage({ type: "ok", text: "Icono subido. Recuerda guardar." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/nav-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setConfig(mergeNavConfig(data.config));
      setDirty(false);
      setMessage({
        type: "ok",
        text: "Navegadores guardados. Recarga el sitio para verlos.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400">Cargando…</p>;

  const { logos, auth, dock, navLinks = [] } = config;

  return (
    <div className="text-white">
      {/* Barra de acciones */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <a href="/" target="_blank" className="text-sm text-[#00aff0] underline">
          Ver sitio ↗
        </a>
        {dirty && <span className="text-[11px] text-amber-400">● sin guardar</span>}
        <div className="flex-1" />
        <button
          className={dirty ? primaryBtnCls : btnCls}
          onClick={save}
          disabled={saving}
        >
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
        {/* --- Logos ---------------------------------------------------------- */}
        <section className={cardCls}>
          <h2 className="text-sm font-bold text-gray-300 mb-4">Logos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LogoField
              which="desktop"
              label="Logo escritorio (nav superior)"
              value={logos.desktop}
              images={images}
              uploading={uploading === "logo-desktop"}
              onUrl={(url) => setLogo("desktop", url)}
              onUpload={(file) => uploadLogo("desktop", file)}
            />
            <LogoField
              which="mobileIsotipo"
              label="Isotipo móvil"
              value={logos.mobileIsotipo}
              images={images}
              uploading={uploading === "logo-mobileIsotipo"}
              onUrl={(url) => setLogo("mobileIsotipo", url)}
              onUpload={(file) => uploadLogo("mobileIsotipo", file)}
            />
          </div>
        </section>

        {/* --- Menú principal (navegador superior) --------------------------- */}
        <section className={cardCls}>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-bold text-gray-300">
              Menú Principal (Navegador superior)
            </h2>
            <span className="text-[11px] text-gray-500">
              {navLinks.length} enlaces
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {navLinks.map((link, index) => (
              <div key={index} className="box-border rounded-lg border border-[#222] bg-[#111] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-gray-400">Enlace {index + 1}</span>
                  <div className="flex-1" />
                  <button className={btnCls} onClick={() => moveNavLink(index, -1)} disabled={index === 0} aria-label="Subir">↑</button>
                  <button className={btnCls} onClick={() => moveNavLink(index, 1)} disabled={index === navLinks.length - 1} aria-label="Bajar">↓</button>
                  <button className="box-border px-3 py-1.5 rounded text-sm border border-red-800 bg-red-950/40 text-red-300 hover:bg-red-900/40" onClick={() => removeNavLink(index)}>Quitar</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className={labelCls}>Texto del enlace</label>
                    <input className={inputCls} value={link.label ?? ""} onChange={(e) => setNavLink(index, { label: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>URL (si no tiene menú desplegable)</label>
                    <input className={inputCls} value={link.href ?? ""} placeholder="/pagina" onChange={(e) => setNavLink(index, { href: e.target.value })} disabled={link.dropdown?.length > 0} />
                  </div>
                </div>

                <div className="rounded border border-[#333] bg-[#0a0a0a] p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-gray-400">Menú desplegable ({link.dropdown?.length || 0} items)</span>
                    <div className="flex-1" />
                    <button className={`${btnCls} !text-[11px] !py-1`} onClick={() => addDropdownItem(index)}>+ Añadir sub-enlace</button>
                  </div>
                  
                  {link.dropdown?.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {link.dropdown.map((dd, ddIndex) => (
                        <div key={ddIndex} className="flex flex-wrap md:flex-nowrap items-center gap-2">
                          <button className="text-gray-500 hover:text-white" onClick={() => moveDropdownItem(index, ddIndex, -1)} disabled={ddIndex === 0}>↑</button>
                          <button className="text-gray-500 hover:text-white" onClick={() => moveDropdownItem(index, ddIndex, 1)} disabled={ddIndex === link.dropdown.length - 1}>↓</button>
                          <input className={`${inputCls} flex-1 !py-1`} value={dd.label ?? ""} placeholder="Nombre" onChange={(e) => setDropdownItem(index, ddIndex, { label: e.target.value })} />
                          <input className={`${inputCls} flex-1 !py-1`} value={dd.href ?? ""} placeholder="URL" onChange={(e) => setDropdownItem(index, ddIndex, { href: e.target.value })} />
                          <button className="text-red-400 hover:text-red-300" onClick={() => removeDropdownItem(index, ddIndex)}>✕</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500">Sin menú desplegable. El usuario navegará a la URL principal.</p>
                  )}
                </div>
              </div>
            ))}
            
            <button className="box-border rounded-lg border border-dashed border-[#333] py-3 text-sm text-gray-300 hover:bg-[#141414]" onClick={addNavLink}>
              + Agregar enlace al menú principal
            </button>
          </div>
        </section>

        {/* --- Botones de auth ----------------------------------------------- */}
        <section className={cardCls}>
          <h2 className="text-sm font-bold text-gray-300 mb-4">
            Botones de registro / login
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { which: "register", title: "Registro" },
              { which: "login", title: "Login" },
            ].map(({ which, title }) => (
              <div key={which} className="flex flex-col gap-3">
                <div>
                  <label className={labelCls}>{title} · texto</label>
                  <input
                    className={inputCls}
                    value={auth[which].label ?? ""}
                    onChange={(e) => setAuth(which, "label", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>{title} · URL</label>
                  <input
                    className={inputCls}
                    value={auth[which].href ?? ""}
                    placeholder="/register"
                    onChange={(e) => setAuth(which, "href", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Dock inferior móvil ------------------------------------------- */}
        <section className={cardCls}>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-bold text-gray-300">
              Dock inferior móvil
            </h2>
            <span className="text-[11px] text-gray-500">
              {dock.length} accesos
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {dock.map((pill, index) => (
              <div
                key={index}
                className="box-border rounded-lg border border-[#222] bg-[#111] p-3"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-gray-400">
                    Acceso {index + 1}
                  </span>
                  <div className="flex-1" />
                  <button
                    className={btnCls}
                    onClick={() => movePill(index, -1)}
                    disabled={index === 0}
                    aria-label="Subir"
                  >
                    ↑
                  </button>
                  <button
                    className={btnCls}
                    onClick={() => movePill(index, 1)}
                    disabled={index === dock.length - 1}
                    aria-label="Bajar"
                  >
                    ↓
                  </button>
                  <button
                    className="box-border px-3 py-1.5 rounded text-sm border border-red-800 bg-red-950/40 text-red-300 hover:bg-red-900/40"
                    onClick={() => removePill(index)}
                  >
                    Quitar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className={labelCls}>Texto (aria-label)</label>
                      <input
                        className={inputCls}
                        value={pill.label ?? ""}
                        placeholder="Diseño"
                        onChange={(e) => setPill(index, { label: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>URL</label>
                      <input
                        className={inputCls}
                        value={pill.href ?? ""}
                        placeholder="/diseno"
                        onChange={(e) => setPill(index, { href: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className={labelCls}>Tipo de icono</label>
                      <select
                        className={inputCls}
                        value={pill.iconType || "preset"}
                        onChange={(e) =>
                          setPill(index, { iconType: e.target.value })
                        }
                      >
                        <option value="preset">Del set (dibujado)</option>
                        <option value="image">Imagen propia</option>
                      </select>
                    </div>

                    {pill.iconType === "image" ? (
                      <div className="flex flex-col gap-2">
                        <input
                          className={inputCls}
                          value={pill.icon ?? ""}
                          placeholder="URL del icono (SVG/PNG)"
                          onChange={(e) => setPill(index, { icon: e.target.value })}
                        />
                        <div className="flex items-center gap-2">
                          <label
                            className={`${btnCls} cursor-pointer ${
                              uploading === `pill-${index}` ? "opacity-40" : ""
                            }`}
                          >
                            {uploading === `pill-${index}`
                              ? "Subiendo…"
                              : "Subir icono ↑"}
                            <input
                              type="file"
                              accept="image/svg+xml,image/png,image/jpeg,image/webp"
                              className="hidden"
                              disabled={uploading === `pill-${index}`}
                              onChange={(e) => {
                                const file = e.target.files && e.target.files[0];
                                if (file) uploadPillIcon(index, file);
                                e.target.value = "";
                              }}
                            />
                          </label>
                          {pill.icon ? (
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#6b7280]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={pill.icon}
                                alt=""
                                className="max-h-6 max-w-6 object-contain"
                              />
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className={labelCls}>Icono</label>
                        <select
                          className={inputCls}
                          value={
                            PILL_ICON_PRESETS.includes(pill.icon)
                              ? pill.icon
                              : PILL_ICON_PRESETS[0]
                          }
                          onChange={(e) => setPill(index, { icon: e.target.value })}
                        >
                          {PILL_ICON_PRESETS.map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              className="box-border rounded-lg border border-dashed border-[#333] py-3 text-sm text-gray-300 hover:bg-[#141414]"
              onClick={addPill}
            >
              + Agregar acceso al dock
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export const FLOW_NODE_DEFINITIONS = [
  ["brief", "INICIO", 40, 210], ["audience", "Facebook Page", 330, -170],
  ["social", "Instagram", 330, 80], ["ads", "TikTok", 330, 280],
  ["landing", "Spotify", 330, 480], ["landing-page", "Landing Page", 720, 5],
  ["data-collection", "Recolección de datos", 1120, -15], ["facebook-pixel", "Facebook Pixel", 790, 570],
  ["facebook-ads", "Facebook ADS", 1400, 610], ["qr-download", "Descarga de QR", 1640, 70],
  ["qr-scanner", "Escanear QR", 2030, 110], ["status-update", "Actualización de estado", 2420, 110],
  ["sql-storage", "Almacenamiento SQL", 3760, 70], ["landing-page-ads", "Landing Page (2)", 1740, 610],
  ["data-collection-ads", "Recolección de datos (2)", 2130, 610], ["facebook-pixel-ads", "Facebook Pixel (2)", 1950, 1080],
  ["qr-download-ads", "Descarga de QR (2)", 2550, 610], ["qr-scanner-ads", "Escanear QR (2)", 2880, 610],
  ["status-update-ads", "Actualización de estado (2)", 3210, 610],
].map(([id, label, x, y]) => ({ id, label, category: label.replace(/ \(2\)$/, ""), x, y }));

export const FLOW_EDGE_DEFINITIONS = [
  ["brief-facebook", "INICIO → Facebook", "brief", "audience"], ["brief-instagram", "INICIO → Instagram", "brief", "social"],
  ["brief-tiktok", "INICIO → TikTok", "brief", "ads"], ["brief-spotify", "INICIO → Spotify", "brief", "landing"],
  ["facebook-landing-page", "Facebook → Landing Page", "audience", "landing-page"], ["instagram-landing-page", "Instagram → Landing Page", "social", "landing-page"],
  ["tiktok-landing-page", "TikTok → Landing Page", "ads", "landing-page"], ["spotify-landing-page", "Spotify → Landing Page", "landing", "landing-page"],
  ["landing-send-data", "Enviar datos → Recolección", "landing-page", "data-collection"], ["data-collection-pixel", "Exportar datos → Facebook Pixel", "data-collection", "facebook-pixel"],
  ["data-collection-qr", "Exportar datos → Descarga QR", "data-collection", "qr-download"], ["qr-download-scanner", "Descarga QR → Escanear QR", "qr-download", "qr-scanner"],
  ["qr-scanner-status", "Escanear QR → Actualización", "qr-scanner", "status-update"], ["status-sql-storage", "Actualización → SQL", "status-update", "sql-storage"],
  ["landing-exit-pixel", "Salió → Facebook Pixel", "landing-page", "facebook-pixel"], ["pixel-facebook-ads", "Facebook Pixel → Facebook ADS", "facebook-pixel", "facebook-ads"],
  ["facebook-ads-landing", "Facebook ADS → Landing Page (2)", "facebook-ads", "landing-page-ads"], ["ads-landing-send-data", "Enviar datos (2) → Recolección (2)", "landing-page-ads", "data-collection-ads"],
  ["ads-data-pixel", "Exportar datos (2) → Facebook Pixel (2)", "data-collection-ads", "facebook-pixel-ads"], ["ads-data-qr", "Exportar datos (2) → Descarga QR (2)", "data-collection-ads", "qr-download-ads"],
  ["ads-qr-download-scanner", "Descarga QR (2) → Escanear QR (2)", "qr-download-ads", "qr-scanner-ads"], ["ads-qr-scanner-status", "Escanear QR (2) → Actualización (2)", "qr-scanner-ads", "status-update-ads"],
  ["ads-status-sql-storage", "Actualización (2) → SQL", "status-update-ads", "sql-storage"], ["ads-landing-exit-pixel", "Salió (2) → Facebook Pixel (2)", "landing-page-ads", "facebook-pixel-ads"],
].map(([id, label, source, target]) => ({ id, label, source, target }));

export const defaultFlowConfig = {
  nodes: Object.fromEntries(FLOW_NODE_DEFINITIONS.map(({ id, label, x, y }) => [id, { x, y, visible: true, title: label, color: "", subColor: "", icon: "", iconImage: "", previewImage: "" }])),
  edges: Object.fromEntries(FLOW_EDGE_DEFINITIONS.map(({ id }) => [id, true])),
  customNodes: [],
  customEdges: [],
};

export function mergeFlowConfig(saved) {
  const nodes = { ...defaultFlowConfig.nodes };
  for (const definition of FLOW_NODE_DEFINITIONS) {
    const value = saved?.nodes?.[definition.id];
    if (!value || typeof value !== "object") continue;
    nodes[definition.id] = {
      x: Number.isFinite(Number(value.x)) ? Number(value.x) : definition.x,
      y: Number.isFinite(Number(value.y)) ? Number(value.y) : definition.y,
      visible: value.visible !== false,
      title: typeof value.title === "string" && value.title.trim() ? value.title : (typeof value.label === "string" && value.label.trim() ? value.label : definition.label),
      color: typeof value.color === "string" ? value.color : "",
      subColor: typeof value.subColor === "string" ? value.subColor : "",
      icon: typeof value.icon === "string" ? value.icon.slice(0, 12) : "",
      iconImage: typeof value.iconImage === "string" ? value.iconImage : "",
      previewImage: typeof value.previewImage === "string" ? value.previewImage : "",
    };
  }
  const edges = { ...defaultFlowConfig.edges };
  for (const definition of FLOW_EDGE_DEFINITIONS) {
    if (typeof saved?.edges?.[definition.id] === "boolean") edges[definition.id] = saved.edges[definition.id];
  }
  const customNodes = Array.isArray(saved?.customNodes) ? saved.customNodes.filter((node) => node?.id && (node?.title || node?.label)).map((node) => ({
    id: String(node.id), label: String(node.title || node.label), title: String(node.title || node.label), category: String(node.category || "Nodo personalizado"), x: Number(node.x) || 0, y: Number(node.y) || 0, visible: node.visible !== false,
    color: typeof node.color === "string" ? node.color : "", icon: typeof node.icon === "string" ? node.icon.slice(0, 12) : "",
    iconImage: typeof node.iconImage === "string" ? node.iconImage : "",
  })) : [];
  const validIds = new Set([...FLOW_NODE_DEFINITIONS.map((node) => node.id), ...customNodes.map((node) => node.id)]);
  const customEdges = Array.isArray(saved?.customEdges) ? saved.customEdges.filter((edge) => edge?.id && validIds.has(edge.source) && validIds.has(edge.target)).map((edge) => ({
    id: String(edge.id), source: String(edge.source), target: String(edge.target), enabled: edge.enabled !== false,
  })) : [];
  return { nodes, edges, customNodes, customEdges };
}

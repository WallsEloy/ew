"use client";

import { useEffect, useRef, useState } from "react";
import { Background, BackgroundVariant, Handle, MarkerType, Position, ReactFlow } from "@xyflow/react";
import { mergeFlowConfig } from "../data/growFlow";
import styles from "./ClientAdvertisingFlow.module.css";

function NodeIcon({ image, value, fallback }) {
  return image ? <img src={image} alt="" /> : (value || fallback);
}

function FacebookPageNode({ data }) {
  const title = data?.flowTitle || data?.title || "Facebook Page";
  const action = data?.action || "Get Started Button";
  return (
    <div className={styles.facebookNode}>
      <div className={styles.facebookHeader}>
        <Handle type="target" position={Position.Left} />
        <span className={styles.facebookMark}><NodeIcon image={data?.flowIconImage} value={data?.flowIcon} fallback="f" /></span>
        <strong>{title}</strong>
        <span className={styles.activeLabel}>Active</span>
        <span className={styles.switch} aria-hidden="true"><i /></span>
      </div>
      <div className={styles.facebookBody}>
        <dl className={styles.metrics}>
          <div><dt>Sent</dt><dd>---</dd></div>
          <div><dt>Delivered</dt><dd>---</dd></div>
          <div><dt>Seen</dt><dd>---</dd></div>
          <div><dt>Clicked</dt><dd>0</dd></div>
        </dl>
        <div className={styles.startedTitle}><strong>{action}</strong><span>i</span></div>
        <div className={styles.startedBox}>
          <div>{data?.buttonLabel || "Get Started"} <b>0%</b>{data?.outputHandle && <Handle id={data.outputHandle} type="source" position={Position.Right} />}</div>
        </div>
      </div>
      {data?.hasOutput !== false && <Handle type="source" position={Position.Right} />}
    </div>
  );
}

function PlatformNode({ data }) {
  return (
    <div className={styles.platformNode} style={{ "--platform": data.flowSubColor || data.color, "--platform-dark": data.dark }}>
      <div className={styles.platformHeader}>
        <Handle type="target" position={Position.Left} />
        <span className={styles.platformMark}><NodeIcon image={data.flowIconImage} value={data.flowIcon} fallback={data.mark} /></span>
        <div><strong>{data.flowTitle || data.platform}</strong><small>{data.account}</small></div>
        <span className={styles.platformStatus}>Active</span>
      </div>
      <div className={styles.platformBody}>
        <dl className={styles.platformMetrics}>
          <div><dt>Reach</dt><dd>{data.reach}</dd></div>
          <div><dt>Views</dt><dd>{data.views}</dd></div>
          <div><dt>Clicks</dt><dd>{data.clicks}</dd></div>
        </dl>
        <div className={styles.platformAction}><span>{data.action}</span><b>{data.progress}</b></div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function LandingPageNode({ data }) {
  return (
    <div className={styles.landingNode}>
      <div className={styles.landingHeader}>
        <Handle type="target" position={Position.Left} />
        <span className={styles.landingMark}><NodeIcon image={data?.flowIconImage} value={data?.flowIcon} fallback="▤" /></span>
        <div><strong>{data?.flowTitle || "Landing Page"}</strong><small>Diseño y recolección de datos</small></div>
        <span className={styles.landingActive}>Active</span>
        <span className={styles.landingSwitch}><i /></span>
      </div>
      <dl className={styles.landingMetrics}>
        <div><dt>Vistas</dt><dd>1,248</dd></div>
        <div><dt>Visitantes</dt><dd>842</dd></div>
        <div><dt>Leads</dt><dd>156</dd></div>
        <div><dt>Conversión</dt><dd>12.5%</dd></div>
      </dl>
      <div className={styles.landingPreview}>
        {data?.previewImage ? (
          <img src={data.previewImage} alt="Landing Page Preview" style={{ display: "block", width: "100%", height: "auto", objectFit: "cover", borderRadius: "4px" }} />
        ) : (
          <>
            <div className={styles.previewNav}><b>TuMarca</b><span>Inicio · Servicios · Contacto</span></div>
            <strong>Soluciones que impulsan tu negocio</strong>
            <span>Experiencias digitales que convierten.</span>
            <i>Solicitar demo</i>
          </>
        )}
      </div>
      <div className={styles.landingActions}>
        <span>Enviar datos<Handle id="send-data" type="source" position={Position.Right} /></span>
        <span>Salió<Handle id="exit" type="source" position={Position.Right} /></span>
      </div>
    </div>
  );
}

function DataCollectionNode({ data }) {
  const fields = [
    ["Nombre", "156"], ["Correo electrónico", "156"], ["Teléfono", "98"],
    ["Empresa", "64"], ["Mensaje", "54"],
  ];
  return (
    <div className={styles.dataNode}>
      <div className={styles.dataHeader}>
        <Handle type="target" position={Position.Left} />
        <span className={styles.dataMark}><NodeIcon image={data?.flowIconImage} value={data?.flowIcon} fallback="☷" /></span>
        <div><strong>{data?.flowTitle || "Recolección de datos"}</strong><small>Datos recopilados en la landing page</small></div>
        <span className={styles.dataActive}>Active</span>
      </div>
      <dl className={styles.dataMetrics}>
        <div><dt>Total</dt><dd>156</dd></div><div><dt>Hoy</dt><dd>12</dd></div>
        <div><dt>Semana</dt><dd>42</dd></div><div><dt>Conversión</dt><dd>12.5%</dd></div>
      </dl>
      <div className={styles.dataTable}>
        <div className={styles.dataTableHead}><span>Campo</span><span>Envíos</span></div>
        {fields.map(([name, value]) => <div className={styles.dataRow} key={name}><i>{name.slice(0, 1)}</i><span>{name}</span><b>{value}</b><em>›</em></div>)}
      </div>
      <div className={styles.dataFooter}>
        <span><i /> Actualizado hace 2 minutos</span>
        <b>Exportar datos<Handle id="export" type="source" position={Position.Right} /></b>
      </div>
    </div>
  );
}

function FacebookPixelNode({ data }) {
  const events = [
    ["🛒", "Purchase", "56", "+12%"],
    ["▣", "InitiateCheckout", "98", "+8%"],
    ["◉", "ViewContent", "1,245", "+15%"],
    ["♟", "Lead", "156", "+10%"],
    ["➤", "PageView", "3,245", "−5%"],
  ];

  return (
    <div className={styles.pixelNode}>
      <div className={styles.pixelHeader}>
        <Handle type="target" position={Position.Left} />
        <span className={styles.pixelMark}><NodeIcon image={data?.flowIconImage} value={data?.flowIcon} fallback="</>" /></span>
        <div><strong>{data?.flowTitle || "Facebook Pixel"}</strong><small>Estado y rendimiento del píxel</small></div>
        <span className={styles.pixelNetworks} aria-label="Redes conectadas: Facebook, Instagram y TikTok">
          <i className={styles.pixelFacebook}>f</i>
          <i className={styles.pixelInstagram}>IG</i>
          <i className={styles.pixelTikTok}>TT</i>
        </span>
        <span className={styles.pixelActive}>Active</span>
        <span className={styles.pixelSwitch}><i /></span>
      </div>
      <dl className={styles.pixelMetrics}>
        <div><dt>Estado del Pixel</dt><dd className={styles.pixelOnline}>● Activo</dd><small>Funciona correctamente</small></div>
        <div><dt>Eventos recibidos</dt><dd>2,458</dd><small>⌁⌁⌁ Últimos 7 días</small></div>
        <div><dt>Conversiones</dt><dd>156</dd><small>⌁⌁⌁ Últimos 7 días</small></div>
        <div><dt>Última actividad</dt><dd>Hace 2 minutos <i /></dd><small>Eventos recibidos</small></div>
      </dl>
      <div className={styles.pixelContent}>
        <div className={styles.pixelEvents}>
          <strong>Eventos principales ⓘ</strong>
          {events.map(([icon, name, total, trend]) => (
            <div className={styles.pixelEvent} key={name}>
              <i>{icon}</i><span>{name}</span><b>{total}<small>Eventos</small></b>
              <em className={trend.startsWith("−") ? styles.pixelDown : ""}>{trend}</em>
            </div>
          ))}
          <span className={styles.pixelAll}>Ver todos los eventos　›</span>
        </div>
        <aside className={styles.pixelConnection}>
          <strong>Estado de conexión</strong>
          <i>✓</i><b>Conectado</b><span>Tu Pixel está recibiendo eventos correctamente.</span>
          <hr /><small>Pixel ID</small><code>123456789012345</code><small>Instalado en</small><code>www.tudominio.com</code>
        </aside>
      </div>
      <div className={styles.pixelFooter}>
        <span><b>ⓘ Recomendación</b><small>Verifica que tu Pixel esté instalado en las páginas importantes.</small></span>
        <strong>↗ Ver ayuda<Handle id="help" type="source" position={Position.Right} /></strong>
      </div>
    </div>
  );
}

function QrDownloadNode({ data }) {
  return (
    <div className={styles.qrNode}>
      <div className={styles.qrHeader}>
        <Handle type="target" position={Position.Left} />
        <span className={styles.qrMark}><NodeIcon image={data?.flowIconImage} value={data?.flowIcon} fallback="▦" /></span>
        <strong>{data?.flowTitle || "Descarga de QR"}</strong>
      </div>
      <div className={styles.qrBody}>
        <div className={styles.qrCode} aria-label="Código QR decorativo">
          <i /><i /><i /><i /><i /><i /><i /><i /><i />
        </div>
        <span className={styles.qrButton}>⇩　Descargar QR<Handle id="download" type="source" position={Position.Right} /></span>
      </div>
    </div>
  );
}

function QrScannerNode({ data }) {
  return (
    <div className={styles.scannerNode}>
      <div className={styles.scannerHeader}>
        <Handle type="target" position={Position.Left} />
        <span className={styles.scannerMark}><NodeIcon image={data?.flowIconImage} value={data?.flowIcon} fallback="⌗" /></span>
        <strong>{data?.flowTitle || "Escanear QR"}</strong>
      </div>
      <div className={styles.scannerBody}>
        <div className={styles.scannerFrame}>
          <span className={styles.scannerGhost}>▦</span>
          <i />
        </div>
        <p>Coloca el código QR dentro del marco<br />para escanear</p>
        <span className={styles.scannerButton}>⌗　Escanear QR<Handle id="scan" type="source" position={Position.Right} /></span>
      </div>
    </div>
  );
}

function StatusUpdateNode({ data }) {
  return (
    <div className={styles.statusNode}>
      <div className={styles.statusHeader}>
        <Handle type="target" position={Position.Left} />
        <span className={styles.statusMark}><NodeIcon image={data?.flowIconImage} value={data?.flowIcon} fallback="⟳" /></span>
        <strong>{data?.flowTitle || "Actualización de estado"}</strong>
      </div>
      <div className={styles.statusBody}>
        <span className={styles.statusCheck}>✓</span>
        <strong>Estado actualizado</strong>
        <p>El estado ha sido marcado como</p>
        <b>Escaneado</b>
        <hr />
        <small><i /> <strong>Actualizado</strong>　•　Ahora</small>
        <span className={styles.statusButton}>Guardar estado<Handle id="save" type="source" position={Position.Right} /></span>
      </div>
    </div>
  );
}

function SqlStorageNode({ data }) {
  return (
    <div className={styles.sqlNode}>
      <div className={styles.sqlHeader}>
        <Handle type="target" position={Position.Left} />
        <span className={styles.sqlMark}><NodeIcon image={data?.flowIconImage} value={data?.flowIcon} fallback="◉" /></span>
        <strong>{data?.flowTitle || "Almacenamiento SQL"}</strong>
      </div>
      <div className={styles.sqlBody}>
        <div className={styles.sqlSummary}>
          <span><i>▤</i><small>Base de datos</small><strong>proyecto_principal</strong></span>
          <span><small>Estado</small><strong className={styles.sqlConnected}>● Conectado</strong></span>
        </div>
        <hr />
        <strong className={styles.sqlUsageTitle}>Uso de almacenamiento</strong>
        <div className={styles.sqlUsage}>
          <span className={styles.sqlRing}><b>42%</b><small>usado</small></span>
          <dl><div><dt>Usado</dt><dd>4.2 GB</dd></div><div><dt>Disponible</dt><dd>5.8 GB</dd></div><div><dt>Total</dt><dd>10 GB</dd></div></dl>
        </div>
        <div className={styles.sqlBar}><i /></div>
        <div className={styles.sqlStats}>
          <span><small>Tablas</small><b>28</b></span><span><small>Registros</small><b>1.2 M</b></span><span><small>Índices</small><b>15</b></span>
        </div>
        <span className={styles.sqlButton}>◉　Gestionar almacenamiento</span>
      </div>
    </div>
  );
}

function CustomFlowNode({ data }) {
  return (
    <div className={styles.customFlowNode}>
      <div><Handle type="target" position={Position.Left} /><strong>{(data.flowIcon || data.flowIconImage) && <i><NodeIcon image={data.flowIconImage} value={data.flowIcon} /></i>}{data.label}</strong></div>
      <span>Continuar<Handle id="output" type="source" position={Position.Right} /></span>
    </div>
  );
}

const nodeTypes = { facebookPage: FacebookPageNode, platform: PlatformNode, landingPage: LandingPageNode, dataCollection: DataCollectionNode, facebookPixel: FacebookPixelNode, qrDownload: QrDownloadNode, qrScanner: QrScannerNode, statusUpdate: StatusUpdateNode, sqlStorage: SqlStorageNode, customFlow: CustomFlowNode };

const baseNodes = [
  { id: "brief", position: { x: 40, y: 210 }, data: { label: "INICIO" }, className: styles.nodeStart },
  { id: "audience", type: "facebookPage", position: { x: 330, y: -170 }, data: {} },
  { id: "social", type: "platform", position: { x: 330, y: 80 }, data: { platform: "Instagram", account: "Business profile", mark: "IG", color: "#d946ef", dark: "#6d1d78", reach: "24K", views: "31K", clicks: "1.8K", action: "View profile", progress: "72%" } },
  { id: "ads", type: "platform", position: { x: 330, y: 280 }, data: { platform: "TikTok", account: "Ads account", mark: "TT", color: "#25f4ee", dark: "#b3154f", reach: "48K", views: "83K", clicks: "3.2K", action: "Watch video", progress: "86%" } },
  { id: "landing", type: "platform", position: { x: 330, y: 480 }, data: { platform: "Spotify", account: "Audio campaign", mark: "SP", color: "#1ed760", dark: "#116b35", reach: "19K", views: "27K", clicks: "940", action: "Listen now", progress: "64%" } },
  { id: "landing-page", type: "landingPage", position: { x: 720, y: 5 }, data: {} },
  { id: "data-collection", type: "dataCollection", position: { x: 1120, y: -15 }, data: {} },
  { id: "facebook-pixel", type: "facebookPixel", position: { x: 790, y: 570 }, data: {} },
  { id: "facebook-ads", type: "facebookPage", position: { x: 1400, y: 610 }, data: { title: "Facebook ADS", action: "Create Campaign Button", buttonLabel: "Create Campaign", outputHandle: "campaign", hasOutput: false } },
  { id: "landing-page-ads", type: "landingPage", position: { x: 1740, y: 610 }, data: {} },
  { id: "data-collection-ads", type: "dataCollection", position: { x: 2130, y: 610 }, data: {} },
  { id: "facebook-pixel-ads", type: "facebookPixel", position: { x: 1950, y: 1080 }, data: {} },
  { id: "qr-download-ads", type: "qrDownload", position: { x: 2550, y: 610 }, data: {} },
  { id: "qr-scanner-ads", type: "qrScanner", position: { x: 2880, y: 610 }, data: {} },
  { id: "status-update-ads", type: "statusUpdate", position: { x: 3210, y: 610 }, data: {} },
  { id: "qr-download", type: "qrDownload", position: { x: 1640, y: 70 }, data: {} },
  { id: "qr-scanner", type: "qrScanner", position: { x: 2030, y: 110 }, data: {} },
  { id: "status-update", type: "statusUpdate", position: { x: 2420, y: 110 }, data: {} },
  { id: "sql-storage", type: "sqlStorage", position: { x: 3760, y: 70 }, data: {} },
];

const edge = (id, source, target, sourceHandle) => ({
  id, source, target, type: "smoothstep",
  sourceHandle,
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, color: "#2f80ff" },
  style: { stroke: "#2f80ff", strokeWidth: 1.5, strokeDasharray: "7 7" },
});

const baseEdges = [
  edge("brief-facebook", "brief", "audience"), edge("brief-instagram", "brief", "social"),
  edge("brief-tiktok", "brief", "ads"), edge("brief-spotify", "brief", "landing"),
  edge("facebook-landing-page", "audience", "landing-page"), edge("instagram-landing-page", "social", "landing-page"),
  edge("tiktok-landing-page", "ads", "landing-page"),
  edge("spotify-landing-page", "landing", "landing-page"),
  edge("landing-send-data", "landing-page", "data-collection", "send-data"),
  edge("data-collection-pixel", "data-collection", "facebook-pixel", "export"),
  edge("data-collection-qr", "data-collection", "qr-download", "export"),
  edge("qr-download-scanner", "qr-download", "qr-scanner", "download"),
  edge("qr-scanner-status", "qr-scanner", "status-update", "scan"),
  edge("status-sql-storage", "status-update", "sql-storage", "save"),
  edge("landing-exit-pixel", "landing-page", "facebook-pixel", "exit"),
  edge("pixel-facebook-ads", "facebook-pixel", "facebook-ads", "help"),
  edge("facebook-ads-landing", "facebook-ads", "landing-page-ads", "campaign"),
  edge("ads-landing-send-data", "landing-page-ads", "data-collection-ads", "send-data"),
  edge("ads-data-pixel", "data-collection-ads", "facebook-pixel-ads", "export"),
  edge("ads-data-qr", "data-collection-ads", "qr-download-ads", "export"),
  edge("ads-qr-download-scanner", "qr-download-ads", "qr-scanner-ads", "download"),
  edge("ads-qr-scanner-status", "qr-scanner-ads", "status-update-ads", "scan"),
  edge("ads-status-sql-storage", "status-update-ads", "sql-storage", "save"),
  edge("ads-landing-exit-pixel", "landing-page-ads", "facebook-pixel-ads", "exit"),
];

export default function ClientAdvertisingFlow({ config }) {
  // El lienzo arranca bloqueado para que el scroll de la página no lo acerque
  // por accidente; el botón "Moverte en el flujo" activa arrastre y zoom.
  const [explorando, setExplorando] = useState(false);
  // Aviso breve: el botón se ilumina si alguien intenta mover el flujo bloqueado
  const [aviso, setAviso] = useState(false);
  const avisoRef = useRef(null);
  useEffect(() => () => window.clearTimeout(avisoRef.current), []);
  const avisarBloqueo = () => {
    if (explorando) return;
    setAviso(true);
    window.clearTimeout(avisoRef.current);
    avisoRef.current = window.setTimeout(() => setAviso(false), 1600);
  };
  const alternarExploracion = () => {
    window.clearTimeout(avisoRef.current);
    setAviso(false);
    setExplorando((actual) => !actual);
  };

  const flowConfig = mergeFlowConfig(config);
  const customNodes = flowConfig.customNodes.map((node) => ({ id: node.id, type: "customFlow", position: { x: node.x, y: node.y }, data: { label: node.title || node.label, flowIcon: node.icon, flowIconImage: node.iconImage }, style: node.color ? { "--flow-accent": node.color } : undefined }));
  const allNodes = [...baseNodes, ...customNodes];
  const visibleNodeIds = new Set(
    allNodes.filter((node) => node.type === "customFlow" ? flowConfig.customNodes.find((item) => item.id === node.id)?.visible !== false : flowConfig.nodes[node.id]?.visible !== false).map((node) => node.id),
  );
  const nodes = allNodes
    .filter((node) => visibleNodeIds.has(node.id))
    .map((node) => {
      if (node.type === "customFlow") return node;
      const edited = flowConfig.nodes[node.id];
      return {
        ...node,
        position: { x: edited?.x ?? node.position.x, y: edited?.y ?? node.position.y },
        data: { ...node.data, ...(node.type ? { flowTitle: edited?.title || node.data.title || node.data.platform, flowIcon: edited?.icon || "", flowIconImage: edited?.iconImage || "", flowSubColor: edited?.subColor || "", previewImage: edited?.previewImage || "" } : { label: <span className={styles.inlineNodeLabel}>{edited?.iconImage && <img src={edited.iconImage} alt="" />}{!edited?.iconImage && edited?.icon}{edited?.title || node.data.label}</span> }) },
        style: edited?.color || edited?.subColor ? { ...node.style, ...(edited.color ? { "--flow-accent": edited.color } : {}), ...(edited.subColor ? { "--flow-sub-accent": edited.subColor } : {}), ...(edited.color && !node.type ? { background: edited.color } : {}) } : node.style,
      };
    });
  const primaryOutput = { "landing-page": "send-data", "landing-page-ads": "send-data", "data-collection": "export", "data-collection-ads": "export", "facebook-pixel": "help", "facebook-pixel-ads": "help", "facebook-ads": "campaign", "qr-download": "download", "qr-download-ads": "download", "qr-scanner": "scan", "qr-scanner-ads": "scan", "status-update": "save", "status-update-ads": "save" };
  const customEdges = flowConfig.customEdges.map((item) => edge(item.id, item.source, item.target, primaryOutput[item.source] || (flowConfig.customNodes.some((node) => node.id === item.source) ? "output" : undefined)));
  const edges = [...baseEdges.filter((item) => flowConfig.edges[item.id] !== false), ...customEdges.filter((item) => flowConfig.customEdges.find((saved) => saved.id === item.id)?.enabled !== false)]
    .filter((item) => visibleNodeIds.has(item.source) && visibleNodeIds.has(item.target));

  return (
    <section className={styles.section} aria-labelledby="client-flow-title">
      <div className={styles.heading}>
        <span>Arquitectura de campaña</span>
        <h2 id="client-flow-title">De una necesidad a un sistema publicitario.</h2>
        <p>Una lectura visual del recorrido: estrategia, concepto, ejecución, medición y aprendizaje.</p>
      </div>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={`${styles.exploreButton} ${explorando || aviso ? styles.exploreButtonActive : ""}`}
          onClick={alternarExploracion}
          aria-pressed={explorando}
        >
          {explorando ? "✕　Bloquear flujo" : "⤢　Moverte en el flujo"}
        </button>
      </div>
      <div className={`${styles.canvas} ${explorando ? "" : styles.canvasLocked}`} onPointerDown={avisarBloqueo}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.16 }}
          minZoom={0.45}
          maxZoom={1.25}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnDoubleClick={false}
          panOnDrag={explorando}
          zoomOnScroll={explorando}
          zoomOnPinch={explorando}
          preventScrolling={explorando}
          proOptions={{ hideAttribution: true }}
          aria-label="Flujo visual de una campaña publicitaria"
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#353039" />
        </ReactFlow>
        <div className={styles.hint}>{explorando ? "Arrastra para recorrer · rueda para acercar" : "Pulsa «Moverte en el flujo» para recorrerlo"}</div>
      </div>
    </section>
  );
}

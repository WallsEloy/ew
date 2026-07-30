"use client";

import { Background, BackgroundVariant, Handle, MarkerType, Position, ReactFlow } from "@xyflow/react";
import styles from "./ClientAdvertisingFlow.module.css";

function FacebookPageNode() {
  return (
    <div className={styles.facebookNode}>
      <div className={styles.facebookHeader}>
        <Handle type="target" position={Position.Left} />
        <span className={styles.facebookMark}>f</span>
        <strong>Facebook Page</strong>
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
        <div className={styles.startedTitle}><strong>Get Started Button</strong><span>i</span></div>
        <div className={styles.startedBox}><div>Get Started <b>0%</b></div></div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function PlatformNode({ data }) {
  return (
    <div className={styles.platformNode} style={{ "--platform": data.color, "--platform-dark": data.dark }}>
      <div className={styles.platformHeader}>
        <Handle type="target" position={Position.Left} />
        <span className={styles.platformMark}>{data.mark}</span>
        <div><strong>{data.platform}</strong><small>{data.account}</small></div>
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

function LandingPageNode() {
  return (
    <div className={styles.landingNode}>
      <div className={styles.landingHeader}>
        <Handle type="target" position={Position.Left} />
        <span className={styles.landingMark}>▤</span>
        <div><strong>Landing Page</strong><small>Diseño y recolección de datos</small></div>
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
        <div className={styles.previewNav}><b>TuMarca</b><span>Inicio · Servicios · Contacto</span></div>
        <strong>Soluciones que impulsan tu negocio</strong>
        <span>Experiencias digitales que convierten.</span>
        <i>Solicitar demo</i>
      </div>
      <div className={styles.landingActions}>
        <span>Enviar datos<Handle id="send-data" type="source" position={Position.Right} /></span>
        <span>Salió<Handle id="exit" type="source" position={Position.Right} /></span>
      </div>
    </div>
  );
}

function DataCollectionNode() {
  const fields = [
    ["Nombre", "156"], ["Correo electrónico", "156"], ["Teléfono", "98"],
    ["Empresa", "64"], ["Mensaje", "54"],
  ];
  return (
    <div className={styles.dataNode}>
      <div className={styles.dataHeader}>
        <Handle type="target" position={Position.Left} />
        <span className={styles.dataMark}>☷</span>
        <div><strong>Recolección de datos</strong><small>Datos recopilados en la landing page</small></div>
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

function FacebookPixelNode() {
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
        <span className={styles.pixelMark}>&lt;/&gt;</span>
        <div><strong>Facebook Pixel</strong><small>Estado y rendimiento del píxel</small></div>
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

function QrDownloadNode() {
  return (
    <div className={styles.qrNode}>
      <div className={styles.qrHeader}>
        <Handle type="target" position={Position.Left} />
        <span className={styles.qrMark}>▦</span>
        <strong>Descarga de QR</strong>
      </div>
      <div className={styles.qrBody}>
        <div className={styles.qrCode} aria-label="Código QR decorativo">
          <i /><i /><i /><i /><i /><i /><i /><i /><i />
        </div>
        <span className={styles.qrButton}>⇩　Descargar QR</span>
      </div>
    </div>
  );
}

const nodeTypes = { facebookPage: FacebookPageNode, platform: PlatformNode, landingPage: LandingPageNode, dataCollection: DataCollectionNode, facebookPixel: FacebookPixelNode, qrDownload: QrDownloadNode };

const nodes = [
  { id: "brief", position: { x: 40, y: 210 }, data: { label: "INICIO" }, className: styles.nodeStart },
  { id: "audience", type: "facebookPage", position: { x: 330, y: -170 }, data: {} },
  { id: "social", type: "platform", position: { x: 330, y: 80 }, data: { platform: "Instagram", account: "Business profile", mark: "IG", color: "#d946ef", dark: "#6d1d78", reach: "24K", views: "31K", clicks: "1.8K", action: "View profile", progress: "72%" } },
  { id: "ads", type: "platform", position: { x: 330, y: 280 }, data: { platform: "TikTok", account: "Ads account", mark: "TT", color: "#25f4ee", dark: "#b3154f", reach: "48K", views: "83K", clicks: "3.2K", action: "Watch video", progress: "86%" } },
  { id: "landing", type: "platform", position: { x: 330, y: 480 }, data: { platform: "Spotify", account: "Audio campaign", mark: "SP", color: "#1ed760", dark: "#116b35", reach: "19K", views: "27K", clicks: "940", action: "Listen now", progress: "64%" } },
  { id: "landing-page", type: "landingPage", position: { x: 720, y: 5 }, data: {} },
  { id: "data-collection", type: "dataCollection", position: { x: 1120, y: -15 }, data: {} },
  { id: "facebook-pixel", type: "facebookPixel", position: { x: 790, y: 570 }, data: {} },
  { id: "qr-download", type: "qrDownload", position: { x: 1240, y: 570 }, data: {} },
  { id: "concept", position: { x: 1980, y: 315 }, data: { label: "02  Concepto creativo" }, className: styles.nodeAccent },
  { id: "measure", position: { x: 2270, y: 315 }, data: { label: "03  Medición" }, className: styles.node },
  { id: "learn", position: { x: 2520, y: 315 }, data: { label: "04  Aprendizaje" }, className: styles.nodePrimary },
];

const edge = (id, source, target, sourceHandle) => ({
  id, source, target, type: "smoothstep",
  sourceHandle,
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, color: "#2f80ff" },
  style: { stroke: "#2f80ff", strokeWidth: 1.5, strokeDasharray: "7 7" },
});

const edges = [
  edge("brief-facebook", "brief", "audience"), edge("brief-instagram", "brief", "social"),
  edge("brief-tiktok", "brief", "ads"), edge("brief-spotify", "brief", "landing"),
  edge("facebook-landing-page", "audience", "landing-page"), edge("instagram-landing-page", "social", "landing-page"),
  edge("tiktok-landing-page", "ads", "landing-page"),
  edge("spotify-landing-page", "landing", "landing-page"),
  edge("landing-send-data", "landing-page", "data-collection", "send-data"),
  edge("data-collection-pixel", "data-collection", "facebook-pixel", "export"),
  edge("data-collection-qr", "data-collection", "qr-download", "export"),
  edge("landing-exit-pixel", "landing-page", "facebook-pixel", "exit"),
  edge("pixel-concept", "facebook-pixel", "concept", "help"),
  edge("concept-measure", "concept", "measure"),
  edge("measure-learn", "measure", "learn"),
];

export default function ClientAdvertisingFlow() {
  return (
    <section className={styles.section} aria-labelledby="client-flow-title">
      <div className={styles.heading}>
        <span>Arquitectura de campaña</span>
        <h2 id="client-flow-title">De una necesidad a un sistema publicitario.</h2>
        <p>Una lectura visual del recorrido: estrategia, concepto, ejecución, medición y aprendizaje.</p>
      </div>
      <div className={styles.canvas}>
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
          proOptions={{ hideAttribution: true }}
          aria-label="Flujo visual de una campaña publicitaria"
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#353039" />
        </ReactFlow>
        <div className={styles.hint}>Arrastra para recorrer · rueda para acercar</div>
      </div>
    </section>
  );
}

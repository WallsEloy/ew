"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { graphEdges, visualGraphScenes } from "../data/visualGraphs";
import { defaultGraphsConfig, mergeGraphsConfig } from "../data/graphsConfig";
import styles from "./VisualGraphs.module.css";

const nodeMap = (nodes) => new Map(nodes.map((node) => [node.id, node]));

// Combina la config editable (solo texto + cantidad) con la geometría de las
// escenas por defecto (se reciclan por índice si hay más escenas que defaults).
function buildScenes(config) {
  const texts = config?.scenes?.length ? config.scenes : defaultGraphsConfig.scenes;
  return texts.map((t, index) => {
    const base = visualGraphScenes[index % visualGraphScenes.length];
    return { ...base, id: `g${index}`, title: t.title, text: t.text };
  });
}

const applyActiveGravity = (scene) => {
  const activeNodes = scene.nodes.filter((node) => scene.activeNodes.includes(node.id));
  if (!activeNodes.length) return scene.nodes;

  return scene.nodes.map((node) => {
    if (scene.activeNodes.includes(node.id)) return node;

    const nearestActive = activeNodes.reduce((nearest, candidate) => {
      const nearestDistance = (node.x - nearest.x) ** 2 + (node.y - nearest.y) ** 2;
      const candidateDistance = (node.x - candidate.x) ** 2 + (node.y - candidate.y) ** 2;
      return candidateDistance < nearestDistance ? candidate : nearest;
    });

    return {
      ...node,
      x: node.x + (nearestActive.x - node.x) * 0.14,
      y: node.y + (nearestActive.y - node.y) * 0.14,
    };
  });
};

/*
 * El texto de la escena, presentado como si fuera código: una función que
 * devuelve un arreglo de cadenas. Es SÓLO estética —no se ejecuta nada— y el
 * contenido sigue siendo el que se edita en el dashboard.
 *
 * Cada frase del texto es un elemento del arreglo; se parte por el final de
 * oración para que los renglones tengan sentido en vez de cortarse a lo bruto.
 *
 * Los corchetes, las comas y las palabras clave llevan aria-hidden: son adorno
 * tipográfico y quien use un lector de pantalla debe oír el texto, no la
 * puntuación.
 */
function BloqueCodigo({ texto }) {
  const frases = String(texto || "")
    .split(/(?<=[.!?])\s+/)
    .map((f) => f.trim())
    .filter(Boolean);

  const lineas = frases.length ? frases : [String(texto || "")];

  return (
    <div className={styles.codigo}>
      <p className={styles.lineaCodigo}>
        <span className={styles.palabraClave} aria-hidden="true">const</span>{" "}
        <span className={styles.funcion} aria-hidden="true">manifiesto</span>
        <span className={styles.puntuacion} aria-hidden="true">{" = () => {"}</span>
      </p>

      <p className={`${styles.lineaCodigo} ${styles.sangria1}`}>
        <span className={styles.palabraClave} aria-hidden="true">return</span>{" "}
        <span className={styles.puntuacion} aria-hidden="true">[</span>
      </p>

      {lineas.map((frase, i) => (
        <p key={frase} className={`${styles.lineaCodigo} ${styles.sangria2}`}>
          <span className={styles.cadena}>
            <span aria-hidden="true">&quot;</span>
            {frase}
            <span aria-hidden="true">&quot;</span>
          </span>
          <span className={styles.puntuacion} aria-hidden="true">
            {i < lineas.length - 1 ? "," : ""}
          </span>
        </p>
      ))}

      <p className={`${styles.lineaCodigo} ${styles.sangria1}`}>
        <span className={styles.puntuacion} aria-hidden="true">];</span>
      </p>

      <p className={styles.lineaCodigo}>
        <span className={styles.puntuacion} aria-hidden="true">{"};"}</span>
      </p>
    </div>
  );
}

function GraphArtwork({ scene, compact = false, reducedMotion = false }) {
  const gravityNodes = compact ? scene.nodes : applyActiveGravity(scene);
  const visibleNodes = compact ? gravityNodes.slice(0, 14) : gravityNodes;
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  const nodesById = nodeMap(gravityNodes);
  const transition = reducedMotion
    ? { duration: 0.08 }
    : { duration: 2.4, ease: [0.22, 1, 0.36, 1] };

  return (
    <svg
      className={styles.graph}
      viewBox="0 0 800 800"
      role="img"
      aria-label={`Visualización de la escena ${scene.title}`}
    >
      <defs>
        <filter id={`graph-glow-${scene.id}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      <g className={styles.edges}>
        {graphEdges.map(([fromId, toId]) => {
          const from = nodesById.get(fromId);
          const to = nodesById.get(toId);
          if (!from || !to || (compact && (!visibleIds.has(fromId) || !visibleIds.has(toId)))) {
            return null;
          }
          const highlighted = (scene.highlightedNodes ?? scene.activeNodes).includes(toId);

          return (
            <motion.line
              key={`${fromId}-${toId}`}
              initial={false}
              animate={{
                x1: from.x,
                y1: from.y,
                x2: to.x,
                y2: to.y,
                opacity: highlighted ? 0.92 : 0.48,
                stroke: highlighted ? "#18a8d8" : "#7b8493",
              }}
              transition={transition}
              strokeWidth={highlighted ? 3 : 1.35}
            />
          );
        })}
      </g>

      <g className={styles.nodes}>
        {visibleNodes.map((node) => {
          const active = scene.activeNodes.includes(node.id);
          return (
            <g key={node.id}>
              {active && (
                <motion.circle
                  initial={false}
                  animate={{ cx: node.x, cy: node.y, r: node.size * 2.3 }}
                  transition={transition}
                  fill={scene.accent}
                  opacity="0.16"
                  filter={`url(#graph-glow-${scene.id})`}
                />
              )}
              <motion.circle
                initial={false}
                animate={{
                  cx: node.x,
                  cy: node.y,
                  r: active ? node.size * 1.18 : node.size,
                  fill: active ? scene.accent : "#3b82f6",
                  opacity: active ? 1 : 0.96,
                }}
                transition={transition}
                className={`${active ? styles.activeNode : styles.node} ${styles.gravityNode}`}
                style={{ "--gravity-delay": `${(Number(node.id.slice(1)) % 8) * -0.47}s` }}
              />
              {active && !compact && (
                <motion.circle
                  initial={false}
                  animate={{ cx: node.x, cy: node.y, r: node.size * 1.42 }}
                  transition={transition}
                  fill="none"
                  stroke={scene.accent}
                  strokeWidth="1"
                  opacity="0.48"
                />
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export default function VisualGraphs() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Escenas renderizadas: se inicializan con los defaults (sin parpadeo) y se
  // reemplazan con la config guardada (texto + cantidad) al montar.
  const [scenes, setScenes] = useState(visualGraphScenes);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    fetch("/api/graphs")
      .then((r) => r.json())
      .then((data) => {
        if (active && data?.config) setScenes(buildScenes(mergeGraphsConfig(data.config)));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const nextIndex = Math.min(
      scenes.length - 1,
      Math.floor(progress * scenes.length + 0.0001),
    );
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  });

  // Clamp por si la cantidad de escenas se redujo tras cargar la config.
  const safeIndex = Math.min(activeIndex, scenes.length - 1);
  const activeScene = scenes[safeIndex];

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="visual-graphs-title">
      <div className={styles.desktopScene}>
        <div className={styles.ambient} aria-hidden="true" />
        <div className={styles.layout}>
          <div className={styles.copyColumn} aria-live="polite">
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={activeScene.id}
                className={styles.copy}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
                transition={{ duration: reducedMotion ? 0.08 : 0.42 }}
              >
                <div className={styles.logoContainer}>
                  <img loading="lazy" decoding="async" src="/SVG/ew_white.svg" alt="EW Logo" className={styles.logo} />
                </div>
                <h2 id="visual-graphs-title">{activeScene.title}</h2>
                <BloqueCodigo texto={activeScene.text} />
                <div className={styles.controls}>
                  <div className={styles.progress} aria-hidden="true">
                    {scenes.map((scene, index) => (
                      <span key={scene.id} className={index === safeIndex ? styles.progressActive : ""} />
                    ))}
                  </div>
                  <button type="button" className={styles.graphButton}>Explorar</button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            className={styles.graphColumn}
            animate={{ "--scene-accent": activeScene.accent }}
          >
            <div className={styles.graphField}>
              <div className={styles.graphSpinner}>
                <GraphArtwork scene={activeScene} reducedMotion={reducedMotion} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  );
}

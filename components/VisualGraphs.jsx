"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { graphEdges, visualGraphScenes } from "../data/visualGraphs";
import styles from "./VisualGraphs.module.css";

const nodeMap = (nodes) => new Map(nodes.map((node) => [node.id, node]));

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
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const nextIndex = Math.min(
      visualGraphScenes.length - 1,
      Math.floor(progress * visualGraphScenes.length + 0.0001),
    );
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  });

  const activeScene = visualGraphScenes[activeIndex];

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
                <p className={styles.eyebrow}>{activeScene.eyebrow}</p>
                <p className={styles.counter}>
                  {String(activeIndex + 1).padStart(2, "0")} / {String(visualGraphScenes.length).padStart(2, "0")}
                </p>
                <h2 id="visual-graphs-title">{activeScene.title}</h2>
                <p className={styles.description}>{activeScene.text}</p>
                <div className={styles.controls}>
                  <div className={styles.progress} aria-hidden="true">
                    {visualGraphScenes.map((scene, index) => (
                      <span key={scene.id} className={index === activeIndex ? styles.progressActive : ""} />
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

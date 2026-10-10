"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

import ModuleShell from "../core/ModuleShell";
import { useDeviceTier, usePortrait } from "../core/env";
import { TextDriver } from "../core/Steps";
import { createProgress, fadeInOut, range } from "../core/progress";
import { scaledCount } from "../bigDataConfig";
import SceneRig from "../three/SceneRig";
import ParticleMorph, { type MorphData } from "../three/ParticleMorph";
import ParticleGraph from "../three/ParticleGraph";
import { LabelLayer, LabelProjector, useLabelRefs, type LabelItem } from "../three/Labels";
import { chaosCloud, fillColors, gauss, gridPoint, perParticle, positions, rng } from "../three/shapes";

/**
 * Módulo 04 (antes 04 + 05): Small Data → Database frente a Big Data.
 * Los pocos datos de Small Data se ordenan hasta formar una tabla (Database)
 * mientras, al lado, Big Data crece hasta ser una nube enorme y compleja.
 */

const progress = createProgress();
const ID = "small-vs-big";
type Vec3 = [number, number, number];

// Small Data / Database: 140 registros = tabla de 14 columnas × 10 filas
const SMALL_COUNT = 140;
const COLS = 14;
const ROWS = 10;

// Small Data: cuatro grupos simples y fáciles de leer
const SMALL_GROUPS: [number, number][] = [[-0.8, 0.65], [0.85, 0.5], [-0.6, -0.7], [0.75, -0.65]];

const smallLayout = (() => {
  const r = rng(41);
  return positions(SMALL_COUNT, (i) => {
    const [gx, gy] = SMALL_GROUPS[i % SMALL_GROUPS.length];
    return [gx + gauss(r) * 0.28, gy + gauss(r) * 0.28, gauss(r) * 0.2];
  });
})();

/** Estado 0: grupos sueltos. Estado 1: tabla ordenada (la fila superior es la cabecera). */
const buildSmall = (): MorphData => {
  // Cada registro ocupa la celda más parecida a su grupo: el de arriba a la izquierda va arriba a la izquierda, etc.
  const order = Array.from({ length: SMALL_COUNT }, (_, i) => i).sort(
    (a, b) => smallLayout[b * 3 + 1] - smallLayout[a * 3 + 1] || smallLayout[a * 3] - smallLayout[b * 3]
  );
  const cell = new Int32Array(SMALL_COUNT);
  order.forEach((idx, k) => {
    cell[idx] = k;
  });
  return {
    states: [smallLayout, positions(SMALL_COUNT, (i) => gridPoint(cell[i], COLS, ROWS, 0.24))],
    colors: fillColors(SMALL_COUNT, (i) => 1 + (i % 4) * 0.6),
    colors2: fillColors(SMALL_COUNT, (i) => (cell[i] < COLS ? 3 : 2)),
    sizes: perParticle(SMALL_COUNT, () => 1.8),
  };
};

/**
 * Big Data: cada partícula nace en uno de los puntos de Small Data (estado 0)
 * y se dispersa hasta formar una nube enorme y compleja (estado 1).
 */
const buildBig = (count: number): MorphData => {
  const r = rng(42);
  return {
    states: [
      positions(count, () => {
        const k = Math.floor(r() * SMALL_COUNT);
        return [smallLayout[k * 3] + gauss(r) * 0.03, smallLayout[k * 3 + 1] + gauss(r) * 0.03, smallLayout[k * 3 + 2]];
      }),
      positions(count, () => chaosCloud(r, 5, 4.2, 3)),
    ],
    colors: fillColors(count, () => r() * 3),
    sizes: perParticle(count, () => 0.5 + Math.pow(r(), 3) * 1.4),
  };
};

interface Layout {
  left: { position: Vec3; scale: Vec3 };
  right: { position: Vec3; scale: Vec3 };
  divider: Float32Array;
  labels: LabelItem[];
}

const makeLabels = (small: Vec3, big: Vec3): LabelItem[] => [
  { text: "Small Data", position: small, className: "bd-label--strong" },
  { text: "Database", position: small, className: "bd-label--strong" },
  { text: "Big Data", position: big, className: "bd-label--strong" },
];

// Escritorio: lado a lado
const WIDE: Layout = {
  left: { position: [-3.1, 0, 0], scale: [1, 1, 1] },
  right: { position: [3.1, 0, 0], scale: [1, 1, 1] },
  divider: new Float32Array([0, 2.6, 0, 0, -2.6, 0]),
  labels: makeLabels([-3.1, 1.95, 0], [3.1, 2.7, 0]),
};

// Móvil: Small Data / Database arriba (pequeño) y Big Data abajo a todo el ancho
const TALL: Layout = {
  left: { position: [0, 1.55, 0], scale: [0.42, 0.42, 0.42] },
  right: { position: [0, -1.05, 0], scale: [0.95, 0.6, 0.6] },
  divider: new Float32Array([-2.4, 0.55, 0, 2.4, 0.55, 0]),
  labels: makeLabels([0, 2.3, 0], [0, 0.3, 0]),
};

// Línea de tiempo del scroll
const toDatabase = () => range(progress.stage, 0.08, 0.4);
const grow = () => range(progress.stage, 0.3, 0.85);

const labelOpacity = (i: number) => {
  const f = fadeInOut(progress.view);
  if (i === 0) return (1 - toDatabase()) * f;
  if (i === 1) return toDatabase() * f;
  return f;
};

/** Texto de Big Data (en escritorio dentro de la comparación; en móvil, debajo de la animación). */
function BigDataText() {
  return (
    <div className="bd-stat">
      {/* Contador en vivo (lo actualiza LiveCounter) */}
      <span className="bd-stat-num bd-count-big" aria-hidden="true">
        {SMALL_COUNT}
      </span>
      <div>
        <h3>Big Data</h3>
        <p>
          Grandes volúmenes, muchas fuentes y formatos, alta velocidad y relaciones complejas. Puede usar varias
          bases de datos, pero no se limita a una sola.
        </p>
      </div>
    </div>
  );
}

/**
 * Contador en vivo: muestra `base()` (lo que marca el scroll) y, además, sigue
 * sumando datos poco a poco mientras el módulo está a la vista. `rate` es el
 * ritmo medio (datos por segundo) y `gate()` (0–1) cuánto de ese ritmo aplica.
 */
function LiveCounter({
  selector,
  base,
  rate,
  gate,
}: {
  selector: string;
  base: () => number;
  rate: number;
  gate: () => number;
}) {
  const live = useRef(0);
  const last = useRef("");
  const els = useRef<HTMLElement[]>([]);

  useFrame((state, delta) => {
    if (!els.current.length) els.current = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const visible = progress.view > 0.02 && progress.view < 0.99;
    if (visible) {
      // Ritmo variable: ráfagas de llegada de datos
      const t = state.clock.elapsedTime;
      const r = rate * (1 + 0.85 * Math.sin(t * 1.7) + 0.55 * Math.sin(t * 4.3));
      live.current += Math.min(delta, 0.1) * Math.max(rate * 0.15, r) * gate();
    }
    const value = Math.round(base() + live.current);
    const text = value.toLocaleString("es-MX");
    if (text === last.current) return;
    last.current = text;
    els.current.forEach((el) => el.replaceChildren(text));
  });
  return null;
}

/**
 * Textos de comparación. Escritorio: las dos columnas sobre la escena.
 * Móvil: solo Small Data / Database en la columna de texto (`withBig={false}`).
 */
function Compare({ className, withBig = true }: { className: string; withBig?: boolean }) {
  return (
    <div className={className}>
      <div className="bd-swap">
        <div className="bd-swap-small">
          <div className="bd-stat">
            <span className="bd-stat-num" aria-hidden="true">
              {SMALL_COUNT}
            </span>
            <div>
              <h3>Small Data</h3>
              <p>Pocos datos, pocas fuentes y relaciones relativamente fáciles de analizar.</p>
            </div>
          </div>
        </div>
        <div className="bd-swap-db" style={{ opacity: 0 }}>
          <div className="bd-stat">
            {/* Registros en vivo (lo actualiza LiveCounter) */}
            <span className="bd-stat-num bd-count-db" aria-hidden="true">
              {SMALL_COUNT}
            </span>
            <div>
              <h3>Database</h3>
              <p>Una base de datos organiza y almacena información siguiendo una estructura.</p>
            </div>
          </div>
        </div>
      </div>
      {withBig && (
        <div>
          <BigDataText />
        </div>
      )}
    </div>
  );
}

export default function BigDataVsSmallDataModule() {
  const tier = useDeviceTier();
  const labels = useLabelRefs();
  const L = usePortrait() ? TALL : WIDE;
  const bigCount = scaledCount(14000, tier);

  return (
    <ModuleShell
      id={ID}
      index="04"
      eyebrow="Small Data · Database · Big Data"
      title="No es solo más datos: es otra escala"
      layout="wide"
      height={230}
      progress={progress}
      // En móvil la comparación va en la columna de texto para no tapar la escena
      aside={<Compare className="bd-compare bd-compare--inline bd-compare--single" withBig={false} />}
      scene={
        <SceneRig fitWidth={11.5} fitHeight={6.4} progress={progress} parallax={0.6} portrait={{ fit: [4.6, 6.2], shiftY: 0.75 }}>
          <ParticleGraph segments={L.divider} progress={progress} drive={(p) => ({ reveal: 1, opacity: 0.18 * fadeInOut(p.view) })} />
          <group position={L.left.position} scale={L.left.scale}>
            <ParticleMorph
              build={buildSmall}
              count={SMALL_COUNT}
              progress={progress}
              size={1.3}
              drive={(p) => ({
                stage: toDatabase(),
                // En la tabla los registros quedan quietos (orden), antes se mueven sueltos
                noise: 0.05 * (1 - toDatabase()) + 0.004,
                drift: 0.25,
                colorMix: toDatabase(),
                fade: fadeInOut(p.view),
              })}
            />
          </group>
          <group position={L.right.position} scale={L.right.scale}>
            <ParticleMorph
              build={buildBig}
              count={bigCount}
              progress={progress}
              drive={(p) => ({
                stage: grow(),
                noise: 0.04 + grow() * 0.06,
                drift: 0.4 + grow() * 0.8,
                swirl: grow() * 0.12,
                fade: fadeInOut(p.view) * (0.15 + 0.85 * range(p.stage, 0.25, 0.35)),
              })}
            />
          </group>
          <LabelProjector items={L.labels} refs={labels} opacity={labelOpacity} />
          {/* Big Data: sube con el scroll hasta el total y sigue sumando rápido */}
          <LiveCounter
            selector={`#${ID} .bd-count-big`}
            base={() => SMALL_COUNT + (bigCount - SMALL_COUNT) * grow()}
            rate={26}
            gate={grow}
          />
          {/* Database: empieza en 140 registros y sigue sumando despacio */}
          <LiveCounter selector={`#${ID} .bd-count-db`} base={() => SMALL_COUNT} rate={2.5} gate={toDatabase} />
          <TextDriver selector={`#${ID} .bd-swap-small`} progress={progress} opacity={() => 1 - toDatabase()} />
          <TextDriver selector={`#${ID} .bd-swap-db`} progress={progress} opacity={toDatabase} />
        </SceneRig>
      }
      overlay={
        <>
          <LabelLayer items={L.labels} refs={labels} />
          <Compare className="bd-compare bd-compare--overlay" />
          {/* Móvil: texto de Big Data centrado debajo de la animación */}
          <div className="bd-under">
            <BigDataText />
          </div>
        </>
      }
    />
  );
}

"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

import type { ModuleProgress } from "./progress";

/**
 * Lista de estados (píldoras) + nota del estado activo. El HTML vive en la
 * columna de texto; `StepDriver` (dentro de la escena) marca el activo cada
 * frame sin renders de React. Los drivers encuentran sus elementos por
 * selector dentro del módulo (`#id-del-módulo …`).
 */

export function StepList({ steps, withNote = true }: { steps: string[]; withNote?: boolean }) {
  return (
    <>
      <ol className="bd-steps">
        {steps.map((s, i) => (
          <li key={s} className={`bd-step${i === 0 ? " is-active" : ""}`}>
            {s}
          </li>
        ))}
      </ol>
      {withNote && <p className="bd-note" aria-live="polite" />}
    </>
  );
}

export function StepDriver({
  scope,
  progress,
  stageOf,
  notes,
}: {
  /** id del módulo. */
  scope: string;
  progress: ModuleProgress;
  /** Estado continuo (0 … n-1) a partir del progreso. */
  stageOf: (p: ModuleProgress) => number;
  /** Nota (texto) por estado (opcional). */
  notes?: string[];
}) {
  const last = useRef(-1);
  const els = useRef<{ pills: HTMLElement[]; note: HTMLElement | null } | null>(null);

  useFrame(() => {
    if (!els.current) {
      const pills = Array.from(document.querySelectorAll<HTMLElement>(`#${scope} .bd-step`));
      if (!pills.length) return;
      els.current = { pills, note: document.querySelector<HTMLElement>(`#${scope} .bd-note`) };
    }
    const active = Math.round(stageOf(progress));
    if (active === last.current) return;
    last.current = active;
    els.current.pills.forEach((el, i) => {
      el.classList.toggle("is-active", i === active);
      el.classList.toggle("is-done", i < active);
    });
    if (notes && els.current.note) els.current.note.replaceChildren(notes[active] ?? "");
  });
  return null;
}

/** Actualiza el texto y la opacidad de los elementos que coinciden con `selector` cada frame. */
export function TextDriver({
  selector,
  progress,
  text,
  opacity,
}: {
  selector: string;
  progress: ModuleProgress;
  text?: (p: ModuleProgress) => string;
  opacity?: (p: ModuleProgress) => number;
}) {
  const lastText = useRef("");
  const els = useRef<HTMLElement[]>([]);

  useFrame(() => {
    if (!els.current.length) els.current = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!els.current.length) return;
    const t = text ? text(progress) : null;
    const changed = t !== null && t !== lastText.current;
    if (changed) lastText.current = t;
    const o = opacity ? opacity(progress).toFixed(3) : null;
    els.current.forEach((el) => {
      if (changed) el.replaceChildren(t);
      if (o !== null) el.style.opacity = o;
    });
  });
  return null;
}

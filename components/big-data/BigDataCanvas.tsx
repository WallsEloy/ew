"use client";

import { useEffect, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { View } from "@react-three/drei";

/**
 * Un solo contexto WebGL para los 11 módulos. Cada módulo dibuja su escena en
 * su propio rectángulo (drei <View>); las vistas fuera de pantalla no se
 * dibujan y el canvas entero se detiene cuando la sección no está visible.
 */

/** Limpia todo el canvas al inicio de cada frame: las vistas solo limpian su
 *  rectángulo y, al hacer scroll, quedarían restos del frame anterior. */
function ClearCanvas() {
  useFrame((state) => {
    state.gl.setScissorTest(false);
    state.gl.setClearColor(0x000000, 0);
    state.gl.clear(true, true);
  }, 0.5);
  return null;
}

export default function BigDataCanvas({ section }: { section: RefObject<HTMLElement | null> }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "100px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [section]);

  return (
    <Canvas
      className="bd-canvas"
      style={{ visibility: active ? "visible" : "hidden" }}
      eventSource={section as RefObject<HTMLElement>}
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
    >
      <ClearCanvas />
      <View.Port />
    </Canvas>
  );
}

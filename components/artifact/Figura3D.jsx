"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Gltf, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei";

// Figura ARTIFACT construida con primitivas mientras no exista el modelo
// final. Si `glb` trae una ruta, se carga ese archivo en su lugar.
function Figura({ variante, animar }) {
  const halo = useRef(null);
  const grupo = useRef(null);
  const mat = { color: variante.cuerpo, metalness: variante.metal, roughness: variante.rugosidad };
  const brilla = variante.acento.toLowerCase() === "#c6ff00";

  useFrame((estado, delta) => {
    if (!animar) return;
    if (halo.current) {
      halo.current.rotation.z += delta * 0.6;
      halo.current.position.y = 3.02 + Math.sin(estado.clock.elapsedTime * 1.4) * 0.05;
    }
    if (grupo.current) grupo.current.position.y = Math.sin(estado.clock.elapsedTime * 0.9) * 0.04;
  });

  return (
    <group ref={grupo}>
      {/* Base numerada */}
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.0, 0.18, 64]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.185, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.97, 0.012, 8, 96]} />
        <meshStandardMaterial color={variante.acento} emissive={brilla ? variante.acento : "#000"} emissiveIntensity={0.5} />
      </mesh>
      {/* Piernas */}
      {[-0.22, 0.22].map((x) => (
        <mesh key={x} position={[x, 0.42, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.24, 8, 24]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      ))}
      {/* Cuerpo */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <capsuleGeometry args={[0.38, 0.34, 12, 32]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Brazos */}
      {[-1, 1].map((lado) => (
        <mesh key={lado} position={[lado * 0.52, 0.9, 0.02]} rotation={[0, 0, lado * 0.42]} castShadow>
          <capsuleGeometry args={[0.1, 0.36, 8, 20]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      ))}
      {/* Cabeza */}
      <RoundedBox args={[1.55, 1.3, 1.22]} radius={0.34} smoothness={6} position={[0, 1.95, 0]} castShadow>
        <meshStandardMaterial {...mat} />
      </RoundedBox>
      {/* Visor */}
      <RoundedBox args={[1.22, 0.3, 0.12]} radius={0.06} smoothness={4} position={[0, 2.02, 0.6]}>
        <meshStandardMaterial color={variante.acento} emissive={brilla ? variante.acento : "#000"} emissiveIntensity={brilla ? 0.9 : 0} roughness={0.25} metalness={0.1} />
      </RoundedBox>
      {/* Glitch: píxeles que se desprenden de la cabeza */}
      {[[0.84, 2.25, 0.25, 0.12], [0.98, 2.1, 0.05, 0.08], [0.9, 1.78, -0.2, 0.1], [1.06, 1.92, 0.3, 0.06]].map(([x, y, z, s]) => (
        <mesh key={`${x}${y}`} position={[x, y, z]} castShadow>
          <boxGeometry args={[s, s, s]} />
          <meshStandardMaterial color={variante.acento} emissive={brilla ? variante.acento : "#000"} emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* Antenas */}
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, 2.72, 0]} rotation={[0, 0, -x * 0.5]} castShadow>
          <coneGeometry args={[0.13, 0.36, 24]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      ))}
      {/* Halo removible */}
      <mesh ref={halo} position={[0, 3.02, 0]} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[0.55, 0.035, 16, 96]} />
        <meshStandardMaterial color={variante.acento} emissive={brilla ? variante.acento : "#000"} emissiveIntensity={0.8} metalness={0.3} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Luces de estudio. El entorno se arma con paneles de luz locales
// (Lightformer): da reflejos al vinil y al metal sin descargar mapas HDR.
function Luces({ acento }) {
  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 4]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={2} position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={1.4} color={acento} position={[6, 1, -2]} rotation-y={-Math.PI / 2} scale={[4, 4, 1]} />
        <Lightformer form="ring" intensity={2.5} position={[0, 3, -6]} scale={3} />
      </Environment>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#f4f1ea", "#1a1a1a", 0.6]} />
      <directionalLight position={[3, 6, 5]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 3, -4]} intensity={1.2} color={acento} />
      <directionalLight position={[4, 4, -6]} intensity={2.4} color="#ffffff" />
      <pointLight position={[0, 2, 3]} intensity={6} distance={6} color="#ffffff" />
    </>
  );
}

// Visor 3D. modo: "hero" (gira solo y sigue el puntero), "explorar" (360°
// con arrastre y zoom) o "captura" (fijo, para generar imágenes).
export default function Figura3D({ variante, modo = "hero", glb = null, vista = [0, 0], zoom = 1, fondo = null, objetivo = [0, 0.1, 0] }) {
  const caja = useRef(null);
  const [visible, setVisible] = useState(true);
  const [reducido, setReducido] = useState(false);

  useEffect(() => {
    setReducido(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (!caja.current || !("IntersectionObserver" in window)) return undefined;
    // Fuera de pantalla no se dibuja: ahorra batería y GPU
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    obs.observe(caja.current);
    return () => obs.disconnect();
  }, []);

  const captura = modo === "captura";
  const animar = !captura && !reducido;
  const distancia = (modo === "explorar" ? 9.4 : 7.8) / zoom;
  const [az, el] = vista;
  const camara = [objetivo[0] + Math.sin(az) * Math.cos(el) * distancia, objetivo[1] + Math.sin(el) * distancia, objetivo[2] + Math.cos(az) * Math.cos(el) * distancia];

  return (
    <div ref={caja} style={{ width: "100%", height: "100%" }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: camara, fov: 32 }}
        gl={{ antialias: true, preserveDrawingBuffer: captura, alpha: !fondo }}
        aria-hidden="true"
      >
        {fondo && <color attach="background" args={[fondo]} />}
        <Luces acento={variante.acento} />
        <Suspense fallback={null}>
          <group position={[0, -1.5, 0]}>
            {glb ? <Gltf src={glb} castShadow receiveShadow /> : <Figura variante={variante} animar={animar} />}
            <ContactShadows position={[0, 0.001, 0]} opacity={0.55} scale={40} blur={2.2} far={3} resolution={1024} />
          </group>
        </Suspense>
        {!captura && (
          <OrbitControls
            target={objetivo}
            enablePan={false}
            enableZoom={modo === "explorar"}
            minDistance={4.5}
            maxDistance={10}
            minPolarAngle={Math.PI * 0.2}
            maxPolarAngle={Math.PI * 0.55}
            autoRotate={animar}
            autoRotateSpeed={modo === "hero" ? 1.2 : 0.8}
            enableDamping
          />
        )}
        {captura && <CamaraFija objetivo={objetivo} />}
      </Canvas>
    </div>
  );
}

function CamaraFija({ objetivo }) {
  useFrame(({ camera }) => camera.lookAt(...objetivo));
  return null;
}

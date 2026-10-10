# Big Data con partículas

Sección educativa de la home (después de la animación del círculo, antes de
"Descubre Más"). Explica Big Data en 11 módulos. Cada partícula es un Data
Point, y cada módulo tiene su propia escena 3D controlada por el scroll.

- **Dónde se usa:** [`src/app/page.js`](../../app/page.js) → `<BigDataExperience />`.
- **Qué ajustar casi siempre:** [`bigDataConfig.ts`](./bigDataConfig.ts).
- **Tema:** fondo blanco (`THEME = "light"`, actual) u oscuro (`"dark"`). Se cambia en una sola línea de `bigDataConfig.ts`. En blanco las partículas usan mezcla normal, tonos oscuros, `alphaBoost` y sin halo de planeta; en oscuro, mezcla aditiva. El CSS cambia con la clase `bd-section--light` / `--dark`.
- **Stack:** React Three Fiber + drei, Three.js (`THREE.Points` + `ShaderMaterial`), GSAP ScrollTrigger.

## Arquitectura (por qué así)

**Un solo canvas para todos los módulos** ([`BigDataCanvas.tsx`](./BigDataCanvas.tsx)).
- **Por qué no un canvas por módulo:** cada uno abre un contexto WebGL. Los navegadores permiten unos 8–16, menos en móvil, y además está el del hero. Crearlos y destruirlos al hacer scroll también provoca tirones.
- **Cómo funciona:** el canvas es fijo y transparente. Cada módulo dibuja su escena con `<View>` de drei, recortada a su propio `div`. Las vistas fuera de pantalla no se dibujan.
- **Pausa:** el canvas entero se detiene (`frameloop: "never"`) cuando la sección no está visible.
- **Limpieza:** `ClearCanvas` limpia el canvas completo al inicio de cada frame. Las vistas solo limpian su rectángulo, y sin esto quedarían restos al hacer scroll.

**Cada módulo es independiente** ([`core/ModuleShell.tsx`](./core/ModuleShell.tsx)).
- **Estructura:** una sección alta (`height` en vh) con un contenedor `sticky` de 100vh: texto + escena.
- **Progreso:** GSAP ScrollTrigger lo escribe en un objeto mutable (`ModuleProgress`) y las escenas lo leen en `useFrame`, sin renders de React.
  - `stage`: 0→1 mientras la escena está fija; controla los estados.
  - `view`: 0→1 desde que el módulo entra hasta que sale; controla el fundido de entrada y salida.
- **Suavizado:** `gsap.quickTo`, para que las transiciones no sean bruscas.

**Partículas sin miles de componentes.**
- [`three/ParticleMorph.tsx`](./three/ParticleMorph.tsx): un `THREE.Points` que se transforma entre hasta 8 formas (`states`). Tamaño, semilla, orden y tipo (normal / sospechoso / descartado) van empaquetados en un solo atributo `aMeta` (vec4): la tarjeta gráfica admite pocos atributos y con atributos sueltos el shader fallaba ("Too many attributes"). La interpolación con retraso por partícula, el giro, la deriva, la aparición progresiva (`reveal`), los colores y los datos "marcados" (`flags`: tiemblan, parpadean, cambian de color, se desvanecen) ocurren en el vertex shader. Lo usan la mayoría de los módulos.
- [`three/ParticleStream.tsx`](./three/ParticleStream.tsx): flujos desde varias fuentes a un destino (módulos 02 y 05).
- [`three/ParticleInflow.tsx`](./three/ParticleInflow.tsx): flujo continuo hacia el centro (módulo 01). La duración de cada viaje, el radio y el radio donde desaparecen se ajustan por props.
- `ParticleMorph` con `solid`: círculos de borde nítido sin resplandor (el punto central del 01).
- [`three/ParticleGraph.tsx`](./three/ParticleGraph.tsx): aristas/líneas que aparecen progresivamente (01, 04, 05, 09).
- [`three/shapes.ts`](./three/shapes.ts): generadores de formas (nube, rejilla, barras, tendencia…) con PRNG con semilla.
- [`three/SceneRig.tsx`](./three/SceneRig.tsx): cámara que encuadra `fitWidth × fitHeight` en cualquier proporción, más parallax de mouse o vaivén automático en táctil.
- [`three/Labels.tsx`](./three/Labels.tsx): etiquetas HTML que siguen puntos 3D.
- [`core/Steps.tsx`](./core/Steps.tsx): píldoras de estado y textos que cambian con el scroll.
- **Órbitas:** el módulo 03 reutiliza `ParticleRings` y `SaturnCore` del hero (`src/components/saturn`).

**Shaders:** están en [`shaders/particles.ts`](./shaders/particles.ts) como strings de TypeScript. Next no carga archivos `.glsl` sin configurar un loader.

## Móvil: composiciones en vertical

En pantallas verticales (`max-aspect-ratio: 1/1`, `usePortrait()` en `core/env.ts`) cada escena se adapta. En escritorio no cambia nada. Hay dos formas de hacerlo:

**Con la prop `portrait` de `SceneRig`:**
- `rotate`: gira la escena 90° (01, 04, 05, 07). Las etiquetas son HTML y siguen derechas.
- `scale: [x, y]`: estira la escena a lo alto (10).
- `fit: [ancho, alto]`: encuadre propio.
- `shiftY`: desplaza la escena hacia arriba o abajo.

**Con layouts propios elegidos con `usePortrait()`:**
- **02:** fuentes en dos columnas arriba que bajan hasta DATA.
- **06:** formatos en 2 × 3.
- **08:** clusters en columna, con las etiquetas a la derecha.
- **09:** hubs con x e y intercambiados.

**Sin cambios:** 03 (planeta) y 11 (logo) ya funcionan en vertical.

En el módulo 05, la comparación se muestra en la columna de texto (`.bd-compare--inline`) en lugar de sobre la escena.

## Efecto táctil (móvil)

Mientras el dedo toca la pantalla, también al hacer scroll, las partículas se desplazan rápido hacia él. Al soltar, vuelven a su sitio.

- **Dónde está:** [`src/lib/touchAttract.ts`](../../lib/touchAttract.ts). Es compartido por el hero y la sección Big Data.
- **Cómo funciona:** el desplazamiento se hace en pantalla, en el vertex shader (`touchAttract(clip, jitter)`). Cada escena llama a `updateTouch` en su `useFrame` con el rectángulo de su vista. En el hero es el canvas; en Big Data, la vista del módulo (`core/viewRegistry.ts`).
- **Ajustes:** en `TOUCH_CONFIG`. `base` es la atracción que reciben todas, `near` la extra de las cercanas al dedo, y `speedIn`/`speedOut` la rapidez con que acuden y vuelven.
- **Cuándo no actúa:** con `prefers-reduced-motion` no se activa, y en escritorio no hay eventos táctiles.

## Módulos

| # | Archivo | Qué muestra | Alto |
|---|---|---|---|
| 01 | `DataPointModule` | Círculo violeta sólido; los puntos viajan lentamente hacia él y desaparecen al llegar (`ParticleInflow`); aparecen etiquetas (compra, clic…) conectadas | 170vh |
| 02 | `DataStreamsModule` | 6 fuentes → flujos → núcleo DATA que crece | 180vh |
| 03 | `BigDataModule` | Planeta + anillos de partículas (fuentes); se inclina con el scroll | 200vh |
| 04 | `BigDataVsSmallDataModule` | Small Data (140 puntos en 4 grupos) que se ordena en una tabla (Database) frente a Big Data, que crece hasta 14,000 con contador. En móvil, Small Data/Database arriba y Big Data abajo a todo el ancho. Antes eran los módulos 04 y 05 | 230vh |
| 05 | `FiveVsModule` | Las 5 V + procesamiento (antes 05 y 06): Volume·Raw data (nube + contador) → Velocity·Filter (giro; partículas rojas descartadas, `drops`) → Variety·Normalize (rejilla y luego 6 formatos) → Veracity·Analyze (dudosos aparte y luego ondas) → Value·Information (barras). 7 formas, línea de tiempo en `SHAPE_KEYS` | 440vh |
| 06 | `ClusteringModule` | Nube mezclada → `clusterCount` grupos con color y etiqueta | 230vh |
| 07 | `RelationshipsModule` | Grafo 3D: vecinos cercanos + hubs etiquetados; crece del centro hacia fuera | 210vh |
| 08 | `InsightsModule` | Caos → patrones → tendencia (+38 %) → flecha de decisión | 280vh |
| 09 | `FinalTransformationModule` | Dispersión → vórtice → esfera → hélice → isotipo de Singularix (muestreado de `public/logo.svg`) | 320vh |

En el código se mantuvo el nombre `BigDataVsSmallDataModule` para el módulo 04 combinado; `BigDataVsDatabaseModule` y `ProcessingModule` se eliminaron (fusionados en 04 y 05).

Cada módulo crea su `progress` a nivel de archivo (singleton). Si un módulo se
usara dos veces en la misma página, ambos compartirían progreso.

## Configuración (`bigDataConfig.ts`)

| Variable | Qué controla |
|---|---|
| `particleCount` | Densidad global: 16000 = normal, 8000 = mitad en todos los módulos |
| `tierMultiplier` | Partículas por dispositivo (desktop 1, tablet 0.7, mobile 0.4) |
| `mobileParticleMultiplier` | Ajuste extra solo para móvil |
| `particleSize` | Tamaño base (ahora 1.6) |
| `THEME` / `themes` | Tema activo y colores de cada tema: fondo, paleta, error, líneas, planeta, halo, `alphaBoost` y mezcla |
| `animationSpeed` | Velocidad de las animaciones ambientales |
| `mouseInfluence` | Grados de inclinación por el mouse |
| `orbitCount`, `orbitSpeed`, `orbitParticles` | Anillos del módulo 03 |
| `clusterCount` | Grupos del módulo 08 (2–6) |

## Rendimiento y accesibilidad

- **Vistas:** las que están fuera de pantalla no se dibujan, y el canvas se detiene fuera de la sección.
- **Resolución:** DPR máximo de 1.5, sin antialias. Una partícula = un vértice, sin texturas.
- **Cantidades:** las partículas se reducen por dispositivo con `scaledCount()`.
- **Movimiento reducido:** con `prefers-reduced-motion`, la deriva, el giro, los temblores y el parallax se reducen o se apagan. Los estados siguen cambiando con el scroll, que lo controla el usuario, y el texto siempre es legible.

## Trampas conocidas

- **Uniforms:** se actualizan siempre vía `materialRef.current.uniforms`, nunca desde el objeto del `useMemo`. Con StrictMode, en `npm run dev`, el material puede quedarse con otra copia (ver el README del hero).
- **Lint `react-hooks/immutability`:** no permite escribir en objetos que llegan como props. Por eso los drivers de texto buscan sus elementos por selector (`#id-del-modulo .bd-step`), y `prefers-reduced-motion` vive en `core/env.ts` (`motion.reduced`).
- **Lint `react-hooks/purity`:** no permite `Math.random()` durante el render. Usar `rng(seed)` de `shapes.ts`.
- **Comentarios en JSX:** no se puede poner un comentario JSX suelto dentro de una prop como `scene={...}`.

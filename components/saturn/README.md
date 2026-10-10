# Hero Saturno (galaxia de partículas)

Hero animado de la página de inicio: un planeta y sus anillos hechos de
partículas que orbitan en tiempo real con WebGL (React Three Fiber + Three.js).
No usa imágenes ni videos. Todo se genera en código.

- **Dónde se usa:** [`src/app/page.js`](../../app/page.js) → `<HeroSaturn />`.
  Reemplazó a `src/components/Hero.jsx` (logo Lottie + "creamos libertad"),
  que sigue en el repo pero ya no se usa.
- **Qué ajustar casi siempre:** solo [`config.ts`](./config.ts). Casi todos
  los cambios visuales pedidos hasta ahora se resolvieron cambiando valores ahí.

## Archivos

| Archivo | Qué hace |
|---|---|
| `HeroSaturn.tsx` / `.css` | La sección (100svh). Canvas absoluto detrás y, encima, logo Lottie (`public/Logoanimado.json`), eyebrow, título, subtítulo y 2 CTAs. El texto tiene `pointer-events: none` salvo los botones. Textos y enlaces se cambian por props. |
| `SaturnCanvas.tsx` | `<Canvas>` (se importa con `ssr: false`). Detecta dispositivo (`mobile` <768px, `tablet` <1200px, `desktop`), `prefers-reduced-motion` y táctil. Pausa el render si el hero sale de pantalla. Mide la zona de texto para `avoidText`. |
| `SaturnScene.tsx` | Luces, estrellas (solo tema oscuro), `CameraRig` (encuadre), `ParallaxRig` (inclinación y mouse), bloom (solo tema oscuro). Calcula tamaño, opacidad y blending según tema y dispositivo. |
| `SaturnCore.tsx` | El planeta: superficie de partículas (espiral de Fibonacci con franjas de latitud), núcleo invisible que tapa lo de atrás y halo/atmósfera opcional. |
| `ParticleRings.tsx` | Los anillos: un solo `THREE.Points`. Las órbitas se calculan en el vertex shader. |
| `avoid.ts` | GLSL + uniforms para que las partículas esquiven el texto. **Desactivado** (`avoidText.enabled: false`). |
| `config.ts` | Todas las variables. |
| `index.ts` | Exporta `HeroSaturn`, `SATURN_CONFIG` y tipos. |

## Cómo funciona

**Anillos (`ParticleRings`).**
- Cada partícula tiene `aRadius`, `aAngle`, `aSpeed`, `aSize`, `aHeight`, `aBrightness`, `aColor` (0–3, índice en la paleta) y `aOffset`.
- El shader calcula `angle = aAngle + uTime * aSpeed` y la posición (`cos`, `sin`) con pequeñas perturbaciones, para que no sean círculos perfectos.
- La velocidad es kepleriana (`r^-1.5`): lo de adentro va más rápido.
- Las bandas siguen zonas inspiradas en Saturno (C, B, división de Cassini, A, Encke, F) y se generan con un PRNG con semilla, así el patrón es siempre igual.
- `bandGap` controla el hueco entre bandas.

**Planeta (`SaturnCore`).**
- Es una capa de puntos sobre la esfera, que gira con un `group` (`planetSpin`).
- Una esfera invisible (`colorWrite={false}`, radio ×0.985) escribe profundidad. Tapa la cara trasera del planeta y los anillos que pasan por detrás. Sin ella se verían a través.
- El contorno se aclara a propósito, porque ahí las partículas se apilan por la proyección.

**Partículas (ambos shaders).**
- Son círculos sólidos: el disco tiene borde nítido con ~1px de antialias (`fwidth`).
- La escala del tamaño es `10.0 / -mv.z`, calibrada para que el tamaño `3` se vea como se aprobó.
- Hay un tope de tamaño proporcional a `uSize`. Al cambiar `particleSize` no hace falta tocar el tope.

**Encuadre (`CameraRig`).**
- Horizontal: los anillos caben a lo ancho y el planeta se desplaza a la derecha para dejar sitio al texto, que va a la izquierda.
- Vertical (ancho < alto, o sea móvil y tablet en vertical): todo centrado. La cámara se acerca hasta que la esfera mide `portraitSphereWidth` × ancho de pantalla, y los lados se recortan.
- El CSS usa la misma condición: `@media (max-aspect-ratio: 1/1)`.

**Temas.**
- `light` (actual): fondo blanco, `NormalBlending`, sin estrellas ni bloom.
- `dark`: fondo negro, `AdditiveBlending`, estrellas y bloom.
- Sobre blanco el additive no se ve, por eso cambia el blending.

## Configuración actual (`config.ts`)

| Variable | Valor | Notas |
|---|---|---|
| `theme` | `"light"` | `"dark"` para fondo negro |
| `particles` | 8000 / 5000 / 2800 | anillos (desktop / tablet / mobile). Menos = más separadas |
| `planetParticles` | 6000 / 4000 / 2200 | esfera. Se bajó para que no se encimen |
| `particleSize` | `3` | escritorio y tablet |
| `particleSizeMobile` | `3` | móvil |
| `solidParticles` | `true` | 100% opacas. `false` = transparencia variable |
| `bandGap` | `0.45` | hueco entre bandas (0–0.9) |
| `speed` | `3.5` | vuelta interior ~16 s, exterior ~45 s |
| `reducedMotionSpeed` | `0.35` | velocidad con "reducir movimiento" (0 = quieto) |
| `planetSpin` | `0.08` | rad/s |
| `portraitSphereWidth` | `1.15` | tamaño de la esfera en vertical |
| `tilt` | x 24°, z −12° | inclinación |
| `colors.light.particles` | violeta y azul cielo | `#7b3fe4`, `#3fb8ff`, `#5a2fc2`, `#1fa2ff` |
| `colors.light.rim` | `#7b3fe4` | color del contorno del planeta |
| `glowIntensity` | `0` | halo del planeta apagado (antes se veía como "sombra" a la izquierda) |
| `avoidText.enabled` | `false` | esquivar el texto: se probó y se descartó |
| `mouse` | strength 6°, damping 0.04 | parallax; en táctil hay vaivén automático |

## Decisiones y trampas conocidas

- **No actualizar uniforms desde el objeto de `useMemo`.** En desarrollo, StrictMode puede dejar al material con otra copia de ese objeto, y entonces las partículas no se mueven (solo en `npm run dev`; en producción sí). Siempre se actualizan vía `materialRef.current.uniforms`. Los `useMemo` de uniforms solo dan los valores iniciales.
- **`react-hooks/immutability`.** No mutar `camera` obtenida con `useThree`. Usar `state.camera` dentro de `useFrame`.
- **`react-hooks/set-state-in-effect`.** Evitar `setState` síncrono dentro de un `useEffect`. Hacerlo en callbacks (`ResizeObserver`, `requestAnimationFrame`).
- **Reducir movimiento.** Si Windows tiene "Efectos de animación" apagado, el navegador reporta `prefers-reduced-motion`. Por petición del cliente la escena sigue girando, más despacio (`reducedMotionSpeed`), y el parallax del mouse se desactiva.
- **Texto sobre partículas en móvil.** La legibilidad depende del `text-shadow` blanco y de un resplandor radial (`.hero-saturn__content::before`) en `HeroSaturn.css`.
- **TypeScript.** El proyecto es JS. Se añadieron `tsconfig.json` (con `allowJs`) y `src/types/css.d.ts` para importar `.css` desde `.tsx`.

## Efecto táctil (móvil)

Mientras el dedo toca la pantalla, también al hacer scroll, las partículas se desplazan rápido hacia él. Al soltar, vuelven a su sitio.

- **Dónde está:** [`src/lib/touchAttract.ts`](../../lib/touchAttract.ts) (prop `touchRect` de `ParticleRings` y `SaturnCore`). Es compartido por el hero y la sección Big Data.
- **Cómo funciona:** el desplazamiento se hace en pantalla, en el vertex shader (`touchAttract(clip, jitter)`). Cada escena llama a `updateTouch` en su `useFrame` con el rectángulo de su vista. En el hero es el canvas; en Big Data, la vista del módulo (`core/viewRegistry.ts`).
- **Ajustes:** en `TOUCH_CONFIG`. `base` es la atracción que reciben todas, `near` la extra de las cercanas al dedo, y `speedIn`/`speedOut` la rapidez con que acuden y vuelven.
- **Cuándo no actúa:** con `prefers-reduced-motion` no se activa, y en escritorio no hay eventos táctiles.

## Historial de cambios pedidos (resumen)

1. Hero inicial en fondo negro con planeta sólido, anillos de partículas y bloom.
2. Se recuperó el logo Lottie arriba del texto y se pasó a fondo blanco (tema `light`).
3. Órbitas más rápidas. Se corrigió que en dev no giraban (bug de uniforms con StrictMode).
4. El planeta pasó a ser de partículas. Se quitó el halo. Paleta violeta + azul cielo.
5. Partículas más grandes (1.4 → 2 → 2.4 → 3), círculos sólidos sin difuminado y 100% opacas.
6. Menos partículas y más separación, tanto en anillos como en la esfera.
7. Móvil: todo centrado dentro de una esfera grande que se recorta por los lados.
8. Se probó que las partículas esquivaran el texto (círculo / rectángulo redondeado) y se descartó.
9. Tipografías de marca: el título usa Dancing Script 700 (`var(--font-script)`; se comparó con Oleo Script, Lobster Two, Playwrite ES, Corinthia y Caveat, y el cliente eligió Dancing Script). Poppins (`var(--font-sans)`) ya está cargada para el texto general. Ambas se cargan en `src/app/layout.js` con `next/font/google`. El título es `"Creamos
libertad"` (salto con `
` + `white-space: pre-line`) en todas las pantallas, en 700 (el grosor máximo) y con el degradado del logotipo (`#482278` → `#1068b0`) vía `background-clip: text`. El resplandor usa `filter: drop-shadow` porque `text-shadow` taparía el degradado. El padding con margen negativo evita que se recorten los bucles de la letra.

## Cómo verificar cambios

```bash
npx tsc --noEmit -p .      # tipos
npx eslint src/components/saturn
```

- Revisar visualmente en escritorio (1440×900) y en móvil (390×844 y 360×640).
- Comprobar en `npm run dev` y no solo en build, por el problema de StrictMode.
- `next build` falla mientras `src/app/branding/proyecto1/page.js` siga vacío (0 bytes). No es por este componente.
- El aviso `THREE.Clock: This module has been deprecated` en consola viene de R3F y es inofensivo.

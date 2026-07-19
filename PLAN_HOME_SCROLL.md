# Continuidad: Home con carrusel animado por scroll

## Objetivo

En escritorio, el Home debe comenzar con el carrusel existente. Al hacer scroll, la imagen activa queda seleccionada, crece y se desplaza hacia el lado izquierdo mientras su título, descripción y botón aparecen a la derecha. La animación debe seguir el progreso del scroll y revertirse al subir.

En móvil debe conservarse el carrusel original, sin la transformación editorial por scroll.

## Comportamiento acordado

- El scroll expande el slide que esté activo en ese momento.
- El autoplay se pausa al comenzar la transformación.
- El autoplay no cambia el slide durante la transformación; el usuario sí puede cambiarlo mediante los puntos.
- Los puntos permanecen activos y permiten cambiar voluntariamente de slide durante la transformación.
- La navegación por teclado se desactiva temporalmente durante la transformación.
- Al volver completamente al inicio, se restauran el carrusel, el autoplay y sus controles.
- El contenido derecho reutiliza `rightTitle`, `rightText`, `rightColor` y `buttonText` de cada slide.
- La transición está ligada al scroll y se revierte al subir.
- El primer tramo de scroll completa la transformación editorial; sólo en el segundo tramo el scroll recorre los slides y sus textos.
- El efecto se activa desde 769 px únicamente en orientación horizontal.
- `prefers-reduced-motion` utiliza una transición mucho más corta.

## Implementación actual

Archivos principales:

- `components/HomeCarousel.jsx`
- `components/HomeCarousel.module.css`
- `app/page.jsx`

La implementación utiliza:

- Una sección de `600dvh` en escritorio: `100dvh` para la transformación y cuatro tramos adicionales para recorrer los cinco slides.
- Un escenario interno con `position: sticky` y altura de `100dvh`.
- `useScroll`, `useTransform` y `useMotionValueEvent` de Framer Motion.
- Estado binario `isScrollMode` para pausar el carrusel sin renderizar React en cada píxel de scroll.
- Recorte horizontal en el `main` mediante `overflow-x-clip`, evitando bloquear el comportamiento sticky vertical.

## Corrección importante de las imágenes

Los PNG del carrusel miden `1395 × 6690` y pesan entre 3 y 11 MB. Son composiciones extremadamente verticales.

Se intentó usar `next/image`, pero el optimizador tardaba más de 50 segundos y la geometría `fill` dentro de una caja de `60vw` alteraba el tamaño visual de las obras.

Estado correcto actual:

- Se usan imágenes directas con `<img>`.
- La imagen activa conserva la geometría original: `height: 100dvh`, `width: auto` y `max-width: none`.
- Framer Motion anima el contenedor exterior, no cambia la geometría interna de la imagen.
- La primera imagen usa carga prioritaria y las demás carga diferida.
- No deben reaparecer solicitudes a `/_next/image` mientras se mantengan estos PNG sin optimizar.

## Estado de verificación

- La ruta `/` responde con HTTP 200.
- Las cinco imágenes responden con HTTP 200.
- No existen errores en el servidor de desarrollo.
- El componente del Home compila correctamente.
- El build completo del proyecto sigue bloqueado por un problema anterior y no relacionado: `app/contacto/page.jsx` está vacío y Next.js no lo reconoce como módulo.

## Verificación visual pendiente

Se agregó a VS Code el MCP de Playwright con:

```text
code --add-mcp "{\"name\":\"playwright\",\"command\":\"npx\",\"args\":[\"@playwright/mcp@latest\"]}"
```

VS Code confirmó: `Added MCP servers: playwright`.

Después de reiniciar o ejecutar `Developer: Reload Window`, iniciar una nueva sesión y pedir:

> Lee `PLAN_HOME_SCROLL.md`, abre el Home con Playwright y verifica el carrusel antes y después del scroll.

La verificación debe cubrir:

1. Captura inicial en 1280 × 800.
2. Captura aproximadamente a la mitad del recorrido.
3. Captura al final del scroll.
4. Comprobar que la imagen se mantiene proporcionada y se sitúa a la izquierda.
5. Comprobar que el texto entra a la derecha sin superponerse con la imagen.
6. Confirmar que no existe scroll horizontal.
7. Revisar consola y errores de red.
8. Repetir en 1024 y 1440 px de ancho.
9. Verificar que en móvil el carrusel conserve el comportamiento anterior.

## Criterio para continuar

No realizar más ajustes visuales a ciegas. Primero obtener capturas con Playwright y medir posiciones reales. Corregir únicamente los problemas visibles y volver a capturar los tres estados del scroll.

## Verificación visual completada

Playwright verificó el Home en Chromium a 1024, 1280 y 1440 px de ancho, con estados inicial, intermedio y final del scroll. También se verificó el carrusel móvil a 390 × 844.

- Se corrigió la superposición del contenido inicial con el editorial adelantando el fin de su desvanecimiento.
- Se bajó el título inicial para evitar que quedara oculto por la navegación fija.
- La imagen conserva su proporción original en todos los estados medidos.
- El texto editorial queda separado de la imagen: el espacio mínimo medido durante la transformación fue de 165 px a 1024 px de ancho.
- No existe scroll horizontal en los anchos verificados.
- Durante la transformación, el autoplay se pausa y el teclado se deshabilita; los puntos permanecen activos para cambiar voluntariamente de slide.
- Al volver al inicio, los controles se habilitan y el autoplay vuelve a avanzar.
- En móvil no se activa la transformación editorial; puntos y teclado conservan su comportamiento.
- En el estado editorial, los puntos aparecen al lado del botón y actualizan conjuntamente imagen, título, descripción y botón.
- El slide permanece fijo durante el primer 20% del recorrido, mientras se completa la transformación editorial.
- En el tramo restante, el scroll recorre los cinco slides en orden y los revierte en el mismo orden al subir.
- `prefers-reduced-motion` completa la transición en el recorrido corto configurado y revierte correctamente.
- No hubo errores de consola ni fallos de red, y no se generaron solicitudes a `/_next/image`.

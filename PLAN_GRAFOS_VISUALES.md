# Plan: módulo «Grafos visuales» controlado por scroll

## Concepto

Después de que termine el recorrido del carrusel del Home, comenzará un segundo módulo llamado **Grafos visuales**.

En escritorio, el módulo ocupará toda la ventana y permanecerá fijo mientras avanza el scroll:

- A la izquierda aparecerán el nombre, título y texto de la escena activa.
- A la derecha aparecerá una red visual inspirada en el Graph View de Obsidian.
- Los nodos serán círculos conectados mediante líneas.
- El nodo o grupo activo será morado y tendrá un resplandor suave.
- Los nodos secundarios serán grises y tendrán menor opacidad.
- Al avanzar el scroll, los nodos cambiarán de posición, las conexiones se redibujarán y se seleccionará otro grupo.
- El texto izquierdo cambiará al mismo tiempo que la escena del grafo.
- Al subir, todas las escenas se recorrerán en orden inverso.

El módulo será únicamente visual: no representará información real ni necesitará base de datos en la primera versión.

## Decisión técnica

Se recomienda construirlo con **SVG + Framer Motion**, no con video.

Ventajas:

- Mucho menos peso que un video de alta resolución.
- Gráficos nítidos en cualquier tamaño de pantalla.
- Animación reversible y ligada exactamente al scroll.
- Los colores, textos, nodos y conexiones pueden modificarse desde código.
- No necesita reproducir, descargar ni decodificar video.
- Puede respetar `prefers-reduced-motion`.

No se usará una simulación física ejecutándose continuamente. Cada escena tendrá coordenadas predeterminadas y sólo se interpolarán durante la transición. Esto evita movimiento inestable y consumo innecesario de CPU.

## Estructura visual

### Fondo

- Negro casi puro: `#050505`.
- Resplandor radial morado muy tenue detrás del grafo.
- Ligera textura o gradiente, sin imágenes pesadas.

### Columna izquierda

- Ancho aproximado: `34–40vw`.
- Eyebrow: `GRAFOS VISUALES`.
- Título grande de la escena.
- Texto de entre 2 y 4 líneas.
- Indicador opcional: `01 / 05`.
- El texto entrará con opacidad y un desplazamiento vertical corto.

### Grafo derecho

- Ancho aproximado: `50–56vw`.
- Entre 18 y 30 nodos para mantener buen rendimiento.
- Líneas grises con opacidad baja.
- Nodo activo morado: `#9d4edd` o `#a855f7`.
- Nodos inactivos: gama `#5f5f68` a `#a1a1aa`.
- El nodo activo tendrá un halo mediante un círculo SVG adicional con blur.
- Algunos nodos podrán tener etiquetas cortas, pero no todos, para evitar ruido visual.

## Escenas propuestas

La primera versión tendrá cinco estados. Los textos son provisionales y podrán sustituirse después.

1. **Conexiones**
   - El grafo aparece disperso.
   - Se activa un nodo central.
   - Texto: «Toda idea comienza como un punto aislado. Su valor aparece cuando encuentra una conexión.»

2. **Afinidades**
   - Los nodos relacionados se acercan y forman pequeños grupos.
   - Se activa un clúster morado.
   - Texto: «Las afinidades reúnen conceptos, personas y posibilidades que parecían independientes.»

3. **Expansión**
   - El grupo activo se abre y genera nuevas ramificaciones.
   - Varias líneas aparecen progresivamente.
   - Texto: «Una conexión puede convertirse en una red que crece, cambia y abre nuevas direcciones.»

4. **Movimiento**
   - El foco viaja de un clúster a otro.
   - Los nodos anteriores regresan a gris.
   - Texto: «El centro no es permanente. La atención transforma la manera en que interpretamos el sistema.»

5. **Sistema**
   - La red completa alcanza una composición equilibrada.
   - Permanecen varios nodos morados conectados.
   - Texto: «Cada parte conserva su identidad, pero el significado final pertenece al conjunto.»

## Comportamiento del scroll

- La sección tendrá `600dvh` en escritorio: cinco tramos visibles y el espacio necesario para liberar el sticky al terminar.
- En su interior habrá un escenario `sticky` de `100dvh`.
- Cada `100dvh` de recorrido corresponderá a una escena.
- El cambio de texto y la selección del grafo ocurrirán en el mismo umbral.
- Entre umbrales, Framer Motion interpolará posiciones, tamaños, opacidades y líneas.
- El primer estado aparecerá al terminar el módulo del carrusel, sin salto de color ni espacio vacío.
- El último estado liberará el `sticky` para permitir continuar al siguiente contenido del Home.

Secuencia:

```text
Fin del carrusel
      ↓
Entrada de Grafos visuales
      ↓
Conexiones → Afinidades → Expansión → Movimiento → Sistema
      ↑                                                    ↓
      └──────────────── reversión al subir ────────────────┘
```

## Arquitectura propuesta

Archivos nuevos:

- `components/VisualGraphs.jsx`
- `components/VisualGraphs.module.css`
- `data/visualGraphs.js`

Archivo que se modificará:

- `app/page.jsx`, agregando `<VisualGraphs />` después de `<HomeCarousel />`.

Responsabilidades:

- `VisualGraphs.jsx`: progreso del scroll, escena activa y render SVG.
- `VisualGraphs.module.css`: composición sticky, columnas y adaptación responsive.
- `visualGraphs.js`: textos, nodos, conexiones y coordenadas de cada escena.

Cada escena tendrá una forma similar a:

```js
{
  id: "connections",
  title: "Conexiones",
  text: "...",
  activeNodes: ["n4"],
  nodes: [{ id: "n1", x: 18, y: 42, size: 7 }],
  edges: [["n1", "n4"]],
}
```

Las coordenadas utilizarán un `viewBox` SVG estable, por ejemplo `0 0 800 800`, para que el grafo sea responsive sin recalcular el layout en cada píxel.

## Animaciones

- Posición de nodos: interpolación entre coordenadas de escenas.
- Conexiones: actualización de extremos y transición de opacidad.
- Nodo activo: escala aproximada de `1` a `1.25` y halo morado.
- Texto: salida corta del estado anterior y entrada del siguiente.
- Fondo: variación muy sutil del resplandor según el clúster activo.
- No se ejecutarán bucles infinitos de animación.

## Móvil y orientación vertical

- No se utilizará una sección de `600dvh` en móvil.
- El contenido se convertirá en una secuencia vertical normal.
- Cada escena mostrará primero el texto y después un grafo estático simplificado.
- Se reducirán los nodos visibles y el tamaño de las etiquetas.
- No habrá sticky prolongado para evitar una experiencia de scroll pesada.

## Accesibilidad y movimiento reducido

- El SVG será decorativo y tendrá `aria-hidden="true"`.
- El contenido textual será HTML real y seguirá siendo legible sin animaciones.
- Con `prefers-reduced-motion`, los nodos cambiarán con una transición corta o directamente entre estados.
- El contraste del texto y del nodo activo deberá cumplir una lectura clara sobre el fondo oscuro.

## Rendimiento

- Objetivo: no más de 30 nodos y 45 conexiones visibles por escena.
- Sólo se actualizará el estado de React cuando cambie la escena, no en cada píxel del scroll.
- El progreso continuo se mantendrá en Motion Values.
- SVG utilizará círculos y líneas simples.
- Los filtros blur se limitarán al nodo o clúster activo.
- No se añadirá una librería de grafos ni un motor de física en la primera versión.
- No se cargarán videos, imágenes o canvas de alta resolución.

## Fases de implementación

1. Crear los cinco textos y la estructura de datos.
2. Diseñar una sola escena estática a 1280 × 800.
3. Validar proporción entre columna izquierda y grafo derecho.
4. Crear las cinco configuraciones de nodos y conexiones.
5. Añadir el escenario sticky y mapear el scroll a las escenas.
6. Interpolar nodos, conexiones, foco y texto.
7. Integrar el módulo después de `HomeCarousel`.
8. Crear la versión móvil simplificada.
9. Añadir `prefers-reduced-motion`.
10. Verificar visualmente con Playwright y ajustar únicamente con capturas y mediciones.

## Verificación requerida

- Capturas al inicio y en cada una de las cinco escenas.
- Confirmar que el módulo comienza justo después del carrusel.
- Confirmar que el grafo ocupa la derecha y el texto la izquierda.
- Confirmar que los nodos activos son morados y los inactivos grises.
- Confirmar que texto, foco y composición cambian juntos.
- Confirmar que la secuencia se revierte al subir.
- Confirmar que no existe scroll horizontal.
- Revisar consola, errores de red y fluidez.
- Repetir a 1024, 1280 y 1440 px de ancho.
- Verificar la versión vertical en 390 × 844.
- Confirmar que no se descargan videos ni recursos gráficos pesados.

## Criterio de aceptación

El módulo estará terminado cuando las cinco escenas se recorran y reviertan mediante scroll, el texto permanezca a la izquierda, el grafo a la derecha, los estados activos se distingan en morado, los nodos secundarios permanezcan grises y la experiencia sea fluida sin video ni simulación física permanente.

## Decisiones pendientes antes de implementar

- Confirmar o sustituir los cinco textos provisionales.
- Confirmar si algunos nodos deben mostrar palabras o si todos serán círculos sin etiqueta.
- Confirmar si el último estado conecta con otro módulo del Home o termina la página.

## Implementación completada

- Se creó `VisualGraphs.jsx` con cinco escenas controladas por `useScroll`.
- Se creó un grafo SVG de 32 nodos y 56 conexiones, sin librerías adicionales ni simulación física.
- El lenguaje visual se ajustó a una referencia tipo Obsidian: composición radial, nodos azules, selección verde, conexiones cian y etiquetas oscuras de archivo.
- El campo del grafo ocupa más que el viewport derecho para recortar una órbita exterior en los bordes; combina una deriva gravitacional con una rotación continua de 95 segundos sin romper las conexiones.
- Los nodos conservan su identidad y animan entre coordenadas predeterminadas.
- Las conexiones activas y sus nodos se resaltan en morado; el resto permanece gris.
- El módulo se integró inmediatamente después de `HomeCarousel`.
- En escritorio utiliza `600dvh`, un escenario sticky y cinco tramos de `100dvh`.
- En móvil se convierte en cinco tarjetas verticales con grafos simplificados.
- `prefers-reduced-motion` reduce las transiciones a cambios casi inmediatos.

## Verificación completada

- Ruta `/`: HTTP 200.
- Inicio del módulo: `y=4800`, exactamente al terminar el carrusel a 1280 × 800.
- Escenas verificadas: Conexiones, Afinidades, Expansión, Movimiento y Sistema.
- Reversión verificada al subir: Sistema → Movimiento → Expansión → Afinidades → Conexiones.
- Verificado a 1024, 1280 y 1440 px sin superposición ni scroll horizontal.
- Verificado en móvil a 390 × 844: cinco tarjetas, desktop oculto y sin sticky prolongado.
- Sin errores de consola del módulo ni recursos visuales externos.
- El código compila y pasa la validación de tipos de Next.js.
- El build completo se detiene después de compilar por rutas preexistentes ausentes: `/api/slides/seed` y `/api/webhook/stripe`.

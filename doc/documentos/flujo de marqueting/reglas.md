# Reglas de diseño — Flujo de marketing

Este documento define las reglas visuales obligatorias para crear o modificar
módulos y conexiones del flujo construido con React Flow.

## 1. Entradas e inputs

- Toda conexión de entrada debe terminar en un `Handle` de tipo `target`.
- El input debe ubicarse en la **cabecera del módulo**, no dentro del cuerpo.
- El círculo debe quedar completamente visible fuera del borde; el contenedor
  del nodo debe usar `overflow: visible` para evitar recortes.
- Si varias rutas llegan al mismo módulo, pueden converger en el input de la
  cabecera siempre que las líneas se distingan con claridad.

## 2. Salidas y outputs

- Toda conexión de salida debe comenzar en un `Handle` de tipo `source`.
- El output debe estar colocado **dentro del botón que origina la acción**; no
  debe salir desde un punto genérico del borde del módulo.
- La línea debe comenzar exactamente en el **círculo azul con signo `+`** del
  botón. No basta con que el `Handle` esté asociado al botón: el inicio visible
  de la arista debe coincidir con el centro de ese círculo.
- El círculo de output se coloca completo sobre el borde derecho del botón y no
  puede quedar oculto, recortado ni separado visualmente de la línea.
- Cada botón con salida debe tener un identificador de `Handle` propio y la
  arista debe declarar el `sourceHandle` correspondiente.
- Un mismo output puede dividirse en dos o más rutas cuando una acción alimenta
  varios módulos, como sucede actualmente con `Exportar datos`.

## 3. Botones de los módulos

- Los botones principales deben abarcar el **ancho interior completo del
  módulo**.
- Deben conservar el margen lateral definido por el relleno del cuerpo, usar
  `width: 100%` y `box-sizing: border-box`.
- El texto y el icono deben permanecer centrados.
- Si el botón contiene un output, debe usar `position: relative` para anclar el
  círculo de salida sin alterar el contenido.

## 4. Conexiones

- Las líneas usan `smoothstep` para formar recorridos angulares suavizados.
- Color azul `#2f80ff`, grosor `1.5` y patrón punteado `7 7`.
- La animación dura `1.15s` y debe detenerse con `prefers-reduced-motion`.
- Las conexiones terminan con una flecha azul cerrada.
- Las posiciones de los módulos deben dejar las líneas legibles y evitar cruces
  innecesarios.

## 5. Comportamiento actual

- Todos los botones, indicadores, interruptores, descargas y escáneres son
  visuales; no ejecutan acciones reales.
- El lienzo permite desplazamiento y zoom, pero no edición, arrastre de nodos ni
  creación manual de conexiones.
- Cualquier futura función debe separar la definición del flujo, su ejecución,
  las integraciones externas, las métricas y la presentación visual.

## Lista de comprobación

Antes de dar por terminado un módulo nuevo:

1. Confirmar que los inputs estén completos y en la cabecera.
2. Confirmar que cada línea nazca exactamente del círculo azul con `+` del botón
   correcto.
3. Confirmar que los botones principales ocupen todo el ancho interior.
4. Revisar que las conexiones sean legibles y mantengan el sistema visual.
5. Actualizar `memoria.md` y `09_flujo_publicitario_react_flow.md`.
6. Ejecutar `git diff --check` y `npx tsc --noEmit`.
7. Verificar `/grow/proyectos/identidad-visual` con respuesta HTTP 200.

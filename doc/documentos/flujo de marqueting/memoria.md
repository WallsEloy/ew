# Memoria activa — Flujo de marketing

## Estado actual

El flujo visual vive en el proyecto Grow `identidad-visual` y usa React Flow.
Todos sus datos y controles son demostrativos.

El Dashboard dispone de un canvas React Flow en `/dashboard/grow/flujo` para
arrastrar módulos, agregar nodos, dibujar o eliminar conexiones y cambiar
visibilidad, color de cabecera e imagen de icono. Las coordenadas sólo se cambian
arrastrando en el canvas. La configuración se guarda en `grow_page.flow`
mediante `/api/grow` y la vista pública la consume al renderizar.

Cada nodo tiene una categoría fija —su tipo funcional— y un título visible
editable. Las categorías se usarán después para habilitar controles específicos
sin retirar las modificaciones generales existentes.

## Topología vigente

```text
INICIO
  ├─ Facebook ──┐
  ├─ Instagram ─┤
  ├─ TikTok ────┼─ Landing Page
  └─ Spotify ───┘       ├─ Enviar datos ─ Recolección de datos
                        │                    └─ Exportar datos ─┬─ Facebook Pixel
                        │                                      └─ Descarga de QR ─ Escanear QR ─ Actualización de estado ─ Almacenamiento SQL
                        └─ Salió ───────────────── Facebook Pixel

Facebook Pixel ─ Ver ayuda ─ Facebook ADS ─ Create Campaign ─ Landing Page (2)
                                                               ├─ Enviar datos ─ Recolección (2) ─ Exportar datos ─ Facebook Pixel (2)
                                                               │                                      └─ Descarga QR (2) ─ Escanear QR (2) ─ Actualización (2)
                                                               └─ Salió ───────────────────────── Facebook Pixel (2)

Actualización de estado (1) ─┐
                             ├─ Almacenamiento SQL
Actualización de estado (2) ─┘
```

## Contratos visuales

La especificación normativa completa vive en `reglas.md`.

- Conexiones `smoothstep`, azules `#2f80ff`, grosor `1.5`, patrón `7 7` y
  animación de `1.15s`.
- Entrada: círculo azul completo en la cabecera.
- Salida: círculo azul con `+`, anclado al borde derecho del botón que origina
  la ruta; la línea comienza exactamente en el centro de ese círculo.
- Tarjetas oscuras con cabeceras de color.
- `Exportar datos` tiene dos conexiones de salida.
- Facebook Pixel muestra círculos de Facebook, Instagram y TikTok antes de
  `Active`.
- Los botones Descargar QR y Escanear QR ocupan el ancho interior completo.
- Descarga de QR, Escanear QR y Actualización de estado usan un ancho compacto
  uniforme de `190px`.
- Sus cabeceras conservan `56px` de altura para alinearse visualmente con el
  resto de los módulos.

## Posiciones relevantes

- Facebook Pixel: `{ x: 790, y: 570 }`.
- Descarga de QR: `{ x: 1640, y: 70 }`.
- Escanear QR: `{ x: 2030, y: 110 }`.
- Actualización de estado: `{ x: 2420, y: 110 }`.
- Almacenamiento SQL: `{ x: 3760, y: 70 }`.
- Facebook ADS: `{ x: 1400, y: 610 }`.
- Landing Page (2): `{ x: 1740, y: 610 }`.
- Recolección de datos (2): `{ x: 2130, y: 610 }`.
- Facebook Pixel (2): `{ x: 1950, y: 1080 }`.
- Descarga de QR (2): `{ x: 2550, y: 610 }`.
- Escanear QR (2): `{ x: 2880, y: 610 }`.
- Actualización de estado (2): `{ x: 3210, y: 610 }`.
- Ambas actualizaciones convergen en Almacenamiento SQL desde sus botones
  `Guardar estado`.

## Próxima evolución prevista

La intención futura es convertir el diagrama en un flujo funcional editable.
Antes de hacerlo se deben separar definición, ejecución, integraciones, métricas
y presentación, siguiendo la arquitectura descrita en el documento 09.

La edición actual es de configuración: el canvas del Dashboard sí es editable,
pero no ejecuta el flujo ni habilita el arrastre sobre el lienzo público.

# Memoria activa — Flujo de marketing

## Estado actual

El flujo visual vive en el proyecto Grow `identidad-visual` y usa React Flow.
Todos sus datos y controles son demostrativos.

## Topología vigente

```text
INICIO
  ├─ Facebook ──┐
  ├─ Instagram ─┤
  ├─ TikTok ────┼─ Landing Page
  └─ Spotify ───┘       ├─ Enviar datos ─ Recolección de datos
                        │                    └─ Exportar datos ─┬─ Facebook Pixel
                        │                                      └─ Descarga de QR ─ Escanear QR
                        └─ Salió ───────────────── Facebook Pixel

Facebook Pixel ─ Ver ayuda ─ Concepto creativo ─ Medición ─ Aprendizaje
```

## Contratos visuales

- Conexiones `smoothstep`, azules `#2f80ff`, grosor `1.5`, patrón `7 7` y
  animación de `1.15s`.
- Entrada: círculo azul completo en la cabecera.
- Salida: círculo azul con `+`, situado dentro del botón que origina la ruta.
- Tarjetas oscuras con cabeceras de color.
- `Exportar datos` tiene dos conexiones de salida.
- Facebook Pixel muestra círculos de Facebook, Instagram y TikTok antes de
  `Active`.
- Los botones Descargar QR y Escanear QR ocupan el ancho interior completo.

## Posiciones relevantes

- Facebook Pixel: `{ x: 790, y: 570 }`.
- Descarga de QR: `{ x: 1240, y: 570 }`.
- Escanear QR: `{ x: 1630, y: 610 }`.

## Próxima evolución prevista

La intención futura es convertir el diagrama en un flujo funcional editable.
Antes de hacerlo se deben separar definición, ejecución, integraciones, métricas
y presentación, siguiendo la arquitectura descrita en el documento 09.


# Flujo publicitario con React Flow

## Propósito del documento

Este documento conserva el diseño, la estructura técnica y la ruta de evolución
del **flujo publicitario de clientes**. La versión actual es una representación
visual, pero se diseñó con la intención de convertirse después en una herramienta
funcional sin reconstruir la interfaz desde cero.

Nombre técnico acordado: **Flujo publicitario con React Flow**.

## Ubicación actual

- Página principal: `/grow/proyectos/identidad-visual`
- Alias temporal: `/grow/proyectos/identidad-visuall`
- Componente: `components/ClientAdvertisingFlow.jsx`
- Estilos: `components/ClientAdvertisingFlow.module.css`
- Integración de ruta: `app/grow/proyectos/[slug]/page.jsx`
- CSS global requerido: `@xyflow/react/dist/style.css` en `app/globals.css`
- Dependencia instalada: `@xyflow/react@12.11.2`

El flujo sólo aparece cuando el `slug` resuelto del proyecto es
`identidad-visual`. Las demás páginas de Grow conservan su composición normal.

## Estado funcional actual

La implementación es deliberadamente **sólo visual**:

- Los nodos no se pueden arrastrar.
- No se pueden crear ni eliminar conexiones.
- Los elementos no se pueden seleccionar.
- El doble clic no hace zoom.
- Sí se puede desplazar el lienzo y acercar o alejar con la rueda.
- React Flow ajusta el diagrama completo al entrar mediante `fitView`.
- Las conexiones punteadas están animadas; con `prefers-reduced-motion` la
  animación se detiene.

Estas restricciones viven en las props de `<ReactFlow>` y deben retirarse de
forma intencional cuando comience la fase funcional.

## Topología visual

```text
                         ┌─ Facebook ─┐
                         ├─ Instagram─┤
INICIO ──── cuatro ramas ─┤ TikTok ───┤─ Landing Page ─┬─ Enviar datos ─ Recolección ─┬─ Facebook Pixel ─ Concepto creativo ─ Medición ─ Aprendizaje
                         └─ Spotify ──┘                │                              └─ Descarga de QR ─ Escanear QR
                                                      └─ Salió ───────── Facebook Pixel
```

Secuencia semántica:

1. **INICIO** representa la entrada de un cliente o una campaña.
2. Se abren cuatro canales: Facebook, Instagram, TikTok y Spotify.
3. Facebook, Instagram, TikTok y Spotify convergen en **Landing Page**.
4. `Enviar datos` abre el módulo **Recolección de datos**; `Salió` mantiene una
   ruta directa.
5. Ambas ramas convergen por la cabecera del módulo **Facebook Pixel**.
6. La salida de Facebook Pixel nace del botón visual `Ver ayuda` y continúa a
   **Concepto creativo**.
7. El resultado pasa por **Medición** y termina en **Aprendizaje**.

## Sistema visual

### Nodo INICIO

- Fondo blanco sólido.
- Texto oscuro centrado.
- Brillo blanco suave.
- Es el único punto de entrada del grafo.

### Conexiones

- Tipo React Flow: recorrido con ángulos suavizados (`smoothstep`).
- Color: azul `#2f80ff`.
- Grosor: `1.5`.
- Patrón punteado `7 7`, animado a `1.15s` por ciclo.
- Flecha azul cerrada al final.
- Salidas representadas por un círculo azul con signo `+`.
- Entradas representadas por un punto azul con aro claro.

### Nodo Facebook

Tarjeta oscura inspirada en un panel de automatización:

- Ancho actual: `238px`.
- Cabecera azul con marca, nombre, estado `Active` e interruptor visual.
- Métricas: `Sent`, `Delivered`, `Seen`, `Clicked`.
- Bloque inferior: `Get Started Button` y progreso `0%`.
- El interruptor y las métricas no ejecutan acciones.

### Nodos Instagram, TikTok y Spotify

Comparten el componente `PlatformNode` y el mismo ancho de `238px`. La
identidad cambia mediante datos:

| Canal | Acento | Tipo visual | Acción actual |
| --- | --- | --- | --- |
| Instagram | Magenta | Perfil de negocio | View profile |
| TikTok | Turquesa/rosa | Cuenta publicitaria | Watch video |
| Spotify | Verde | Campaña de audio | Listen now |

Cada tarjeta muestra alcance, vistas, clics y un porcentaje decorativo.

### Nodo Landing Page

Nodo oscuro de `320px` inspirado en un panel de diseño y recolección de datos:

- Cabecera violeta con estado `Active` e interruptor decorativo.
- Métricas: vistas, visitantes, leads y tasa de conversión.
- Miniatura visual de una landing con navegación, titular y CTA.
- Acciones `Enviar datos` y `Salió`, actualmente no funcionales.
- Recibe conexiones desde Facebook, Instagram, TikTok y Spotify.
- `Enviar datos` conecta con Recolección de datos; `Salió` conecta directamente
  con `Facebook Pixel`.

Cuando el flujo sea funcional, este nodo debe representar un recurso de landing
versionado; la captura, el formulario y sus conversiones deben vivir en datos
separados, no incrustados en el componente visual.

### Nodo Recolección de datos

Nodo oscuro de `340px`, conectado desde la salida `Enviar datos` de Landing
Page:

- Cabecera violeta con estado `Active`.
- Resumen de total, hoy, semana y conversión.
- Tabla visual de nombre, correo, teléfono, empresa y mensaje.
- Estado de actualización y acción decorativa `Exportar datos`.
- Su salida nace del botón `Exportar datos` y se bifurca hacia `Facebook Pixel`
  y `Descarga de QR`.

### Nodo Descarga de QR

- Nodo oscuro conectado desde el mismo botón `Exportar datos` de Recolección.
- Incluye una representación decorativa de un código QR.
- La acción `Descargar QR` es únicamente visual en esta fase.
- El botón `Descargar QR` ocupa todo el ancho interior del módulo.
- Junto con Facebook Pixel forma las dos salidas actuales de Recolección.
- La salida del botón `Descargar QR` conecta con el módulo `Escanear QR`.

### Nodo Escanear QR

- Recibe la conexión en su cabecera desde el botón `Descargar QR`.
- Presenta un marco de lectura, un QR atenuado y una línea de escaneo violeta.
- El botón `Escanear QR` es decorativo y no solicita acceso a la cámara.
- El botón `Escanear QR` ocupa todo el ancho interior del módulo.

### Nodo Facebook Pixel

Nodo oscuro inspirado en un panel de monitoreo de Meta:

- Recibe en su cabecera las rutas `Salió` y `Exportar datos`.
- Se ubica debajo de los módulos anteriores para que ambas conexiones puedan
  distinguirse claramente en el lienzo.
- La cabecera muestra indicadores circulares de Facebook, Instagram y TikTok a
  la izquierda del estado `Active`.
- Muestra estado activo, eventos recibidos, conversiones y última actividad.
- Incluye una tabla visual de eventos y un panel de estado de conexión.
- Su salida nace del botón `Ver ayuda` y continúa hacia `Concepto creativo`.
- Todos sus indicadores son decorativos en esta fase.

En una fase funcional, este nodo no debe almacenar información personal dentro
de la definición del grafo. El flujo sólo debe referenciar una fuente de datos;
los registros requieren tablas protegidas, permisos, retención definida y
auditoría independiente.

## Modelo actual en código

El componente mantiene tres estructuras estáticas:

1. `nodeTypes`: asocia `facebookPage`, `platform`, `landingPage` y
   `dataCollection` con componentes React.
2. `nodes`: contiene id, tipo, posición y datos visuales.
3. `edges`: define las relaciones dirigidas mediante el helper `edge()`.

Las posiciones usan coordenadas absolutas del lienzo. Cuando un nodo cambia de
tamaño hay que revisar las coordenadas cercanas para evitar superposiciones.

## Contrato futuro recomendado

Antes de hacer funcional el flujo, mover `nodes` y `edges` a una configuración
serializable. Forma sugerida:

```json
{
  "id": "campaign-id",
  "name": "Campaña de lanzamiento",
  "status": "draft",
  "nodes": [
    {
      "id": "channel-instagram",
      "type": "platform",
      "position": { "x": 330, "y": 80 },
      "data": {
        "platform": "instagram",
        "accountId": null,
        "status": "inactive",
        "metrics": { "reach": 0, "views": 0, "clicks": 0 }
      }
    }
  ],
  "edges": [
    {
      "id": "start-instagram",
      "source": "start",
      "target": "channel-instagram",
      "condition": null
    }
  ],
  "version": 1
}
```

No guardar JSX, clases CSS ni colores dentro de la base de datos. Conviene
guardar tipos y estados semánticos, y resolver su presentación en el frontend.

## Arquitectura funcional propuesta

```text
Dashboard de campaña
        ↓
API /api/campaign-flows
        ↓
Supabase: campaign_flows + campaign_runs + channel_metrics
        ↓
Adaptadores por canal (Meta, TikTok, Spotify)
        ↓
Webhooks / tareas programadas / sincronización de métricas
        ↓
React Flow representa estado, errores y resultados
```

Separar desde el inicio:

- **Definición del flujo:** nodos, conexiones, posiciones y configuración.
- **Ejecución:** una instancia concreta del flujo para un cliente/campaña.
- **Integraciones:** credenciales y llamadas a cada plataforma.
- **Métricas:** series temporales, no valores incrustados en el nodo.
- **Presentación:** colores, tarjetas y animaciones del componente actual.

## Fases de evolución

### Fase 1 — Configuración visual

- Mover nodos y conexiones al Dashboard.
- Permitir editar etiquetas, posiciones y orden.
- Persistir la definición en Supabase.
- Mantener el flujo sin ejecutar acciones externas.

### Fase 2 — Modelo de campaña

- Crear clientes y campañas.
- Asociar un flujo versionado a cada campaña.
- Estados sugeridos: `draft`, `ready`, `running`, `paused`, `complete`, `error`.
- Registrar historial de cambios y responsable.

### Fase 3 — Integraciones reales

- Autorización OAuth por plataforma.
- Adaptador independiente para Meta, TikTok y Spotify.
- Cifrado y aislamiento de tokens.
- Webhooks idempotentes, reintentos y registro de errores.
- Ninguna credencial debe viajar al componente cliente.

### Fase 4 — Ejecución y observabilidad

- Activar nodos según el estado real del proceso.
- Mostrar progreso, fallos y última sincronización.
- Sustituir las métricas ficticias por datos agregados.
- Incorporar auditoría y trazabilidad por ejecución.

### Fase 5 — Editor completo

- Activar arrastre, conexiones y selección en React Flow.
- Validar que exista un solo inicio y que no haya nodos huérfanos.
- Prevenir ciclos cuando el tipo de flujo no los admita.
- Guardado optimista, deshacer/rehacer y versiones publicables.

## Decisiones que deben conservarse

- Mantener `ClientAdvertisingFlow` como frontera visual; no introducir llamadas
  directas a proveedores dentro de los nodos.
- Los componentes de nodo deben recibir datos serializables.
- Cada integración futura necesita una capa de adaptador en servidor.
- El modo visual debe seguir funcionando sin credenciales ni servicios externos.
- Respetar `prefers-reduced-motion` cuando se agreguen nuevas animaciones.
- Mantener etiquetas accesibles y una descripción textual del recorrido.

## Pendientes inmediatos

- Definir qué significa cada nodo en el proceso real del negocio.
- Confirmar si las cuatro plataformas son ramas paralelas o etapas sucesivas.
- Elegir las métricas reales que debe mostrar cada canal.
- Definir qué acciones ejecutaría `Concepto creativo`, `Medición` y
  `Aprendizaje`.
- Decidir si la edición vivirá en `Dashboard → Grow` o en un panel separado de
  automatizaciones.

## Verificación actual

- La ruta canónica y el alias responden HTTP 200.
- `npx tsc --noEmit` termina sin errores.
- El flujo se carga con React Flow `12.11.2`.
- Las conexiones se detienen con `prefers-reduced-motion`.

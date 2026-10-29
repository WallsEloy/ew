# Landing de GoGo Food

- [← Contexto de Grow](./claude.md)
- [← Mapa de documentos especializados](../claude.md)

Landing de presentación de **GoGo Food**, una plataforma de delivery local (FoodTech) con Acámbaro, Gto., como ciudad piloto. Se ve en `/grow/proyectos/gogo`.

Es una **demostración informativa**:
- no capta recursos;
- no es una oferta pública de valores;
- no promete rendimientos.

## Archivos

| Archivo | Rol |
| --- | --- |
| `data/gogo.js` | **Configuración**: textos, porcentajes, ciudades, roadmap, documentos y límites del simulador. Todas las cifras son ilustrativas. |
| `components/gogo/GogoLanding.jsx` | Las 12 secciones, la barra de secciones (sticky), el mockup, el ecosistema, el mapa y el modal. |
| `components/gogo/Simulador.jsx` | Simulador de participación. Recuerda el último escenario en `localStorage`. |
| `components/gogo/Dona.jsx` | Gráfica de dona en SVG, interactiva con el mouse y el teclado. |
| `components/gogo/Formulario.jsx` | Formulario con validación. **No envía datos.** |
| `components/gogo/piezas.jsx` | Tooltip `Ayuda`, `Contador` animado y `useRevelar` (entrada con IntersectionObserver). |
| `components/gogo/Icono.jsx` | Íconos de línea estilo Lucide, en línea. |
| `components/gogo/fuente.js` | Tipografía Manrope (`next/font`). |
| `components/gogo/gogo.module.css` | Estilos, paleta 60·30·10: naranja `#EA580C` de fondo (60 %), blanco en tarjetas, paneles y títulos (30 %) y azul cielo `#38BDF8` en acciones y estados activos (10 %). Las gráficas usan colores propios, fuera de la paleta, para ser más expresivas. |

La ruta `app/grow/proyectos/[slug]/page.jsx` entrega la landing cuando el slug es `gogo` y genera sus metadatos (incluido Open Graph).

## Decisiones respecto al prompt original

El prompt pedía HTML, CSS y JS sueltos con Chart.js y Lucide por CDN. La landing se integró al sitio en Next.js para conservar la navegación, el dock y el despliegue:
- **Gráficas:** SVG propio, en lugar de Chart.js.
- **Íconos:** en línea, en lugar de la librería de Lucide.

Así no se agregó ninguna dependencia.

## Fórmulas del simulador

- **Escenario A (aportación aislada):**
  - Participación = Aportación ÷ (Pre-money + Aportación) × 100
  - Post-money = Pre-money + Aportación
- **Escenario B (varios inversionistas):**
  - Participación = Aportación ÷ (Pre-money + Capital total) × 100
  - Dilución de los actuales = Capital total ÷ (Pre-money + Capital total) × 100
- Si el capital total es menor que la aportación, B usa la aportación como total.

## Reglas de contenido

- No mostrar retornos, dividendos, valuaciones oficiales ni cifras de usuarios o facturación como reales.
- No fechar el roadmap ni marcar fases como terminadas sin datos. Hoy sólo «Desarrollo tecnológico» está «En curso».
- Ninguna ciudad está «operativa»: Acámbaro es el piloto y las demás son ilustrativas.
- La participación de los socios queda «pendiente de definición contractual».
- Antes de conectar el formulario a un servidor, publicar el aviso de privacidad real.

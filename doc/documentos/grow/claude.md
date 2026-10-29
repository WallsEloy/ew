# Contexto de Grow

Grow es la sección de marketing y proyectos de crecimiento del portafolio.

- [← Mapa de documentos especializados](../claude.md)
- [Landing de GoGo Food](./gogo_landing.md)
- [Landing del Club Privado de Inversionistas](./club_landing.md)
- [Plantilla de crowdfunding: ARTIFACT y HUMANS (preventa con recompensas)](./artifact_landing.md)

## Estructura

| Ruta | Qué muestra |
| --- | --- |
| `/grow/opcion-a` | Menú Grow → **Marketing**: tarjetas de los proyectos sin sección o con `seccion: "marketing"`. |
| `/grow/proyectos` | Menú Grow → **Proyectos**: tarjetas con `seccion: "proyectos"`. |
| `/grow/club` | Landing del club privado de inversionistas (enlazada desde Proyectos). |
| `/grow/proyectos/[slug]` | Página de cada proyecto. Tienen landing propia:<br>• `gogo`: presentación de negocio.<br>• `artifact` y `humans-fotolibro`: campañas de crowdfunding con la misma plantilla. |

- Los proyectos viven en Supabase, `site_settings` → clave `grow_page` → `projects`, y se editan en Dashboard → Grow.
- Las dos listas usan el mismo componente, `app/grow/TarjetasGrow.jsx`.
- Campos de cada tarjeta:
  - `seccion`: `"marketing"` o `"proyectos"`.
  - `estilo`: `"normal"` (degradado blanco) o `"post"` (como la de marketing).
  - `avatar` y `avatarColor`: el círculo de la barra de post.
- Al guardar, `app/api/grow/route.js` revalida las dos listas.

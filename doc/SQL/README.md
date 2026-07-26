# Respaldo SQL de Supabase

Esta carpeta conserva una copia de todo SQL aplicado al proyecto Supabase.

## Registro

| Fecha | Archivo | Propósito | Estado |
| --- | --- | --- | --- |
| 2026-07-19 | [2026-07-19_home_slides.sql](./2026-07-19_home_slides.sql) | CMS del carrusel del Home (incluye `button_color`) | Aplicado y verificado (la tabla faltaba en el proyecto y se creó; incluye `button_color`) |
| 2026-07-19 | [2026-07-19_portfolio_content_and_storage.sql](./2026-07-19_portfolio_content_and_storage.sql) | Storage y contenido de Diseño/Galería | Aplicado y verificado |
| 2026-07-19 | [2026-07-19_home_slides_button_color.sql](./2026-07-19_home_slides_button_color.sql) | Columna `button_color` en `home_slides` (ALTER independiente) | Innecesario: `home_slides.sql` ya crea la tabla con la columna |
| 2026-07-19 | [2026-07-19_site_settings.sql](./2026-07-19_site_settings.sql) | Tabla `site_settings` (jsonb) para los editores de Navegadores (`key='navbar'`) y Área dos (`key='graphs'`) | Pendiente de aplicar |

## Regla de mantenimiento

Cada SQL nuevo aplicado en Supabase debe guardarse aquí con el formato
`AAAA-MM-DD_descripcion.sql` y agregarse a esta tabla. Las migraciones ejecutables
continúan en `supabase/migrations`; esta carpeta funciona como respaldo documental.

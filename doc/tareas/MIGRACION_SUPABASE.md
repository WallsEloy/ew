# Migración de contenido a Supabase

## Estado

**Migración de recursos y contenido completada el 2026-07-19.** El cambio del
frontend para consumir exclusivamente Supabase permanece como fase posterior.

### Resultado verificado

- `86` imágenes WebP subidas y verificadas mediante SHA-256.
- `38` videos excluidos.
- `7` colecciones importadas.
- `59` proyectos importados.
- `49` archivos locales asociados en `portfolio_media`.
- `5` destacados importados.
- Los otros `10` proyectos conservan imágenes externas de prueba.
- Un recurso público de Storage respondió con HTTP `200`.

## Inventario inicial

- `124` archivos dentro de `public`.
- Tamaño aproximado total: `1.54 GB`.
- `public/Videos`: aproximadamente `1.37 GB`; queda fuera de esta fase.
- Integración de servidor parcial del carrusel del Home. NOTA (2026-07-19): la
  tabla `home_slides` **en realidad no existía** en el proyecto pese a estar
  marcada como aplicada; el editor fallaba con "Could not find the table
  'public.home_slides'". Se creó y verificó ese día (ver
  `doc/SQL/2026-07-19_home_slides.sql`, ahora con la columna `button_color`).

## Arquitectura propuesta

- Bucket público `portfolio-assets` para recursos que actualmente ya son
  públicos en el sitio.
- `portfolio_collections`: perfiles o categorías de Diseño y Galería.
- `portfolio_projects`: proyectos y publicaciones.
- `portfolio_media`: imágenes y videos asociados a cada proyecto.
- `portfolio_highlights`: destacados de cada colección.
- RLS permite lectura pública solamente cuando el contenido está publicado.
- Las escrituras se realizan exclusivamente desde servidor con `service_role`.

La migración inicial se encuentra en
`supabase/migrations/202607190001_portfolio_content_and_storage.sql`.

## Próximas fases

1. Configurar `.env.local` usando `.env.example` como referencia.
2. Vincular el repositorio con el proyecto mediante Supabase CLI.
3. Aplicar y verificar la migración SQL.
4. Ejecutar `node scripts/prepare-supabase-assets.mjs` para convertir todas las
   imágenes a WebP y generar un manifiesto con ruta, tamaño, MIME y checksum.
5. Subir las imágenes preparadas y comprobar URLs y checksums. **Completado.**
6. Mantener videos MOV, MP4 y WebM fuera de la carga hasta una fase posterior.
7. Importar `disenoData.js` y `galeriaData.js` a las tablas. **Completado.**
   `home_slides` no estaba disponible al ejecutar esta fase **porque la tabla no
   existía**; se creó y verificó el 2026-07-19 (guardado del carrusel + color de
   botón funcionando).
8. Cambiar el frontend gradualmente a Storage/Database con fallback local.
9. Verificar todas las páginas y solamente después retirar duplicados locales.

## Reglas de seguridad

- Nunca exponer `SUPABASE_SERVICE_ROLE_KEY` en componentes cliente.
- No confirmar `.env.local` en Git.
- No borrar archivos de `public` hasta comparar cantidad y checksum.
- Evitar sobrescribir objetos: usar rutas versionadas para prevenir caché obsoleta.
- Subir únicamente el contenido preparado en `.migration/supabase-assets`.

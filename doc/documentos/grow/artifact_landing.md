# Landing de ARTIFACT — Art Toy Project

- [← Contexto de Grow](./claude.md)
- [← Mapa de documentos especializados](../claude.md)

Es un tipo de proyecto nuevo en Grow → Proyectos: **una campaña de crowdfunding de recompensas**, es decir, una preventa.

- **Ruta:** `/grow/proyectos/artifact`.
- **No es inversión:** los paquetes son productos y experiencias. No son acciones ni instrumentos de inversión. Así se dice en la página, en el FAQ y en el checkout.
- **Datos de demostración:** las cifras de la campaña son demostrativas y el checkout es una simulación sin cobro.

## Plantilla de campañas

La landing es una **plantilla**: `components/artifact/CampanaLanding.jsx` recibe un objeto `datos` con toda la campaña.

- **Campañas actuales:**

  | Campaña | Datos | Ruta |
  | --- | --- | --- |
  | ARTIFACT | `CAMPANA_ARTIFACT` en `data/artifact.js` | `/grow/proyectos/artifact` |
  | HUMANS — Fotolibro 01 | `CAMPANA_HUMANS` en `data/humansFotolibro.js` | `/grow/proyectos/humans-fotolibro` |

- **Qué lleva el objeto:** `id`, `tema`, `modelo3d`, `ARTIFACT` (datos generales), `CAMPANA`, `VARIANTES`, `FICHA`, `PAQUETES`, `METAS`, `FABRICACION`, `GALERIA`, `ORIGEN` (con `imagen`), `ARTISTA`, `PREGUNTAS`, `DOCUMENTOS_LEGALES` y `TEXTOS` (titular, nombres de sección, cinta y CTA).
- **`modelo3d: true`:** el hero y «Explora la pieza» usan el visor 3D.
- **`modelo3d: false`:** el hero usa `ARTIFACT.heroImagen` y cada variante muestra su `imagen`. Así funciona HUMANS, con mockups del libro.
- **`tema`:** cambia el color de acento (`--lima`). HUMANS usa `tema: "humans"`, fucsia `#D946EF`. El modal y el lightbox lo reciben por el contexto `TemaCampana`.
- **Campaña nueva:**
  1. Crear su archivo de datos con la misma forma.
  2. Agregarla a `CAMPANAS` en `app/grow/proyectos/[slug]/page.jsx`, con sus metadatos.
  3. Crear su tarjeta en Grow → Proyectos, categoría Crowdfunding.

HUMANS es fotografía de desnudo artístico:

- **Aviso de contenido:** lleva la etiqueta «+18 · Desnudo artístico» y una pregunta en el FAQ.
- **Imágenes:** en el hero, las ediciones y la galería se eligieron tomas sin desnudo frontal explícito.

## Archivos

| Archivo | Rol |
| --- | --- |
| `data/artifact.js` | **Configuración de la campaña**: textos, cifras (meta, recaudado, patrocinadores, fecha de cierre), variantes, ficha técnica, paquetes (precio, límite, apartados, entrega estimada), metas, fabricación (estado y fecha editables), galería, origen, artista, FAQ y documentos legales. |
| `components/artifact/CampanaLanding.jsx` | Plantilla: las 12 secciones, la navegación y las animaciones GSAP + ScrollTrigger. Recibe `datos` con la campaña. |
| `components/artifact/Figura3D.jsx` | Visor 3D (React Three Fiber): figura construida con primitivas, entorno de luz local y modos `hero`, `explorar` y `captura`. |
| `components/artifact/Galeria.jsx` | Galería editorial con lightbox (teclado, deslizar con el dedo, foco atrapado). |
| `components/artifact/Checkout.jsx` | Checkout de simulación: resumen, datos y folio ficticio. |
| `components/artifact/Comunidad.jsx` | Registro de coleccionistas, listo para Supabase. |
| `components/artifact/piezas.jsx` | `Modal`, `Demo` y el formato `pesos`. |
| `components/artifact/fuentes.js` | Space Grotesk (titulares) e Instrument Serif itálica (acentos). |
| `components/artifact/artifact.module.css` | Estilos: negro `#0A0A0A`, blanco hueso `#EFEBE3`, gris metálico `#8A8D91` y lima `#C6FF00`. |
| `lib/artifactCampana.js` | Integraciones: `registrarColeccionista` y `crearCheckout`, con interruptores `COMUNIDAD_CONECTADA` y `CHECKOUT_CONECTADO`. |
| `app/api/artifact/comunidad/route.js` | Guarda el registro en Supabase. Sólo se usa con `COMUNIDAD_CONECTADA = true`. |
| `public/artifact/` | Renders generados desde el modelo 3D, bocetos y caja en SVG, y la portada de la tarjeta de Grow. |

## Composición tipo Kickstarter

- **Hero en tres columnas:**
  - izquierda: titular y botones;
  - centro: la figura 3D;
  - derecha: el bloque de aportación (barra de progreso, aportado, patrocinadores, días restantes y «Apoya este proyecto»).
- **Después del hero, en escritorio (≥ 1101 px):**
  - **Columna izquierda:** la historia, de Origen a FAQ.
  - **Panel derecho:** los paquetes van en un panel pegajoso (`#recompensas-panel`, componente `Paquetes` con `compacto`) y la sección «Elige tu edición» se oculta.
  - **Navegación:** `ir("recompensas")` detecta que la sección está oculta y lleva al panel.
- **En tableta y celular:** no hay panel; los paquetes vuelven a ser una sección normal.

La ruta `app/grow/proyectos/[slug]/page.jsx` entrega la landing cuando el slug es `artifact` y genera sus metadatos, con imagen de Open Graph.

La tarjeta de Grow vive en Supabase:

- **Ubicación:** `site_settings` → `grow_page` → `projects`, con slug `artifact`.
- **Sección y estilo:** `seccion: "proyectos"`, estilo `post`.
- **Imagen:** `/artifact/portada-tarjeta.webp`.

## Modelo 3D

- **Figura actual:** mientras no exista el modelo final, la figura se arma con primitivas: cabeza redondeada, visor, píxeles «glitch», antenas, halo y base numerada.
- **Modelo final:** sube el archivo a `public/artifact/modelo/` y pon su ruta en `ARTIFACT.modeloGLB`. El hero y el visor 360° lo cargan en lugar de la figura.
- **Reflejos sin descargas:** el entorno de luz usa `Lightformer` locales, sin mapas HDR externos.
- **Rendimiento:** el visor deja de dibujar cuando sale de la pantalla.
- **Movimiento reducido:** con esa preferencia no gira ni flota.

Los renders de la galería salieron de ese mismo visor, con una ruta temporal de captura que ya se eliminó. Para regenerarlos se puede crear otra vez una página que monte `<Figura3D modo="captura" ... />` y tomar capturas con Playwright.

## Conectar la comunidad a Supabase

1. Crear la tabla. Un registro por campaña y correo:

```sql
create table public.artifact_comunidad (
  id uuid primary key default gen_random_uuid(),
  campana text not null default 'artifact',
  nombre text not null,
  correo text not null,
  intereses text[] not null default '{}',
  consentimiento boolean not null default false,
  created_at timestamptz not null default now(),
  unique (campana, correo)
);
alter table public.artifact_comunidad enable row level security;
-- Sin políticas públicas: sólo escribe la API con la service role.
```

2. En `lib/artifactCampana.js`, poner `COMUNIDAD_CONECTADA = true`.
3. Publicar el Aviso de Privacidad real antes de recibir datos.

## Migrar a pagos reales (Stripe)

`crearCheckout` es el único punto que cambia. Se hace así:

- Crear una ruta que genere la sesión de Checkout con el precio del paquete.
- Devolver su URL y redirigir a ella.
- Usar un webhook que registre la compra y sume al `recaudado` y a los `apartados` del paquete.

Así, `CAMPANA` y `PAQUETES` pasarían a leerse de Supabase en lugar de `data/artifact.js`.

Antes de cobrar hay que publicar:

- los Términos de Preventa;
- las políticas de envío, cancelación y reembolso;
- el Aviso de Privacidad.

## Reglas de contenido

- **Cifras de la campaña:** siempre llevan la etiqueta «demostrativas» hasta conectarlas con datos reales.
- **Estados y fechas de fabricación:** son estimaciones editables.
- **Recompensas:** no prometer rendimientos ni presentar los paquetes como inversión.
- **Biografía del artista:** es un texto editable. Hay que revisarla antes de publicar.

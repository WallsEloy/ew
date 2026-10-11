# Acomodo de un proyecto de Coding — Dental Maya

[← Contexto de proyectos web](./claude.md) · [Método general (Web)](./acomodo_paginas_web.md) · [Mapa de documentación](../claude.md)

Cómo está armado el primer proyecto del área **Coding**
(`/coding/proyectos/1/0`, **Dental Maya**) y cómo repetirlo con otros. Sigue el
mismo método que los proyectos de Web; aquí solo se anotan las diferencias.

- Sitio: `https://dental-maya.vercel.app` (app Flutter + Supabase, nombre interno «Savadent»).
- Repositorio: `https://github.com/WallsEloy/DentalMaya`.

---

## 1. Archivos

| Qué | Dónde |
| --- | --- |
| Página de proyecto Coding | `app/coding/proyectos/[profileId]/[projectId]/page.jsx` |
| Bloques compartidos con Diseño (texto e imágenes, iPhone) | `app/diseno/proyectos/[profileId]/[projectId]/bloques.jsx` |
| Estilos (los mismos de Diseño) | `app/diseno/proyectos/[profileId]/[projectId]/page.module.css` |
| Hero del área Coding (código que se escribe solo) | `components/HeroCodigo.jsx` con `variante="software"` |
| Muestrario y tarjetas | `app/diseno/WebShowcase.jsx` (`variant="coding"`) |
| Portada en carrusel | `app/diseno/PortadaCarrusel.jsx` + `CARRUSELES_CODING` en `WebShowcase.jsx` |
| Imágenes | `public/Coding/DentalMaya/` |
| Fila de la tarjeta | Supabase → `portfolio_projects` de la colección con `metadata.contentType = "coding"` |

La configuración de cada proyecto vive en el objeto `PROYECTOS` de
`app/coding/proyectos/[profileId]/[projectId]/page.jsx`, con la clave
`"perfil/proyecto"` (Dental Maya = `"1/0"`). Si un proyecto no está en
`PROYECTOS`, la página usa el diseño genérico anterior.

## 2. Estructura de `PROYECTOS["1/0"]`

```js
{
  hero: {
    title, titleLogo,        // el logotipo va como título (<h1> con alt = title)
    category, description,
    meta: [[etiqueta, valor], ...],
    background, ink, accent, // fondo de toda la página, texto del hero y acentos
  },
  rows: [ /* bloques en orden */ ],
}
```

Bloques (`rows`), igual que en Web:

- `{ story: { eyebrow, title, body: [...] } }` — texto; `**negritas**` permitidas.
- `{ items: [dm("captura", "alt")] }` — fila de imágenes a todo el ancho.
- `{ compact: true, columns: 4, items: [dmMovil(...)] }` — fila de iPhones.

Helpers:

```js
const dm = (name, alt, width = 1800, height = 1125) =>
  ({ image: `/Coding/DentalMaya/${name}.webp`, alt, width, height });
const dmMovil = (name, alt) =>
  ({ image: `/Coding/DentalMaya/movil-${name}-iphone.webp`, alt, width: 720, height: 1558, device: "iphone" });
```

## 3. Orden actual de la página

1. **Hero:** logo sin contorno + «Software · Gestión odontológica» + datos
   (Flutter · Supabase, plataformas, desarrollador). Fondo `#0f2230`.
2. **Acceso:** `login`.
3. **Panel de la doctora:** `carolina`, luego `carolina-2` + `carolina-3`.
4. **Pacientes:** `patients` y la ficha `paciente-maria`.
5. **Odontograma:** `odontograma-maria`.
6. **Versión móvil:** 4 iPhones — `login`, `carolina`, `carolina-2`, `clinical-dashboard`.

## 4. Capturas

Sistema con sesión: se entra con el **modo demo** del login (botón
«Dra. Carolina Vega Maya»). Sin sesión, cualquier ruta (`#/patients`…) manda
al login. Es una app Flutter: no hay DOM útil, se navega con coordenadas y con
`location.hash`.

| Captura | Cómo se obtuvo |
| --- | --- |
| Escritorio | Playwright `channel: "msedge"`, `1440×900`, `deviceScaleFactor: 1.5` |
| Login → demo | clic en (661, 679) a 1440×900 |
| Secciones | `location.hash = "#/patients"`, `#/appointments`, `#/clinical-dashboard`, `#/reports`… |
| Ficha de paciente | en `#/patients`, `getByText("María López").click()` |
| Odontograma | en la ficha, panel derecho «Odontograma» (≈ 1313, 284 a 1440×900) |
| Celular | `devices["iPhone 13"]` con `viewport 390×844` (19.5:9); demo en (137, 651) |

Rutas útiles (de `lib/core/routing/app_router.dart` del repo): `/home`,
`/patients`, `/appointments`, `/dentists`, `/services`, `/expenses`,
`/billing`, `/clinical-dashboard` (Mi día), `/reports`, `/reports/financial`,
`/inventory`, `/clinical-indicators`.

Optimización: WebP calidad 82; escritorio a 1800 px, celular a 720 px.
Capturas extra ya guardadas (sin usar todavía): `appointments`, `dentists`,
`services`, `expenses`, `billing`, `reports`, `reports-financial`,
`inventory`, `clinical-indicators` y sus versiones `movil-…-iphone`.

## 5. Logotipo sin contorno

`logo.svg` (del repo, `assets/logos/login.svg`) trae un contorno azul claro
(`#99d4f2`, 4 `<path>`). `logo-sin-contorno.svg` es la copia sin esas formas
y es la que usan el hero y la portada.

## 6. Tarjeta del muestrario (Coding)

- Las tarjetas de Coding miden **16:10** (`.previewCoding`), la proporción de
  las capturas de escritorio: no se recortan.
- La portada es un **carrusel de 4 imágenes** que se funden cada 3.2 s, solo en
  Coding: se define en `CARRUSELES_CODING["1/0"]` de `WebShowcase.jsx`
  (`portada-16x10`, `carolina`, `paciente-maria`, `odontograma-maria`).
- `portada-16x10.webp` es un montaje (laptop + iPhone + logo) a 1800×1125.
- En Supabase la fila (`position 0`) se llama «Dental Maya», tipo `SOFTWARE`.

## 7. Para otro proyecto de Coding

1. Capturar (sección 4) y optimizar en `public/Coding/<Proyecto>/`.
2. Agregar su clave a `PROYECTOS` con `hero` y `rows`.
3. Opcional: carrusel en `CARRUSELES_CODING`.
4. Actualizar la fila en Supabase (título, tipo, portada) con respaldo previo.
5. Verificar en escritorio y celular.

## Servidor local

El repo está en OneDrive: `.next` es una junction fuera de OneDrive y el
servidor se arranca con `NODE_PATH` (ver la memoria del proyecto):
`NODE_PATH="$(cygpath -w "$PWD/node_modules")" npx next dev --hostname 0.0.0.0 -p 3001`

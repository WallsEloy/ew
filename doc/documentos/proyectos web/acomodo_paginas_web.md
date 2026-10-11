# Acomodo de páginas de proyectos web

[← Contexto de proyectos web](./claude.md) · [Mapa de documentación](../claude.md)

Método para construir la página de un proyecto del área **Web** a partir del
sitio publicado y su repositorio. Referencia: **Order Express**
(`/diseno/proyectos/2/3`), construido desde
`https://github.com/WallsEloy/Ecommer_OEX` y `https://ecommer-oex.vercel.app`.

---

## 1. Dónde vive cada cosa

| Qué | Dónde |
| --- | --- |
| Página de proyecto (Branding y Web) | `app/diseno/proyectos/[profileId]/[projectId]/page.jsx` |
| Estilos de la página | `app/diseno/proyectos/[profileId]/[projectId]/page.module.css` |
| Fila de la tarjeta en el muestrario | Supabase → `portfolio_projects` (colección con `metadata.legacyId = 2`) |
| Imágenes y videos del proyecto | `public/Web/<Proyecto>/` y `public/Web/<Proyecto>/video/` |
| Originales pesados (no se suben a git) | `originales/Web/<Proyecto>/` |

La clave de cada proyecto es `"perfil/proyecto"`: Web es el perfil **2** y el
número es la `position` de la fila en Supabase (Order Express = `"2/3"`).

## 2. Reunir el material

1. **Repositorio:** clonar en una carpeta temporal (fuera del proyecto) y leer
   `README`, `CLAUDE.md`/`AGENTS.md`, `package.json` y `app/`. De ahí salen el
   giro del proyecto, el stack (para el dato «Tecnología»), las secciones reales,
   los colores (variables CSS) y el **logotipo** (`public/...logo.svg`).
2. **Sitio publicado:** capturar con Playwright (`channel: "msedge"`):
   - **Escritorio:** `viewport 1440×900`, `deviceScaleFactor: 1.5`, una captura
     por pantalla clave (inicio, catálogo, ficha, carrito, cada sección del panel).
   - **Celular:** `devices["iPhone 13"]` con `viewport: { width: 390, height: 844 }`
     → la captura ya sale en **19.5:9** (la proporción de la pantalla del iPhone).
     No usar el viewport por defecto de iPhone 13 (390×664): queda casi 9:16 y al
     meterla en el teléfono se recortan los lados.
   - **Video de recorrido:** `recordVideo` a 1280×800 y un scroll lento por la
     página de inicio.
3. Si el panel no está adaptado a celular, **no** usar capturas suyas en móvil.

## 3. Optimizar

| Material | Tratamiento |
| --- | --- |
| Capturas de escritorio | WebP calidad 80, 1800 px de ancho |
| Capturas de celular | WebP calidad 80, 720 px de ancho (720×1558) |
| Captura de página completa | WebP calidad 78, 1440 px de ancho |
| Video | H.264 `crf 26`, 1280 px, 30 fps, sin audio, `+faststart`; póster WebP del segundo 1.5 |

Order Express quedó en ~2 MB (16 imágenes + 1 video de 12 s).

**Caché de imágenes:** `next/image` guarda versiones optimizadas por URL. Si se
reemplaza una imagen con el **mismo nombre**, se sigue viendo la vieja. Al
rehacer capturas, cambiar el nombre (p. ej. `…-iphone.webp`).

## 4. Configurar la página (`page.jsx`)

Todo se agrega con la clave del proyecto (`"2/3"`) en estos objetos:

### Hero — `HERO_MEDIA` y `PROJECT_STORY[...].hero`

- `PROJECT_STORY["2/3"].hero`: `title`, `category`, `description` y `meta`
  (lista de `[etiqueta, valor]`: Disciplina, Tecnología, Año, Diseñador).
- **Logotipo como título:** `hero.titleLogo: "/Web/<Proyecto>/logo.svg"`. El
  `<h1>` muestra el logo y conserva el `title` como texto alternativo.
- `HERO_MEDIA["2/3"]`: fondo y colores del hero.
  - Logo con colores oscuros → `heroBackground` claro (Order Express: `#f8f9fb`),
    `ink` = color principal del logo y `storyInk` = color de acento.
  - Con fondo claro el navbar recibe sola su franja oscura (`withNavBand`).
  - `image: null` cuando el logo ya va en el título (lado derecho vacío).

### Filas — `PROJECT_FEATURES["2/3"]`

Lista ordenada de bloques. Cada bloque es:

- **Texto:** `{ story: { eyebrow, title, body: [...] } }` — `**negritas**` permitidas.
- **Fila de imágenes:** `{ items: [...] }` — el ancho de cada imagen se reparte
  según su proporción (`width/height`).
- **Fila compacta:** `{ compact: true, columns: 4, items: [...] }` — columnas
  iguales (en móvil pasan a 2).

Helpers por proyecto (definirlos junto a los demás):

```js
const oex = (name, alt, width = 1800, height = 1125) =>
  ({ image: `/Web/OrderExpress/${name}.webp`, alt, width, height });
const oexMovil = (name, alt) =>
  ({ image: `/Web/OrderExpress/${name}-iphone.webp`, alt, width: 720, height: 1558, device: "iphone" });
```

Video: `{ video: ".../video/x.mp4", poster: ".../video/x-poster.webp", alt, width, height }`
— se reproduce solo, en silencio y en bucle, sin controles.

### Orden sugerido de secciones (proyecto web)

1. **El proyecto** (`intro`): qué se construyó y para qué.
2. **Producto principal** (tienda, sitio…): video de recorrido + pantallas clave.
3. **Experiencia móvil**: fila de iPhones.
4. **Panel / sistema** detrás: pantalla grande + pares de pantallas.
5. **Funciones extra** (canales, integraciones).
6. **El resultado** (`closing`) con `credit`.

En proyectos Web no se muestran la paleta de color ni las tipografías
(`isWebProject` las oculta).

## 5. Capturas de celular dentro de un iPhone

Cualquier imagen con `device: "iphone"` se dibuja dentro de un teléfono hecho
con CSS (sin imágenes extra):

- **Pantalla:** `aspect-ratio: 9 / 19.5` (formato 19.5:9), esquinas redondeadas,
  marco negro con borde metálico y sombra (`.phone`, `.phoneScreen`).
- **Barra de estado:** franja blanca arriba (`padding-top: 8%`) donde se apoya la
  **isla dinámica** (`.phoneIsland`) sin tapar el contenido.
- La captura se ajusta con `object-fit: cover` desde arriba.
- **Acomodo:** escritorio → los teléfonos en fila (`compact`, `columns: 4`);
  celular → **uno por fila**, centrado, al 78 % del ancho (máx. 320 px)
  (`.featureRowPhones`, se activa solo si la fila tiene un `device: "iphone"`).

## 6. Supabase (tarjeta del muestrario)

Actualizar la fila del proyecto en `portfolio_projects` (guardar antes un
respaldo JSON en la carpeta temporal):

- `title`: nombre del proyecto.
- `caption`: frase corta con hashtags.
- `cover_path`: portada de la tarjeta (p. ej. `/Web/<Proyecto>/tienda-inicio.webp`).
- `metadata.web.type`: etiqueta de la tarjeta (`E-COMMERCE`, `UI / UX`…);
  `metadata.web.author`; `metadata.web.video: true` si tiene video.

El cambio en Supabase se ve en el sitio publicado en cuanto se refresca la caché
(máx. 5 min), pero las imágenes de `public/` solo existen ahí **después** del
commit y despliegue: publicar el código pronto.

## 7. Verificación

1. La página responde 200 y **todas** las rutas de `/Web/<Proyecto>/…` dan 200.
2. Capturas de escritorio (1440×900) y celular (iPhone 13) recorriendo la página.
3. La tarjeta aparece en `/diseno?vista=web` con su título y portada.
4. Medir la pantalla del iPhone: ancho/alto = `0.4615` (19.5:9).

## Proyectos construidos con este método

| Clave | Proyecto | Repositorio | Notas |
| --- | --- | --- | --- |
| `2/3` | Order Express | `WallsEloy/Ecommer_OEX` | Logo oscuro → hero claro `#f8f9fb`; tienda + panel |
| `2/0` | VIBRALTOS Fest | `WallsEloy/vibraltos` | Logo sticker tornasol (`public/assets/hero/logo-vibraltos.webp`) sobre morado noche `#17102a`; capturas por sección con `#id`; video del hero animado (GSAP) recortado a 28 s |

Sitios de una sola página con anclas (`#lineup`, `#faq`…): capturar cada sección
haciendo scroll a su `id` y esperar ~2.5 s para que terminen sus animaciones.

## Pendientes conocidos (Order Express)

- Confirmar el giro: el logo dice «Paquetería y Mensajería», los textos lo
  describen como tienda de tecnología.
- Las pantallas del panel salen vacías (sin datos de prueba en el sitio).

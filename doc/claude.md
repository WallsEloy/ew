# 🤖 Instrucciones para Asistentes de IA (claude.md)

Este documento sirve como guía de contexto, estilo y reglas de desarrollo para **Claude**, **Antigravity** o cualquier otro agente de IA que colabore en el desarrollo de este repositorio.

> [!NOTE]
> Este documento cubre específicamente las reglas de codificación y diseño de IA. Para una vista de toda la arquitectura y guías del sistema, consulta el **[Índice General de Documentación (indice.md)](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/indice.md)**.

---

## 🎯 Contexto del Proyecto

*   **Nombre del Proyecto**: EW Portfolio Studio / Instagram 2026 Enhanced.
*   **Propósito**: Un portal web de alto impacto visual y premium para un estudio de portafolios de diseño, fotografía y eventos exclusivos.
*   **Enfoque de Diseño**: Estética oscura (dark mode por defecto), glassmorphism, gradientes suaves y micro-animaciones dinámicas que cautiven al usuario final.

---

## 🛠️ Stack Tecnológico y Reglas

Al generar código o proponer cambios, asegúrate de respetar las siguientes tecnologías y dependencias instaladas en [package.json](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/package.json):

*   **Framework**: Next.js 14+ (App Router). Todo el enrutamiento visual se maneja dentro de la carpeta [app/](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/app).
*   **Estilos (CSS)**: Tailwind CSS v4 y PostCSS.
*   **Animaciones**: Framer Motion para transiciones fluidas de componentes e interactividad física.
*   **Lenguaje**: TypeScript/JavaScript.

---

## 🎨 Guía de Estilo Visual (Aesthetics)

> [!IMPORTANT]
> **La excelencia visual es prioritaria**. Evita interfaces genéricas, bordes planos sin estilo o combinaciones de colores por defecto (como rojo puro, azul primario).
> *   Usa paletas de color curadas (por ejemplo, colores HSL oscuros, tonos fucsias, morados, dorados apagados y acentos neón).
> *   Utiliza fuentes premium como *Inter*, *Outfit* o *Roboto* integradas a través de Next.js Google Fonts.
> *   Implementa sutiles animaciones al hacer hover sobre botones e imágenes para dar sensación de interactividad.

---

## ⚙️ Reglas de Desarrollo para la IA

### 1. Modificación de Archivos y Componentes
- **Integridad de Comentarios**: Mantén los comentarios, JSDocs o explicaciones existentes si no están directamente relacionados con tu refactorización.
- **Interactividad**: Al crear botones, inputs o menús, siempre incluye estados de carga (`loading`), deshabilitados (`disabled`), y micro-interacciones.

### 2. Estructura de Rutas
- Todas las páginas públicas se encuentran bajo `app/` (ej. [app/page.jsx](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/app/page.jsx)).
- Los componentes reutilizables deben residir en [components/](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/components) y estar categorizados por subcarpetas (ej. `components/ui` para botones, modales genéricos, o `components/auth` para login/registro).
- Los endpoints de backend se manejan exclusivamente en `app/api/` usando la sintaxis moderna de Next.js Route Handlers (`export async function POST/GET(request)...`).

### 3. Manejo de Placeholders
- **No uses placeholders genéricos** para imágenes de demostración. Utiliza recursos reales, SVGs interactivos estilizados o imágenes generadas que se ajusten a la temática del portafolio.

---

## 📁 Estructura del Código a Seguir

```
EW/
├── app/                  # Rutas principales de Next.js
│   ├── api/              # Handlers de la API (Auth, Stripe checkout)
│   ├── globals.css       # Configuración global de Tailwind
│   └── layout.jsx        # Layout principal de la aplicación
├── components/           # Componentes de React (UI y Secciones)
│   ├── HomeCarousel.jsx  # Carrusel dinámico de la página de inicio
│   └── Navbar.jsx        # Navegación premium
├── doc/                  # Documentación del proyecto
│   ├── cloud.md          # Arquitectura en la nube y variables .env
│   └── claude.md         # Esta guía de reglas de IA
├── lib/                  # Utilidades y datos estáticos
└── public/               # Recursos estáticos (imágenes y logos)
```

---

## 🗺️ Mapa del Home — cómo se llama cada parte

Nomenclatura acordada para pedir cambios sin ambigüedad. **Basta con decir el
nombre en negrita**: «sube el título de la Vitrina», «el Desfile va muy rápido»,
«en la Placa cambia la fila de Formato».

El orden visual cambia entre escritorio y móvil, así que la tabla va en orden de
lectura de escritorio (en móvil el Carrusel abre la página y la Vitrina baja al
segundo puesto; lo hace `order: -1` en `VideoModulo.module.css`).

| # | Nombre | Qué es | Archivo | Se edita en |
| :-: | --- | --- | --- | --- |
| 1 | **Vitrina** | Vídeo a sangre en bucle, con sonido y onda de audio. En escritorio abre la página | `components/VideoModulo.jsx` | Dashboard → Home → Vídeos |
| 2 | **Carrusel** | El carrusel de siempre, controlado por scroll | `components/HomeCarousel.jsx` | Dashboard → Home → Carrusel |
| 3 | **Proceso** | Vídeo que se recorre con el scroll mientras pasan los capítulos | `components/ProcesoScroll.jsx` | Dashboard → Home → Vídeos |
| 4 | **Desfile** | Tira infinita de logotipos en blanco sobre negro | `components/LogosCarrusel.jsx` | `data/logosCarrusel.js` |
| 5 | **Grafos** | «Área dos»: nodos animados y su columna de texto | `components/VisualGraphs.jsx` | Dashboard → Home → Área dos |

### Partes de la **Vitrina**

| Nombre | Qué es |
| --- | --- |
| **Fondo** | El vídeo. Se pide sólo al acercarse; con `saveData` o 2g no se pide y queda el póster |
| **Bloque de texto** | Antetítulo (mono, oro) + titular + párrafo, a la izquierda |
| **Placa** | La ficha de pares etiqueta/valor del pie. Mismo lenguaje que la ficha técnica del reverso de las tarjetas de Galería |
| **Controles** | Botones «Silenciar» y «Pausar», arriba a la derecha. El de sonido se enciende mientras está mudo |
| **Onda** | El trazo bajo el botón de sonido. Dibuja el audio real por Web Audio: en silencio queda plana |

### Partes del **Carrusel**

| Nombre | Qué es | Clase |
| --- | --- | --- |
| **Franja** | La imagen del slide antes del scroll. Su ancho sale de la altura de la ventana (`0,2085 × alto`) | `.imageAnchor` |
| **Revelado** | Modo de las imágenes **horizontales**: la franja se abre hasta ocupar la pantalla. Se activa solo, midiendo la proporción de la imagen al cargarla | `.imageAnchorRevelado` |
| **Enfoque** | Qué franja de la imagen se ve mientras está cerrada (0–100 % horizontal). Se guarda **por ruta de imagen** en `site_settings/carrusel_foco`, no por slide: al guardar el carrusel las filas se borran y reinsertan, así que ni el id ni la posición sirven de referencia | `--foco` |
| **Velo** | Degradado que oscurece la derecha cuando la imagen se revela, para que se lea el texto | `.veloRevelado` |
| **Marco** | El rectángulo de borde blanco | `.whiteFrame` |
| **Copia inicial** | Título, logotipo y botón de la izquierda, antes del scroll | `.initialCopy` |
| **Copia derecha** | El bloque de texto de la derecha antes del scroll | `.initialRightCopy` |
| **Editorial** | El texto que aparece **después** del scroll, con su botón y sus puntos | `.editorialCopy` |
| **Puntos** | Los indicadores de slide | `.dots` |
| **Memojis** | Las cabezas flotantes con croma por canvas | `.floatingMemoji` |
| **Panel de mensaje** | El formulario que abre el memoji | `.messagePanel` |

### Partes del **Proceso**

| Nombre | Qué es |
| --- | --- |
| **Escenario** | La caja pegada (`sticky`) que mantiene el vídeo quieto mientras el scroll lo atraviesa |
| **Capítulos** | Los textos que van pasando. Cada uno ocupa una pantalla de scroll: añadir uno alarga la sección sola |
| **Botón** | La llamada a la acción, con su destino configurable |
| **Progreso** | Los tramos del pie que marcan por dónde va el recorrido |

### Reglas propias del Home

- **La Vitrina y el Proceso no cargan su vídeo hasta acercarse**, y con línea
  limitada no lo cargan nunca. Cualquier medio pesado que se añada al Home debe
  seguir esa norma (`lib/conexion.js`).
- **Los vídeos se comprimen al subirlos** (`lib/comprimirVideo.js`); el que se
  recorre con scroll necesita además fotogramas clave densos, o el recorrido se
  siente pegajoso.
- **Las imágenes se convierten a WebP y se acotan a 2000 px** en `/api/upload`.
- El Home pesa ~0,93 MB en carga en frío. Si un cambio lo sube mucho, medirlo
  antes de darlo por bueno.

---

> [!TIP]
> Cuando crees nuevas páginas en la carpeta [app/](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/app), no olvides configurar los metadatos de SEO (`export const metadata = { title: '...', description: '...' }`) para asegurar un buen posicionamiento orgánico.

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

> [!TIP]
> Cuando crees nuevas páginas en la carpeta [app/](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/app), no olvides configurar los metadatos de SEO (`export const metadata = { title: '...', description: '...' }`) para asegurar un buen posicionamiento orgánico.

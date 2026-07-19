# 📑 Sección 1: Introducción y Resumen General

Este documento proporciona una visión general del proyecto **EW Portfolio Studio / Instagram 2026 Enhanced**, incluyendo sus objetivos, el público al que va dirigido y las tecnologías clave.

---

## 🎯 Objetivos del Proyecto

El objetivo principal es construir una plataforma web premium de alto impacto estético para la visualización del portafolio del artista y diseñador **Eloy Walls** (EW). La aplicación combina:
1. **Galerías Interactivas**: Presentación dinámica de colecciones artísticas clasificadas por temáticas (Humans, Ice Cream, Sketch, Fotografía, Anacronismo).
2. **Estudio de Diseño**: Exposición de proyectos de diseño gráfico y desarrollo web.
3. **Tienda y Eventos (Shop & Events)**: Un espacio comercial para la adquisición de productos exclusivos y pases de eventos VIP.
4. **Área Privada (Dashboard)**: Acceso exclusivo para miembros registrados y suscriptores de pago.

---

## 🖥️ Stack Tecnológico

El proyecto está construido sobre las siguientes bases tecnológicas modernas:

*   **Frontend**: [Next.js](https://nextjs.org/) (versión 14+) con soporte para App Router, React Server Components (RSC) y optimización nativa.
*   **Estilos**: [Tailwind CSS](https://tailwindcss.com/) (v4.0) para un desarrollo ágil de interfaces y [Vanilla CSS Modules](https://nextjs.org/docs/app/building-your-application/styling/css-modules) para componentes de navegación especializados.
*   **Animaciones**: [Framer Motion](https://www.framer.com/motion/) para transiciones fluidas de páginas y micro-interacciones.
*   **Base de Datos y Autenticación**: [Supabase](https://supabase.com/) como Backend-as-a-Service (BaaS) usando PostgreSQL.
*   **Pagos y Suscripciones**: [Stripe](https://stripe.com/) para pasarelas de pago y gestión de membresías de clientes.

---

## 📂 Estructura General del Workspace

La estructura base de carpetas del proyecto se distribuye de la siguiente forma:

*   **[/app](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/app)**: Enrutamiento y vistas principales de la aplicación (incluyendo la API interna).
*   **[/components](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/components)**: Componentes modulares reutilizables de React (ej. carruseles, barras de navegación).
*   **[/doc](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc)**: Carpeta raíz de documentación.
    *   **[/doc/documentos](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos)**: Secciones desglosadas de la documentación.
*   **[/lib](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/lib)**: Funciones de utilidad y archivos de datos estáticos (como información de portafolios y diseños).
*   **[/public](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/public)**: Recursos gráficos estáticos (SVG, logos, e imágenes).

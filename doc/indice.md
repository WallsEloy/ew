# 🗂️ Índice General de Documentación (indice.md)

Bienvenido al índice central de documentación del proyecto **EW Portfolio Studio / Instagram 2026 Enhanced**. Utiliza este mapa para navegar rápidamente por los diferentes componentes de la arquitectura, guías de estilo, flujos y configuraciones.

---

## 📖 Guías Generales de la Raíz

*   **[Infraestructura en la Nube (cloud.md)](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/cloud.md)**: Vista general de la arquitectura cloud, base de datos serverless, pasarela de pago Stripe, y el listado consolidado de variables de entorno (.env) necesarias.
*   **[Reglas de IA y Estilo (claude.md)](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/claude.md)**: Normas estéticas premium, pautas de diseño (HSL, animaciones, etc.) y reglas de desarrollo para asistentes de inteligencia artificial.
*   **[Integración de Memojis (Memoji.md)](./Memoji.md)**: Conversión MOV→MP4, chroma key por canvas, transparencia, posicionamiento, interacción y verificación de nuevos Memojis animados.

---

## 📚 Secciones Detalladas (`doc/documentos/`)

| Sección | Documento | Descripción / Temas Clave |
| :---: | :--- | :--- |
| **01** | **[Introducción y Resumen](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/01_introduccion.md)** | Objetivos del proyecto, alcance del portafolio y stack de desarrollo base. |
| **02** | **[Arquitectura del Frontend](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/02_arquitectura_frontend.md)** | Enrutamiento del App Router, diseño del Navbar y lógica interactiva del carrusel. |
| **03** | **[API Backend](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/03_api_backend.md)** | Estructura de endpoints serverless `/api/checkout`, `/api/auth` y `/api/subscribe`. |
| **04** | **[Base de Datos](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/04_base_de_datos.md)** | Esquemas de Supabase PostgreSQL (diagrama ERD), RLS y cubos de almacenamiento. |
| **05** | **[Pagos con Stripe](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/05_pasarela_pagos.md)** | Flujo de checkout de Stripe, facturación recurrente VIP y controladores de webhook. |
| **06** | **[Despliegue y Mantenimiento](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/06_despliegue_cloud.md)** | Configuración en Vercel, CI/CD continuo de GitHub y scripts del package.json. |
| **07** | **[Guía de Desarrollo IA](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/07_guia_desarrollo_ia.md)** | Reglas de estilo (diseño rico, Framer Motion), directrices de componentes e interactividad. |
| **08** | **[Autenticación con Clerk](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/08_autenticacion_clerk.md)** | Autenticación segura de usuarios, control de sesiones, protección de rutas y webhooks. |

---

## 🗓️ Bitácora de sesiones (`doc/sesiones/`)

Las decisiones y cambios realizados en cada jornada se registran en el [índice de sesiones](./sesiones/README.md).

- [Sesión 2026-07-19](./sesiones/2026-07-19.md): carrusel controlado por scroll, Grafos visuales, navegación Coding, rediseño del Navbar (trazo continuo transparente), página de Contacto (tarjeta digital, stories y foto de perfil giratoria) y recuperación de la caché de Next.js.
- [Sesión 2026-07-25](./sesiones/2026-07-25.md): reverso de las tarjetas de Galería con ficha técnica de metadatos, holograma circular de referencia y ajuste sin scroll con topes de caracteres.
- [Sesión 2026-07-26](./sesiones/2026-07-26.md): logotipo de la galería elegible por pieza desde el dashboard (morado / dorado) en las dos caras de la tarjeta, hueco para las barras fijas del móvil y arreglo de la rueda del ratón en las panorámicas; y cabecera de Galería rehecha en escritorio con carrusel de portadas a sangre hasta lo alto de la página, bloque de presentación (logotipo, descripción y cuenta atrás) y bloque de perfil reservado al móvil.

## ✅ Tareas futuras

- [Protección de la Galería](./tareas/README.md): medidas pendientes de disuasión, marcas de agua y control de acceso para las imágenes.
- [Migración a Supabase](./tareas/MIGRACION_SUPABASE.md): inventario, arquitectura, esquema y fases para mover archivos y contenido estructurado.

## 🗄️ Respaldos SQL

- [Índice SQL de Supabase](./SQL/README.md): historial y copia de cada script SQL aplicado al proyecto.

---

> [!TIP]
> Si eres una IA colaborando en este proyecto, te recomendamos revisar primero la **[Sección 7 (Guía de Desarrollo IA)](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/07_guia_desarrollo_ia.md)** y las **[Reglas de IA y Estilo (claude.md)](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/claude.md)** antes de realizar cualquier cambio en el código.

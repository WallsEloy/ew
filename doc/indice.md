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

---

> [!TIP]
> Si eres una IA colaborando en este proyecto, te recomendamos revisar primero la **[Sección 7 (Guía de Desarrollo IA)](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/07_guia_desarrollo_ia.md)** y las **[Reglas de IA y Estilo (claude.md)](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/claude.md)** antes de realizar cualquier cambio en el código.

# 📸 EW Portfolio Studio / Instagram 2026 Enhanced

Bienvenido a la documentación principal de **EW Portfolio Studio / Instagram 2026 Enhanced**, una aplicación web premium desarrollada con **Next.js** y optimizada para ofrecer una experiencia visual interactiva e inmersiva.

> [!IMPORTANT]
> **¿Buscas algo específico?** Consulta primero el **[Índice General de Documentación (indice.md)](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/indice.md)** para localizar rápidamente cualquier sección o guía técnica del proyecto.

---

## 📂 Documentación del Proyecto

Hemos creado una carpeta dedicada a almacenar la documentación detallada del proyecto dividida por secciones y guías generales:

### 📖 Guías Generales
*   **[Infraestructura en la Nube (cloud.md)](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/cloud.md)**: Contiene la arquitectura del backend serverless, el flujo de datos con Stripe y Supabase, las variables de entorno necesarias y los pasos detallados para realizar el despliegue en Vercel.
*   **[Reglas de IA y Estilo (claude.md)](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/claude.md)**: Establece las directrices de codificación, pautas de diseño visual premium, estructuras de componentes e instrucciones para Claude, Antigravity u otros agentes de desarrollo.

### 📚 Secciones Detalladas (`doc/documentos/`)
*   **[Sección 1: Introducción y Resumen General](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/01_introduccion.md)**: Visión general, objetivos del proyecto y stack.
*   **[Sección 2: Arquitectura del Frontend](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/02_arquitectura_frontend.md)**: Enrutamiento en App Router, Navbar y el componente HomeCarousel.
*   **[Sección 3: Endpoints de la API Backend](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/03_api_backend.md)**: Estructura de controladores y respuestas del servidor.
*   **[Sección 4: Configuración de la Base de Datos](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/04_base_de_datos.md)**: Esquemas de tablas en Supabase PostgreSQL, RLS y almacenamiento de archivos.
*   **[Sección 5: Integración de Pagos con Stripe](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/05_pasarela_pagos.md)**: Flujos de compra única, suscripciones y control de webhooks.
*   **[Sección 6: Despliegue y Mantenimiento Cloud](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/06_despliegue_cloud.md)**: Configuración en Vercel, variables de entorno y comandos útiles.
*   **[Sección 7: Guía de Desarrollo para Asistentes de IA](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/07_guia_desarrollo_ia.md)**: Criterios visuales, interactividad, animaciones y buenas prácticas.
*   **[Sección 8: Autenticación con Clerk](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/documentos/08_autenticacion_clerk.md)**: Autenticación segura de usuarios, control de sesiones, protección de rutas y webhooks.

---

## 🛠️ Tecnologías Principales

*   **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components y API Routes)
*   **Diseño y Animación**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
*   **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
*   **Pagos**: [Stripe](https://stripe.com/) (Checkout & Webhooks)

---

## 🚀 Empezando en Desarrollo Local

### 1. Requisitos Previos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).

### 2. Configurar el Entorno

Copia el archivo de plantilla `.env.example` en un nuevo archivo llamado `.env.local` y configura tus credenciales personales:

```bash
cp .env.example .env.local
```

> [!NOTE]
> Puedes consultar el detalle de cada variable en el documento de **[Configuración de Nube](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/cloud.md#%F0%9F%94%85-variables-de-entorno-env)**.

### 3. Instalar Dependencias

Instala los módulos necesarios del proyecto:

```bash
npm install
```

### 4. Ejecutar el Servidor de Desarrollo

Inicia el entorno local de Next.js:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación ejecutándose.

---

## 📦 Construcción para Producción

Para construir y validar el bundle optimizado para despliegue:

```bash
npm run build
```

Para arrancar el servidor en modo producción local:

```bash
npm run start
```

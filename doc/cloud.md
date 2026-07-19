# ☁️ Configuración de la Infraestructura en la Nube (Cloud)

Este documento detalla la arquitectura de infraestructura en la nube, servicios de backend, integraciones de terceros y la configuración de despliegue para el proyecto **EW Portfolio Studio / Instagram 2026 Enhanced**.

> [!NOTE]
> Este documento cubre específicamente los detalles de la infraestructura cloud. Para explorar otras secciones, consulta el **[Índice General de Documentación (indice.md)](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/indice.md)**.

---

## 🏛️ Arquitectura de la Nube

El proyecto utiliza una arquitectura moderna Jamstack / Serverless aprovechando las capacidades del framework Next.js. El flujo de datos principal involucra la comunicación entre el frontend, las API routes locales (desplegadas en Serverless Functions) y proveedores de servicios externos.

```mermaid
graph TD
    Client[📱 Navegador del Cliente] <-->|HTTPS / React Components| Vercel[⚡ Vercel - Frontend & SSR]
    
    subgraph Serverless Backend (Next.js API)
        Vercel <-->|API Routes / Servidor| API_Auth[🔒 API Auth - /api/auth]
        Vercel <-->|API Routes / Servidor| API_Checkout[💳 API Checkout - /api/checkout]
        Vercel <-->|API Routes / Servidor| API_Subscribe[⭐ API Subscribe - /api/subscribe]
        Vercel <-->|API Routes / Servidor| API_Webhook[⚡ API Webhook - /api/webhook]
    end

    subgraph Servicios en la Nube (Cloud Providers)
        API_Auth <-->|Autenticación y Datos| Supabase[(🗄️ Supabase - Postgres DB & Auth)]
        API_Checkout <-->|Crear Sesión| Stripe[💳 Stripe API]
        API_Subscribe <-->|Gestionar Suscripciones| Stripe
        Stripe -->|Notificaciones Webhook| API_Webhook
        Vercel <-->|Carga de Imágenes/Medios| Storage[📁 Supabase Storage / AWS S3]
    end
```

---

## 🛠️ Servicios Utilizados

### 1. Despliegue y Hosting (Vercel)
- **Vercel** es la plataforma seleccionada para hospedar la aplicación frontend Next.js debido a su integración nativa, soporte de Server Actions, optimización de imágenes dinámica y despliegue continuo (CI/CD) conectado a GitHub.
- **Edge Runtime / Serverless Functions**: Se utilizan para ejecutar la lógica de endpoints de API (como [checkout](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/app/api/checkout/route.ts) y autenticación) con baja latencia y autoescalabilidad.

### 2. Base de Datos & Autenticación (Supabase)
- **Base de Datos**: Base de datos relacional administrada (PostgreSQL) alojada en Supabase para almacenar la información de los usuarios registrados, estado de suscripciones de Stripe, metadatos de las galerías e historial de compras.
- **Autenticación (Supabase Auth)**: Maneja los registros e inicios de sesión de manera segura, con soporte para contraseñas tradicionales, enlaces mágicos (magic links) o proveedores OAuth (Google, Instagram, etc.).
- **Almacenamiento de Medios (Supabase Storage)**: Usado para almacenar y distribuir eficientemente las imágenes pesadas del portafolio, carruseles y recursos de eventos mediante una Red de Distribución de Contenido (CDN).

### 3. Pasarela de Pagos (Stripe)
- **Stripe Checkout**: Redirección a un portal de pago seguro para adquirir el pase VIP de eventos o productos de la tienda digital.
- **Stripe Webhooks**: Escucha eventos críticos en segundo plano como `checkout.session.completed` o `customer.subscription.deleted` para actualizar el estado del usuario en nuestra base de datos en tiempo real de forma asíncrona.

---

## 🔑 Variables de Entorno (.env)

Para que el entorno local y de producción interactúen correctamente con los servicios cloud, es necesario configurar las siguientes variables de entorno. 

> [!IMPORTANT]
> Nunca expongas claves secretas (como `STRIPE_SECRET_KEY` o credenciales de acceso directo a la base de datos) en el frontend. Las variables accesibles en el navegador deben llevar el prefijo `NEXT_PUBLIC_`.

### Base de Datos y Autenticación (Supabase)

| Variable | Tipo | Descripción | Ejemplo / Valor de Prueba |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Público | URL del endpoint de tu proyecto Supabase | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Público | Clave pública segura para operaciones cliente | `eyJhbGciOiJIUzI1NiIsIn...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Privado | Clave con privilegios de admin para omitir RLS (solo servidor) | `eyJhbGciOiJIUzI1NiIsIn...` |
| `DATABASE_URL` | Privado | Cadena de conexión directa a PostgreSQL (Prisma/Direct) | `postgresql://postgres:pass@db...` |

### Pasarela de Pagos (Stripe)

| Variable | Tipo | Descripción | Ejemplo / Valor de Prueba |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Público | Clave pública de Stripe para inicializar Stripe SDK en cliente | `pk_test_51P...` |
| `STRIPE_SECRET_KEY` | Privado | Clave secreta para interactuar con la API en el backend | `sk_test_51P...` |
| `STRIPE_WEBHOOK_SECRET` | Privado | Firma de verificación para comprobar la autenticidad del webhook | `whsec_...` |

### Configuración de la Aplicación

| Variable | Tipo | Descripción | Ejemplo / Valor de Prueba |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Público | URL base del sitio (esencial para redirecciones de Stripe y Auth) | `http://localhost:3000` (Local) / `https://midominio.com` (Prod) |
| `NEXTAUTH_SECRET` | Privado | Clave utilizada para encriptar cookies de sesión (si se usa NextAuth) | `un_hash_aleatorio_seguro_32_caracteres` |

---

## 🚀 Pasos para Despliegue

### A. Preparación Local
1. Copia el archivo de variables de entorno de ejemplo:
   ```bash
   cp .env.example .env.local
   ```
2. Rellena las credenciales con tus llaves en modo de prueba (Sandbox).

### B. Configuración de Stripe Webhooks en Desarrollo
Para probar los flujos de compra o suscripciones localmente sin desplegar en la nube, puedes redirigir eventos usando Stripe CLI:
1. Inicia sesión en Stripe:
   ```bash
   stripe login
   ```
2. Redirige eventos a tu endpoint local:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
3. Copia el secreto de webhook que te provee la consola (`whsec_...`) y colócalo en tu `.env.local` como `STRIPE_WEBHOOK_SECRET`.

### C. Despliegue en Producción (Vercel)
1. Importa tu repositorio de GitHub en Vercel.
2. Agrega cada una de las variables de entorno listadas arriba en la pestaña de configuración del proyecto de Vercel.
3. Configura la build de producción en Vercel:
   - **Framework Preset**: `Next.js`
   - **Build Command**: `npm run build` o `next build`
   - **Output Directory**: `.next`
4. Haz clic en **Deploy**.
5. Configura tu Webhook de Stripe en el Dashboard de Stripe apuntando a la URL final de producción: `https://tu-dominio.com/api/webhook` habilitando los eventos necesarios (`checkout.session.completed`, etc.).

---

> [!TIP]
> **Monitoreo de Errores**: Se aconseja integrar herramientas como Sentry o Logtail en Vercel para capturar excepciones en tiempo de ejecución en las Serverless Functions, asegurando que los fallos silenciosos en la pasarela de pagos o llamadas a la base de datos se reporten de inmediato.

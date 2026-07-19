# 📑 Sección 6: Despliegue y Mantenimiento Cloud

Esta sección proporciona una guía de despliegue paso a paso para el entorno de producción en **Vercel** y la administración del proyecto a largo plazo.

---

## ⚡ Despliegue en Vercel (Paso a Paso)

Vercel está conectado directamente al repositorio de código en GitHub para automatizar el despliegue continuo.

### 1. Creación del Proyecto
1. Ve al panel de control de Vercel y haz clic en **Add New** > **Project**.
2. Selecciona el repositorio de GitHub de este proyecto.
3. Vercel detectará de manera automática que se trata de un proyecto de **Next.js**.

### 2. Configuración de Build y Directorios
- **Framework Preset**: `Next.js`
- **Root Directory**: `./` (directorio raíz)
- **Build Command**: `next build` (o `npm run build` si tienes tareas previas)
- **Output Directory**: `.next`

### 3. Carga de Variables de Entorno (Environment Variables)
Antes de presionar "Deploy", debes configurar los secretos en la sección de configuración del entorno de Vercel. Consulta la lista completa en **[cloud.md](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/cloud.md#%F0%9F%94%85-variables-de-entorno-env)**.

---

## 💻 Desarrollo Local vs. Producción

Es crucial separar los entornos para evitar contaminar datos reales o generar cobros accidentales.

| Elemento | Entorno de Desarrollo (Local) | Entorno de Producción |
| :--- | :--- | :--- |
| **URL Base** | `http://localhost:3000` | `https://tu-dominio-real.com` |
| **Modo Stripe** | Sandbox / Llaves de prueba (`pk_test_...`, `sk_test_...`) | Modo Live (`pk_live_...`, `sk_live_...`) |
| **Webhooks** | Redirigidos por consola mediante Stripe CLI | Endpoint de producción (`/api/webhook`) verificado con firma |
| **Base de Datos** | Instancia de pruebas local o base Supabase separada | Base de datos Supabase de Producción (RLS habilitado) |

---

## 🛠️ Comandos de Mantenimiento Útiles

Dentro del proyecto, puedes ejecutar los siguientes scripts descritos en [package.json](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/package.json):

### Iniciar Servidor de Desarrollo Local
```bash
npm run dev
```
Inicia Next.js en modo desarrollo con recarga en caliente (Hot Reload) en el puerto `3000`.

### Construcción del Proyecto
```bash
npm run build
```
Compila la aplicación Next.js y genera la versión optimizada y estática para producción. Ejecutar localmente este comando ayuda a capturar errores de TypeScript o rutas mal definidas antes de enviar los cambios a producción.

### Levantar Servidor Compilado
```bash
npm run start
```
Ejecuta el servidor Next.js localmente utilizando el bundle optimizado generado por la build de producción.

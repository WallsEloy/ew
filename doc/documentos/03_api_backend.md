# 📑 Sección 3: Endpoints de la API Backend

Esta sección detalla los endpoints de API disponibles en el backend serverless del proyecto, estructurados bajo la carpeta [app/api/](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/app/api).

---

## 🔌 Estructura de Endpoints

Los controladores de la API se definen utilizando los **Route Handlers** de Next.js. Las llamadas se ejecutan en entornos serverless sin estado (stateless).

```
app/api/
├── auth/
│   ├── login/          # POST: Autenticación de credenciales de usuario
│   ├── logout/         # POST: Destrucción de la sesión activa
│   └── register/       # POST: Creación de nuevos usuarios
├── checkout/
│   └── route.ts        # POST: Creación de sesión de Stripe Checkout
├── subscribe/
│   └── route.ts        # POST: Gestión de suscripciones y facturación
└── webhook/
    └── route.ts        # POST: Recepción de eventos firmados de Stripe
```

---

## 🛠️ Detalle de Endpoints

### 1. Checkout Sessions (`/api/checkout`)
- **Método**: `POST`
- **Descripción**: Inicia el flujo de cobro único para un artículo físico de la tienda o un ticket de evento.
- **Flujo de Ejecución**:
  1. Recibe el `priceId` o detalles de los items y el correo del usuario en el cuerpo (`body`).
  2. Inicializa la sesión de cobro con Stripe SDK:
     ```javascript
     const session = await stripe.checkout.sessions.create({ ... })
     ```
  3. Devuelve la URL de redirección a la página de pago segura de Stripe.
- **Ubicación del Código**: [app/api/checkout/route.ts](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/app/api/checkout/route.ts).

### 2. Suscripciones (`/api/subscribe`)
- **Método**: `POST`
- **Descripción**: Permite a los usuarios registrarse en la membresía exclusiva (acceso VIP) mediante pagos recurrentes.
- **Flujo de Ejecución**:
  1. Verifica que el usuario tenga una sesión de autenticación activa.
  2. Crea o recupera el `customerId` del usuario en Stripe.
  3. Crea una sesión de checkout de Stripe en modo `subscription`.
  4. Redirige al usuario al portal para completar los datos bancarios.

### 3. Autenticación (`/api/auth`)
- **Endpoints**: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`.
- **Implementación**: Actualmente preparados como estructura. Se conectarán con Supabase Auth (usando `@supabase/ssr` para guardar tokens de sesión en cookies seguras `httpOnly`) o con `NextAuth.js`.

### 4. Stripe Webhook Handler (`/api/webhook`)
- **Método**: `POST`
- **Descripción**: Endpoint crucial que Stripe llama de forma asíncrona para notificar cambios de estado en pagos y suscripciones.
- **Firma de Seguridad**: Verifica la firma enviada en los encabezados HTTP (`stripe-signature`) utilizando la clave secreta `STRIPE_WEBHOOK_SECRET` para prevenir suplantaciones de identidad.

---

## 🗃️ Formato de Respuestas Estándar

Todas las APIs responden utilizando `NextResponse` en formato JSON:

### Éxito (HTTP 200/201)
```json
{
  "message": "Operación exitosa",
  "data": { ... }
}
```

### Error de Servidor (HTTP 500)
```json
{
  "error": "Mensaje descriptivo del error"
}
```

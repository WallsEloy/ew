# MEMORY.md — Aprendizajes del proyecto (Portafolio EW)

> Complementa a `CLAUDE.md` (el *cómo* general). Aquí van los *qué* concretos de
> este proyecto: trampas, causas raíz y reglas para no repetir errores.

---

## Incidente: "se descompuso todo / la página perdió los estilos"

**Fecha:** 2026-07-18

### Qué pasó
Tras editar el código, la página se veía **sin estilos**: botones grises por
defecto, todo apilado en vertical, scroll horizontal. Parecía que una edición
había "roto el diseño".

### Causa raíz (NO era el código)
El servidor de desarrollo (`next dev`) llevaba mucho tiempo corriendo y su carpeta
`.next` quedó **desincronizada** con el disco. El HTML servido pedía archivos que
ya no existían:

```
404  /_next/static/css/app/layout.css   ← el CSS no cargó → sin estilos
404  /_next/static/chunks/main-app.js
404  /_next/static/chunks/app/page.js
404  /_next/static/chunks/app-pages-internals.js
```

Al no cargar `layout.css`, se pierde **todo** Tailwind y el layout se cae. Es un
problema típico de `next dev` en Windows tras muchos recompilados (Fast Refresh),
no un bug del `.jsx`/`.css`.

---

## Reglas para evitar / recuperar este error

### 1. Distinguir "error de código" de "error de entorno"
- **Error de código / compilación:** aparece en la terminal del `next dev` (texto
  rojo) o como *overlay* de error de Next sobre la página. Ahí sí hay que revisar
  el `.jsx`/`.css`.
- **Error de entorno (cache/dev server):** la página carga pero **sin estilos**, y
  en la consola del navegador hay **404 en `/_next/static/...`** (layout.css o
  chunks). Esto NO se arregla tocando el código.

> Si "todo se desacomodó" pero la consola muestra 404 de `_next/static`, es el dev
> server, no tu edición. No empieces a "arreglar" CSS que no está roto.

### 2. Cómo diagnosticar (30 segundos)
1. Abrir la consola del navegador (o revisar con Playwright) y buscar errores 404.
2. Confirmar si el archivo existe en disco, p. ej.:
   `ls .next/static/css/app/` — si no está `layout.css`, el build está stale.
3. `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/_next/static/css/app/layout.css`
   → un `404` confirma el problema.

### 3. Cómo recuperar (arreglo fiable)
Reinicio limpio del dev server:
1. Detener el proceso de `next dev` (en Windows: `Stop-Process -Id <PID> -Force`;
   el PID se ve con `netstat -ano | findstr :3000`).
2. Borrar la cache de build: `Remove-Item .next -Recurse -Force`
   (borrar `.next` es seguro: se regenera solo).
3. Relanzar: `npm run dev` y esperar a `✓ Ready` / `✓ Compiled`.
4. **Verificar con recarga real** del navegador y consola en 0 errores.

### 4. Prevención
- **Un solo `next dev` por proyecto/puerto.** No levantar varias instancias en el
  mismo puerto (3000): genera builds pisados y 404s.
- **Reiniciar el dev server** si el HMR se comporta raro, tras cambios grandes, o
  si lleva horas corriendo. No confiar indefinidamente en el hot reload.
- **En Windows, no borrar/mover archivos del proyecto mientras corre `next dev`**
  (bloqueos de archivo). Primero detener el server.
- **Verificar con recarga real (hard reload)**, no solo con hot reload: el HMR
  puede servir chunks viejos y hacer creer que un cambio "rompió" algo.
- Ante estado raro, **reinicio limpio (`rm .next` + restart) antes que diagnosticar
  a ciegas.** Es más rápido y descarta la causa más común.

---

## Otras trampas conocidas

## Nombres de la navegación móvil

Para evitar confundir los dos navegadores del formato móvil, usar siempre estos
nombres en solicitudes, documentación y cambios de código:

### 1. Navbar Superior Móvil

Es la barra oscura fija de la parte superior. Contiene:

- Menú hamburguesa a la izquierda.
- Isotipo EW en el centro.
- Círculo de inicio de sesión o registro a la derecha.

Se implementa principalmente en `components/Navbar.jsx`. Sus estilos móviles
están en `components/Navbar.module.css`, especialmente `.linksSection`,
`.mobileHamburger`, `.mobileCenterLogo` y `.mobileAuthCircle`.

### 2. Dock Inferior Móvil

Es el navegador flotante con forma de pastilla situado en la parte inferior de
la pantalla. Contiene los accesos a Diseño, Eventos, Galería, Coding y Contacto.

Se implementa en `components/Navbar.jsx` y sus estilos están en
`components/Navbar.module.css`, dentro de las reglas correspondientes al
navegador inferior móvil.

### Regla de comunicación

- Decir **Navbar Superior Móvil** para cambios en la barra de arriba.
- Decir **Dock Inferior Móvil** para cambios en la pastilla de abajo.
- Si se dice solamente “nav móvil”, confirmar cuál de los dos se quiere editar
  antes de realizar un cambio que pueda afectar a ambos.

### Tailwind v4: MIGRADO a la sintaxis v4 (2026-07-18)
**Estado actual:** `app/globals.css` ya usa `@import "tailwindcss";` + `@config
"../tailwind.config.js";`. El **Preflight y el tema por defecto están ACTIVOS** y
todas las utilidades estándar funcionan (`p-4`, `gap-4`, `grid-cols-2`, `text-sm`,
colores como `text-gray-400`, etc.).

**Historia (por qué se migró):** antes el archivo tenía las directivas v3
(`@tailwind base/components/utilities`). Con Tailwind v4 eso hacía que **no se
cargara el tema**, así que:
- Las utilidades numéricas/de escala (`pt-24`, `px-4`, `gap-4`, `text-sm`,
  `text-gray-400`…) **no se generaban** (resolvían a nada). Solo funcionaban los
  valores arbitrarios (`px-[6%]`, `bg-[#111]`, `text-[13px]`) y utilidades básicas.
- Sin Preflight: los `<button>` conservaban borde nativo `outset` (línea fina) y no
  había `box-sizing: border-box` global → `w-full` + padding desbordaba.

La migración arregló todo eso de raíz. Se verificó página por página con Playwright
(home, dashboard, galería, diseño) — sin regresiones; el navbar incluso mejoró
(los `px-5 py-1` que antes valían 0 ahora dan el padding que el código pedía).

**Reglas ahora:**
- Usar utilidades Tailwind normales con confianza (ya se generan).
- Si algo del layout heredado se ve raro, recordar que el sitio se diseñó ANTES de
  tener Preflight/tema; puede necesitar ajuste puntual.
- `app/contacto/page.jsx` ha sido implementado y restaurado exitosamente, resolviendo el error de compilación preexistente y habilitando la validación del build.

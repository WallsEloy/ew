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

### Tailwind v4 con directivas v3 (falta Preflight)
El proyecto tiene **Tailwind v4** instalado pero `app/globals.css` usa las
directivas viejas (`@tailwind base; @tailwind components; @tailwind utilities;`).
Con eso **no se aplica el Preflight** (reset base) y aparecen defaults del
navegador:
- Los `<button>` conservan borde nativo `outset` (se ve como línea fina/bisel).
- Falta `box-sizing: border-box` global → `w-full` + padding **desborda**
  (`content-box`: ancho = 100% + padding), empujando elementos fuera de pantalla.

**Reglas:**
- Para bugs de bordes o desbordes en este repo, sospechar primero del Preflight
  faltante.
- Arreglo puntual (bajo riesgo): resetear en el elemento — `border-none`,
  `box-border`, etc.
- Arreglo de raíz (mayor riesgo): migrar `globals.css` a `@import "tailwindcss";`.
  Reactiva Preflight en TODO el sitio (resetea también márgenes de títulos, listas,
  bordes) → **verificar página por página** antes de hacerlo, porque puede mover el
  layout hecho a mano.

# Reglas de trabajo — Portafolio EW

Estas reglas aplican a todo el repositorio.

## Next.js: servidor y caché de compilación

- Nunca borrar, mover, renombrar ni regenerar `.next` mientras exista un proceso
  `next dev` o `next start` activo para este proyecto.
- Antes de ejecutar `npm run build`, comprobar si el puerto local del proyecto
  está ocupado por Next.js. Si es necesario limpiar o reemplazar `.next`, detener
  primero ese proceso y confirmar que terminó.
- No ejecutar `next dev` y `next build` simultáneamente dentro del mismo directorio:
  ambos escriben en `.next` y pueden dejar el servidor apuntando a fragmentos que
  ya no existen (`Cannot find module './<chunk>.js'`).
- Después de regenerar `.next`, iniciar una sola instancia de `npm run dev`, esperar
  a `Ready` y verificar una ruta real con una respuesta HTTP 200 antes de dar la
  tarea por terminada.
- Si el sitio aparece sin estilos, desacomodado o devuelve un error 500 después de
  compilar, revisar primero la terminal y las solicitudes `/_next/`. No modificar
  JSX o CSS hasta descartar una caché desincronizada.
- En Windows, identificar el proceso por el puerto y validar que sea `node` antes
  de detenerlo. Al iniciar procesos en segundo plano, usar archivos diferentes para
  la salida estándar y la salida de error.

## Protección del trabajo existente

- Conservar los cambios del usuario y evitar modificaciones fuera de la tarea.
- Tratar `.next` como contenido generado y recuperable, pero manipularlo únicamente
  después de detener el servidor que lo utiliza.

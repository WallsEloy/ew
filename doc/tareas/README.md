# Tareas futuras

Este directorio reúne mejoras pendientes que todavía no deben considerarse
implementadas.

## Galería: protección y disuasión de capturas

**Estado:** Pendiente.

Una aplicación web no puede bloquear de forma fiable las capturas realizadas por
el sistema operativo. Cuando se retome esta tarea, implementar una estrategia de
protección por capas:

- Marca de agua dinámica y repetida sobre las imágenes.
- Incorporar usuario, fecha e identificador de sesión en la marca de agua.
- Servir previsualizaciones optimizadas en vez de los archivos originales.
- Proteger la galería mediante autenticación y enlaces temporales.
- Desactivar arrastre, menú contextual y descarga directa como disuasión.
- Configurar `Permissions-Policy: display-capture=()` para impedir capturas
  iniciadas por la propia página mediante `getDisplayMedia()`.

La marca de agua personalizada es la primera implementación recomendada.

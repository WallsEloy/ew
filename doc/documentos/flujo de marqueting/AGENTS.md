# Reglas del flujo de marketing

Estas reglas aplican a todos los archivos dentro de esta carpeta.

- Consultar `memoria.md` y `09_flujo_publicitario_react_flow.md` antes de cambiar
  la topología, el aspecto o el comportamiento del flujo.
- Actualizar ambos documentos cuando se agregue, elimine o reconecte un nodo.
- Conservar `ClientAdvertisingFlow` como frontera visual: no introducir llamadas
  directas a Meta, TikTok, Spotify, cámara, descargas ni bases de datos.
- Mantener los datos de los nodos serializables para facilitar la futura edición
  desde Dashboard.
- Las entradas deben permanecer visibles y ancladas a las cabeceras.
- Las salidas deben nacer del botón visual indicado por el diseño.
- Conservar las conexiones azules punteadas, animadas y angulares mientras el
  usuario no solicite un cambio.
- Respetar `prefers-reduced-motion` en toda animación nueva.
- Después de modificar el flujo, ejecutar `git diff --check`, `npx tsc --noEmit`
  y verificar la ruta canónica con HTTP 200.
- No ejecutar `next build` mientras el servidor de desarrollo esté activo.


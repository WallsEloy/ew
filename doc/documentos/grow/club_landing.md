# Landing del Club Privado de Inversionistas

- [← Contexto de Grow](./claude.md)
- [← Mapa de documentos especializados](../claude.md)

La landing está en `/grow/club` y se enlaza desde Grow → Proyectos.

Presenta la plataforma, todavía con nombre provisional (**Club EW**): un club privado que muestra empresas y administra participaciones privadas.

- **Es una demostración:** todos los datos son ficticios.
- **No es una bolsa ni una institución financiera,** ni ofrece acciones al público.

## Archivos

| Archivo | Rol |
| --- | --- |
| `data/club.js` | **Configuración**: textos, proyectos y su valuación ficticia de 12 meses, pasos, modelos, participaciones del usuario de ejemplo, evolución por periodo, dividendos, documentos, transmisiones, pilares, FAQ y opciones del formulario. |
| `components/club/ClubLanding.jsx` | Las 10 secciones: navegación, hero con dashboard flotante, proyectos y comparador, cómo funciona, modelos, dashboard de inversionista, transparencia (Nosotros), FAQ, registro y footer. También el modal de acceso y el de documentos. |
| `components/club/Graficas.jsx` | `Linea` (área interactiva con mouse, dedo y flechas del teclado), `Mini` (tendencia), `Dona`, y los formatos `pesos` y `pesosCorto` en MXN. |
| `components/club/FormularioClub.jsx` | Registro de interés con validación visual en vivo. **No envía datos.** |
| `components/club/club.module.css` | Tema oscuro `#080D18`, tarjetas azul oscuro y grafito, acento esmeralda `#10B981`. Ajustes para 1440, 1024, 768 y 390 px. |
| `app/grow/club/page.jsx` | Ruta y metadatos (Open Graph). |

Reutiliza de GoGo:
- `components/gogo/Icono.jsx`: se le agregaron íconos.
- `components/gogo/piezas.jsx`: `Contador` y `useRevelar`.
- `components/gogo/fuente.js`: la tipografía Manrope.

## Decisiones respecto al prompt original

El prompt pedía `index.html`, `styles.css` y `script.js` con Chart.js y Lucide. Se integró al sitio en Next.js, igual que GoGo:
- **Gráficas:** SVG propias.
- **Íconos:** en línea.
- **Dependencias:** ninguna nueva.

«Conocer proyecto» funciona así:
- **GoGo Food:** lleva a su landing (`/grow/proyectos/gogo`).
- **Proyectos sin página propia:** abre su evolución en el comparador.

## Coherencia de los datos ficticios

La valuación del portafolio de ejemplo se calcula así:

> acciones ÷ acciones totales × valuación actual del proyecto

- **Total actual:** $106,500, que es el último punto de `EVOLUCION.mensual`.
- **Si cambias proyectos o participaciones,** ajusta también `EVOLUCION` para que el último valor coincida.

## Reglas de contenido

- **Modelos:**
  - El Modelo A es el único inicial.
  - B y C se presentan como desarrollo futuro, no habilitado.
- **CNBV:** no sugerir respaldo, supervisión ni autorización. La sección Nosotros lo aclara.
- **FAQ:** sólo información general. No prometer rendimientos ni liquidez.
- **Formulario:** debe aclarar que no otorga membresía, acceso a una oferta ni derecho a invertir.

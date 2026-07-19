# Guía para integrar nuevos Memojis animados

Esta guía documenta el proceso utilizado para incorporar Memojis creados por Apple en el Home. El resultado final conserva movimiento fluido, fondo transparente, color sólido, interacción mediante clic y desaparición al comenzar el scroll.

## Problema de los archivos originales

Los Memojis exportados desde Apple suelen llegar como archivos `.MOV` con estas características:

- Códec HEVC/H.265 (`hvc1`).
- Resolución habitual de `640 × 480`.
- 60 fotogramas por segundo.
- Fondo negro incorporado en los píxeles.
- Sin canal alfa real; normalmente el formato detectado es `yuv420p`.

No conviene utilizar el MOV directamente porque Chrome/Windows puede no reproducir HEVC. WebM con transparencia tampoco es completamente confiable en Safari móvil y los WebP animados pueden dejar rastros al mezclar cuadros transparentes.

La solución utilizada en este proyecto es:

```text
MOV HEVC con fondo negro
        ↓
MP4 H.264 a 60 fps
        ↓
Video oculto reproducido por hardware
        ↓
Canvas que limpia y redibuja cada cuadro
        ↓
Chroma key del negro → transparencia real
```

## 1. Guardar el archivo original

Coloca el nuevo archivo en:

```text
public/perfil/NOMBRE_MEMOJI.MOV
```

Utiliza nombres sin espacios. Ejemplo:

```text
public/perfil/IMG_1400.MOV
```

## 2. Instalar FFmpeg temporalmente

Si `ffmpeg` no está instalado globalmente, se puede obtener una copia local sin añadirla a `package.json`:

```powershell
npm install --no-save --package-lock=false ffmpeg-static ffprobe-static
```

Obtener las rutas desde PowerShell:

```powershell
$ffmpegPath = node -p "require('ffmpeg-static')"
$ffprobePath = node -p "require('ffprobe-static').path"
```

## 3. Inspeccionar el MOV

```powershell
& $ffprobePath `
  -v error `
  -select_streams v:0 `
  -show_entries stream=codec_name,pix_fmt,width,height,r_frame_rate,duration,nb_frames `
  -of json `
  'public/perfil/IMG_1400.MOV'
```

Confirma principalmente:

- Que exista una pista de video.
- La velocidad de fotogramas original.
- La duración.
- Las dimensiones.

## 4. Convertir a MP4 compatible

Ejecuta:

```powershell
& $ffmpegPath `
  -y `
  -i 'public/perfil/IMG_1400.MOV' `
  -an `
  -vf "fps=60,scale=384:288:flags=lanczos,format=yuv420p" `
  -c:v libx264 `
  -preset slow `
  -crf 20 `
  -movflags +faststart `
  'public/perfil/IMG_1400-mobile.mp4'
```

### Significado de las opciones

| Opción | Función |
| --- | --- |
| `-an` | Elimina audio innecesario. |
| `fps=60` | Conserva la fluidez del Memoji original. |
| `scale=384:288` | Reduce trabajo gráfico manteniendo resolución suficiente para la interfaz. |
| `flags=lanczos` | Utiliza un escalado de buena calidad. |
| `format=yuv420p` | Asegura compatibilidad con Safari, Chrome y Android. |
| `libx264` | Genera H.264 decodificable por hardware. |
| `-crf 20` | Mantiene buena calidad con poco peso. |
| `+faststart` | Permite comenzar la reproducción antes de descargar todo el archivo. |

No elimines el fondo negro durante esta conversión. El canvas lo retirará en tiempo real sin acumular cuadros.

## 5. Utilizar `ChromaKeyMemoji`

El componente se encuentra dentro de:

```text
components/HomeCarousel.jsx
```

Uso básico:

```jsx
<ChromaKeyMemoji src="/perfil/IMG_1400-mobile.mp4" />
```

El componente realiza las siguientes tareas:

1. Reproduce un `<video>` oculto con `autoPlay`, `loop`, `muted` y `playsInline`.
2. Usa `requestVideoFrameCallback` cuando está disponible.
3. Limpia el canvas antes de cada cuadro con `clearRect`.
4. Dibuja el cuadro nuevo con `drawImage`.
5. Convierte el negro en transparencia modificando el canal alfa.
6. Utiliza `requestAnimationFrame` como respaldo.

La limpieza completa antes de cada cuadro evita el efecto de arrastre.

## 6. Ajustar el chroma key

La implementación actual utiliza:

```js
if (darkestEdge <= 6) {
  pixels[index + 3] = 0;
} else if (darkestEdge < 18) {
  pixels[index + 3] = Math.round(((darkestEdge - 6) / 12) * 255);
}
```

- Valores de `0–6`: completamente transparentes.
- Valores de `7–17`: borde suavizado.
- Valores desde `18`: completamente opacos.

No aumentes estos límites sin revisar el cabello, cejas, pupilas y lentes. Un umbral alto puede borrar detalles negros del rostro.

## 7. Añadir el Memoji como botón

Para que abra el panel conversacional existente:

```jsx
<motion.div
  className={`${styles.floatingMemoji} ${isScrollMode ? styles.memojiHidden : ""}`}
  style={{ opacity: isDesktop ? initialOpacity : 1 }}
>
  <button
    type="button"
    className={styles.memojiTrigger}
    onClick={() => {
      setIsMessageOpen(true);
      setMessageSent(false);
    }}
    aria-label="Abrir mensaje desde el Memoji"
    aria-expanded={isMessageOpen}
    aria-controls="memoji-message-panel"
  >
    <ChromaKeyMemoji src="/perfil/IMG_1400-mobile.mp4" />
  </button>
</motion.div>
```

Cada Memoji puede abrir el mismo panel. No es necesario duplicar el formulario.

## 8. Posicionamiento

Los estilos están en:

```text
components/HomeCarousel.module.css
```

Crea una clase modificadora si el nuevo Memoji necesita otra posición:

```css
.floatingMemojiThird {
  top: 30%;
  left: 50%;
  width: clamp(140px, 16vw, 250px);
  animation-delay: -3.2s;
}
```

Después añade sus valores móviles dentro del breakpoint existente:

```css
@media (max-width: 768px), (orientation: portrait) {
  .floatingMemojiThird {
    top: 40%;
    left: 50%;
    width: clamp(135px, 43vw, 195px);
  }
}
```

Usa un `animation-delay` distinto para que las cabezas no floten sincronizadas.

## 9. Desaparición con scroll

El Memoji debe permanecer fuera de `.track` y dentro de `.stickyScene`. Para que desaparezca junto con la portada inicial:

```jsx
style={{ opacity: isDesktop ? initialOpacity : 1 }}
```

Y para impedir clics cuando ya es invisible:

```jsx
className={`${styles.floatingMemoji} ${isScrollMode ? styles.memojiHidden : ""}`}
```

No coloques el Memoji dentro de cada `article.slide`, porque se movería horizontalmente con el carrusel y se duplicaría por diapositiva.

## 10. Reglas importantes

- No utilizar el MOV directamente en producción.
- No depender de WebM alfa para Safari móvil.
- No utilizar `mix-blend-mode: screen`; aclara el rostro y genera apariencia translúcida.
- No utilizar WebP animado si aparecen rastros o cuadros acumulados.
- No omitir `muted` y `playsInline`; iOS puede bloquear autoplay sin ellos.
- No usar `display: none` en el video fuente; algunos navegadores suspenden su decodificación.
- Mantener el video fuente a `1px`, transparente y fuera de interacción mediante `.memojiSource`.
- Mantener el canvas en `256 × 192` salvo que el Memoji vaya a mostrarse mucho más grande.
- Conservar `willReadFrequently: true` al obtener el contexto 2D.
- Cancelar `requestVideoFrameCallback` o `requestAnimationFrame` al desmontar el componente.

## 11. Verificación

Comprueba lo siguiente en escritorio y teléfono:

1. El MP4 responde con HTTP `200` y `video/mp4`.
2. `readyState` llega a `4`.
3. `paused` es `false`.
4. `currentTime` avanza.
5. El canvas contiene píxeles con alfa `0` y `255`.
6. El hash visual del canvas cambia entre dos momentos.
7. No aparece rectángulo negro.
8. No se observan rastros de cuadros anteriores.
9. El cabello y los lentes mantienen sus partes oscuras.
10. El clic abre el panel conversacional.
11. Al comenzar el scroll, desaparece y deja de recibir interacción.

## Archivos actuales de referencia

```text
public/perfil/IMG_1327.MOV
public/perfil/IMG_1327-mobile.mp4
public/perfil/IMG_1329.MOV
public/perfil/IMG_1329-mobile.mp4
components/HomeCarousel.jsx
components/HomeCarousel.module.css
```


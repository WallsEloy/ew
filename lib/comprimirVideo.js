/*
 * Compresión de vídeo al subir (SOLO servidor). Usa el binario de ffmpeg-static,
 * así que no hace falta tener ffmpeg instalado en la máquina.
 *
 * Objetivo: que un vídeo de fondo pese lo que debe pesar. Los originales del home
 * venían a ~2 Mbps para 10 s (2,5 MB), y en una línea pobre eso bloquea la
 * página entera.
 *
 * Decisiones de codificación y por qué:
 * - `scale=min(960,iw)`: se acota el ancho a 960 px. Estos vídeos se pintan como
 *   fondo recortado; más resolución no se ve, sólo se descarga.
 * - CRF 28 con libx264: calidad constante en vez de bitrate fijo. Estas escenas
 *   son casi negras y comprimen muy bien, así que el archivo baja mucho sin que
 *   se note.
 * - `+faststart`: mueve el índice al principio del archivo. Es lo que permite
 *   empezar a reproducir y a BUSCAR fotogramas antes de tener el archivo
 *   completo; sin eso, el módulo que se recorre con el scroll tendría que
 *   descargarlo todo antes de responder.
 * - `-map 0:a:0?`: el audio es opcional. Si el vídeo no trae pista, no falla.
 * - Metadatos fuera: no aportan nada y a veces pesan.
 */
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";

const ANCHO_MAX = 960;
const CRF = 28;
const AUDIO_KBPS = 96;
const LIMITE_MS = 150000; // por encima de esto, mejor devolver el original

function ejecutar(bin, args) {
  return new Promise((resolve, reject) => {
    const proceso = spawn(bin, args, { windowsHide: true });
    let error = "";
    const reloj = setTimeout(() => {
      proceso.kill("SIGKILL");
      reject(new Error("la compresión tardó demasiado"));
    }, LIMITE_MS);

    proceso.stderr.on("data", (d) => {
      error += d.toString();
      if (error.length > 8000) error = error.slice(-4000); // sólo la cola interesa
    });
    proceso.on("error", (err) => {
      clearTimeout(reloj);
      reject(err);
    });
    proceso.on("close", (codigo) => {
      clearTimeout(reloj);
      if (codigo === 0) resolve();
      else reject(new Error(`ffmpeg salió con código ${codigo}: ${error.slice(-400)}`));
    });
  });
}

/*
 * Devuelve { buffer, bytesAntes, bytesDespues } con el vídeo comprimido, o null
 * si no se pudo comprimir o si el resultado no mejora el original (pasa con
 * archivos ya optimizados: recomprimir sólo empeoraría la calidad).
 *
 * `paraRecorrer` es para el vídeo que se navega con el scroll: fuerza un
 * fotograma clave cada ~12 (medio segundo). Sin eso ffmpeg pone uno cada 250
 * fotogramas —uno para todo el clip— y buscar un instante obliga a decodificar
 * desde el principio: el recorrido se sentiría pegajoso. Cuesta algo de peso y
 * merece la pena.
 */
export async function comprimirVideo(bufferEntrada, { paraRecorrer = false } = {}) {
  if (!ffmpegPath) return null;

  const dir = await mkdtemp(path.join(tmpdir(), "ew-video-"));
  const entrada = path.join(dir, "entrada.bin");
  const salida = path.join(dir, "salida.mp4");

  try {
    await writeFile(entrada, bufferEntrada);
    await ejecutar(ffmpegPath, [
      "-y",
      "-i", entrada,
      "-map", "0:v:0",
      "-map", "0:a:0?",
      "-vf", `scale='min(${ANCHO_MAX},iw)':-2`,
      "-c:v", "libx264",
      "-crf", String(CRF),
      "-preset", "veryfast",
      "-profile:v", "main",
      "-pix_fmt", "yuv420p",
      ...(paraRecorrer
        ? ["-g", "12", "-keyint_min", "12", "-sc_threshold", "0"]
        : []),
      "-c:a", "aac",
      "-b:a", `${AUDIO_KBPS}k`,
      "-ac", "2",
      "-movflags", "+faststart",
      "-map_metadata", "-1",
      salida,
    ]);

    const buffer = await readFile(salida);
    if (buffer.length >= bufferEntrada.length) return null; // no mejora: se queda el original
    return {
      buffer,
      bytesAntes: bufferEntrada.length,
      bytesDespues: buffer.length,
    };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

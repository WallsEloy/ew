import CuentaAtras from "./CuentaAtras";
import styles from "./ProfilePresentacion.module.css";

/*
 * Bloque de presentación de la galería: logotipo, descripción y (si está
 * activada) una cuenta atrás. Es uno por galería, no por portada.
 *
 * En escritorio se pinta dentro del carrusel, sobre la imagen; en móvil, donde
 * no hay carrusel, encabeza el perfil. La misma caja sirve para los dos casos:
 * lo único que cambia es el sitio donde la coloca la página.
 */
export default function ProfilePresentacion({ presentacion, name = "" }) {
  const { logo, descripcion, contador } = presentacion || {};
  const cuentaActiva = Boolean(contador?.activo && contador?.hasta);

  // Sin nada que enseñar, no se ocupa espacio
  if (!logo && !descripcion && !cuentaActiva) return null;

  return (
    <div className={styles.presentacion}>
      {logo && (
        <img
          src={logo}
          alt={name ? `Logotipo de ${name}` : "Logotipo"}
          className={styles.logo}
        />
      )}

      {descripcion && <p className={styles.descripcion}>{descripcion}</p>}

      {cuentaActiva && (
        <CuentaAtras hasta={contador.hasta} etiqueta={contador.etiqueta} />
      )}
    </div>
  );
}

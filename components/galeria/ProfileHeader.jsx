import styles from "./ProfileHeader.module.css";

export default function ProfileHeader({ profile, ocultoEnEscritorio = false }) {
  // Asegurar valores por defecto en caso de que el profile no los tenga
  const stats = profile.stats || { posts: profile.posts?.length || 0, followers: "0", following: "0" };

  return (
    // En Galería la cabecera (avatar, logo, nombre, cifras y bio) sólo se ve en
    // móvil: en escritorio manda el carrusel de portadas. La clase que la oculta
    // vive dentro de la media query, así que el móvil no se entera. Diseño no
    // pasa la prop, así que ahí sigue viéndose siempre.
    <div
      className={`${styles.headerWrapper} ${
        ocultoEnEscritorio ? styles.headerSoloMovil : ""
      }`}
    >
      {/* Columna Izquierda: Avatar */}
      <div className={styles.avatarContainer}>
        <img src={profile.avatar} className={styles.avatarImage} alt={profile.name} />
      </div>

      {/* Columna Derecha: Nombre, Stats y Biografía */}
      <div className={styles.rightColumn}>
        
        {/* Logo (opcional) de nuevo ARRIBA del nombre */}
        {profile.logo && (
          <img src={profile.logo} alt="Logo" className={styles.profileLogo} />
        )}

        {/* 1. Nombre antes de los números */}
        <h2 className={styles.profileName}>{profile.name}</h2>

        {/* 2. Números (Stats) */}
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.posts}</span>
            <span className={styles.statLabel}>publicaciones</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.followers}</span>
            <span className={styles.statLabel}>seguidores</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.following}</span>
            <span className={styles.statLabel}>seguidos</span>
          </div>
        </div>

        {/* 3. Descripción (Biografía) a la derecha */}
        {profile.bio && (
          <div className={styles.bioText} style={{ whiteSpace: "pre-wrap" }}>
            {profile.bio}
          </div>
        )}
      </div>
    </div>
  );
}

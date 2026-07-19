"use client";
import { useState } from "react";

// Components de la versión Galería
import ProfileHeader from "../../components/galeria/ProfileHeader";
import Highlights from "../../components/galeria/Highlights";
import PostGrid from "../../components/galeria/PostGrid";
import FeedModal from "../../components/galeria/FeedModal";
// Data
import { profiles } from "../../lib/galeriaData";

// Estilos de la página principal
import styles from "./page.module.css";

export default function Home() {
  // Estado local para manejar el perfil activo, si el modal está abierto y en qué post empieza
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  // Perfil seleccionado actualmente
  const profile = profiles[current];

  return (
    <div className="md:pt-[120px]">
      {/* 1. SECCIÓN: Botones para cambiar entre perfiles (esto normalmente sería un menú lateral o búsqueda) */}
      <div className={styles.buttonsContainer}>
        {profiles.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setCurrent(i)}
            className={styles.profileButton}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* 2. SECCIÓN: Cabecera del Perfil (Imagen de perfil, Nombre y estadísticas) */}
      <ProfileHeader profile={profile} />

      {/* 3. SECCIÓN: Historias Destacadas (Círculos con imágenes de momentos guardados) */}
      <Highlights highlights={profile.highlights} />

      {/* 4. SECCIÓN: Cuadrícula de Publicaciones (Grid 3x3 de fotos del usuario) */}
      <PostGrid
        posts={profile.posts}
        onClick={(index) => {
          setStartIndex(index); // Guardar dónde hizo click el usuario
          setOpen(true); // Abrir el modal del Feed
        }}
      />

      {/* 5. SECCIÓN: Modal del Feed (Vista de "hacia abajo" de publicaciones tipo Instagram real) */}
      {open && (
        <FeedModal
          posts={profile.posts}
          startIndex={startIndex}
          onClose={() => setOpen(false)} // Función para cerrar el modal
        />
      )}
    </div>
  );
}

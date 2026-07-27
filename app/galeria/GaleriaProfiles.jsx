"use client";
import { useState } from "react";

// Components de la versión Galería
import ProfileCarousel from "../../components/galeria/ProfileCarousel";
import ProfilePresentacion from "../../components/galeria/ProfilePresentacion";
import ProfileHeader from "../../components/galeria/ProfileHeader";
import Highlights from "../../components/galeria/Highlights";
import PostGrid from "../../components/galeria/PostGrid";
import FeedModal from "../../components/galeria/FeedModal";

// Estilos de la página principal
import styles from "./page.module.css";

// Recibe los perfiles ya resueltos (desde Supabase con fallback local).
export default function GaleriaProfiles({ profiles = [] }) {
  // Estado local para manejar el perfil activo, si el modal está abierto y en qué post empieza
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  if (!profiles.length) {
    return <div className="md:pt-[120px] px-6 text-white/70">Sin contenido.</div>;
  }

  // Perfil seleccionado actualmente
  const profile = profiles[Math.min(current, profiles.length - 1)];

  return (
    <div>
      {/* 1. SECCIÓN: Carrusel de portadas de fondo y, encima, todo lo demás.
          En escritorio el carrusel arranca en lo alto de la página —por detrás
          del navbar, que es fijo y transparente, y de las categorías— para que
          la imagen no se corte. En móvil no hay carrusel y esto se lee como un
          bloque normal: categorías, cabecera de perfil e historias. */}
      <div className={styles.hero}>
        <ProfileCarousel portadas={profile.portadas} name={profile.name} />

        <div className={styles.heroContenido}>
          {/* 2. Botones para cambiar entre galerías, sobre la portada */}
          <div className={styles.buttonsContainer} aria-label="Seleccionar galería">
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

          {/* 3. Presentación: logo, descripción y cuenta atrás. En escritorio se
              centra en el alto libre de la portada; en móvil encabeza el perfil. */}
          <div className={styles.heroCentro}>
            <ProfilePresentacion
              presentacion={profile.presentacion}
              name={profile.name}
            />
          </div>

          {/* 4. Pie del hero: se apoya en la parte baja de la imagen */}
          <div className={styles.heroPie}>
            {/* Cabecera del Perfil: sólo móvil (en escritorio manda el carrusel) */}
            <ProfileHeader profile={profile} ocultoEnEscritorio />

            {/* Historias Destacadas (Círculos con momentos guardados) */}
            <Highlights highlights={profile.highlights} />
          </div>
        </div>
      </div>

      {/* 5. SECCIÓN: Cuadrícula de Publicaciones (Grid 3x3 de fotos del usuario) */}
      <PostGrid
        posts={profile.posts}
        onClick={(index) => {
          setStartIndex(index); // Guardar dónde hizo click el usuario
          setOpen(true); // Abrir el modal del Feed
        }}
      />

      {/* 6. SECCIÓN: Modal del Feed (Vista de "hacia abajo" de publicaciones tipo Instagram real) */}
      {open && (
        <FeedModal
          posts={profile.posts}
          startIndex={startIndex}
          galleryName={profile.name}
          allowImageScroll
          onClose={() => setOpen(false)} // Función para cerrar el modal
        />
      )}
    </div>
  );
}

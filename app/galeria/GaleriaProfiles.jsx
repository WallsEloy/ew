"use client";
import { useState } from "react";
import Link from "next/link";
import { rutaGaleria, slugGaleria } from "../../lib/galeriaSlug";

// Components de la versión Galería
import ProfileCarousel from "../../components/galeria/ProfileCarousel";
import HeroSketch from "../../components/galeria/HeroSketch";
import ProfilePresentacion from "../../components/galeria/ProfilePresentacion";
import ProfileHeader from "../../components/galeria/ProfileHeader";
import Highlights from "../../components/galeria/Highlights";
import PostGrid from "../../components/galeria/PostGrid";
import SesionesFotos from "../../components/galeria/SesionesFotos";
import FeedModal from "../../components/galeria/FeedModal";

// Estilos de la página principal
import styles from "./page.module.css";

// Recibe los perfiles ya resueltos (desde Supabase con fallback local) y la
// galería de esta página: cada una tiene su propia dirección (/galeria/<slug>).
export default function GaleriaProfiles({ profiles = [], activeSlug }) {
  // Estado local: si el modal está abierto, qué fotos muestra y en cuál empieza
  const [open, setOpen] = useState(false);
  const [modalPosts, setModalPosts] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  if (!profiles.length) {
    return <div className="md:pt-[120px] px-6 text-white/70">Sin contenido.</div>;
  }

  // Galería de esta página (la primera si el slug no coincide)
  const profile = profiles.find((p) => slugGaleria(p.name) === activeSlug) || profiles[0];
  const esFotografia = slugGaleria(profile.name) === "fotografia";

  // Fotografía se divide en sesiones (post.sesion), cada una en su propio
  // montón; las fotos sin sesión van sueltas, siempre a la vista. El resto de
  // galerías es una sola cuadrícula.
  const sesiones = esFotografia ? agruparPorSesion(profile.posts.filter((p) => p.sesion)) : [];
  const sueltas = esFotografia ? profile.posts.filter((p) => !p.sesion) : [];

  const abrirFoto = (posts, index) => {
    setModalPosts(posts);
    setStartIndex(index); // Guardar dónde hizo click el usuario
    setOpen(true); // Abrir el modal del Feed
  };

  return (
    <div>
      {/* 1. SECCIÓN: Carrusel de portadas de fondo y, encima, todo lo demás.
          En escritorio el carrusel arranca en lo alto de la página —por detrás
          del navbar, que es fijo y transparente, y de las categorías— para que
          la imagen no se corte. En móvil no hay carrusel y esto se lee como un
          bloque normal: categorías, cabecera de perfil e historias. */}
      <div className={styles.hero}>
        {/* Sketch tiene su propio hero por capas; las demás, su carrusel de portadas */}
        {slugGaleria(profile.name) === "sketch" ? (
          <HeroSketch name={profile.name} />
        ) : (
          <ProfileCarousel portadas={profile.portadas} name={profile.name} />
        )}

        <div className={styles.heroContenido}>
          {/* 2. Enlaces a cada galería, sobre la portada; la actual va resaltada */}
          <nav className={styles.buttonsContainer} aria-label="Galerías">
            {profiles.map((p) => {
              const activa = p === profile;
              return (
                <Link
                  key={p.id}
                  href={rutaGaleria(p.name)}
                  aria-current={activa ? "page" : undefined}
                  className={`${styles.profileButton} ${activa ? styles.profileButtonActive : ""}`}
                >
                  {p.name}
                </Link>
              );
            })}
          </nav>

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
            {/* Cabecera del Perfil: sólo móvil (en escritorio manda el carrusel).
                Sketch no la lleva: su hero por capas hace de presentación. */}
            {slugGaleria(profile.name) !== "sketch" && (
              <ProfileHeader profile={profile} ocultoEnEscritorio />
            )}

            {/* Historias Destacadas (Círculos con momentos guardados) */}
            <Highlights highlights={profile.highlights} />
          </div>
        </div>
      </div>

      {/* 5. SECCIÓN: Cuadrícula de Publicaciones. En Fotografía, un montón por
          sesión que se despliega al tocarlo; en las demás, la cuadrícula normal. */}
      {esFotografia ? (
        <SesionesFotos
          key={profile.id}
          sesiones={sesiones}
          sueltas={sueltas}
          // Con una foto abierta en grande las sesiones no se pliegan solas
          pausado={open}
          onClick={abrirFoto}
        />
      ) : (
        <PostGrid
          key={profile.id}
          posts={profile.posts}
          onClick={(index) => abrirFoto(profile.posts, index)}
        />
      )}

      {/* 6. SECCIÓN: Modal del Feed (Vista de "hacia abajo" de publicaciones tipo Instagram real) */}
      {open && (
        <FeedModal
          posts={modalPosts}
          startIndex={startIndex}
          galleryName={profile.name}
          allowImageScroll
          // En Fotografía la foto se ve completa y sin textos
          soloFoto={esFotografia}
          onClose={() => setOpen(false)} // Función para cerrar el modal
        />
      )}
    </div>
  );
}

// Agrupa las fotos por sesión respetando el orden en que aparecen. Las que no
// tienen sesión forman un grupo sin título.
function agruparPorSesion(posts = []) {
  const grupos = [];
  for (const post of posts) {
    const nombre = post.sesion || "";
    let grupo = grupos.find((g) => g.nombre === nombre);
    if (!grupo) {
      grupo = { nombre, posts: [] };
      grupos.push(grupo);
    }
    grupo.posts.push(post);
  }
  return grupos;
}

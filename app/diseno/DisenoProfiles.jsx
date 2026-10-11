"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProfileHeader from "../../components/galeria/ProfileHeader";
import Highlights from "../../components/galeria/Highlights";
import PostGrid from "../../components/galeria/PostGrid";
import WebShowcase from "./WebShowcase";
import HeroSketch from "../../components/galeria/HeroSketch";
import HeroCodigo from "../../components/HeroCodigo";
import styles from "./page.module.css";

// Ordena los proyectos por año (ficha "anio"), del más reciente al más antiguo.
// Los que no tienen año van al final en su orden original. No cambia la
// posición guardada, que es la que forma la URL de cada proyecto.
function sortByYear(posts = []) {
  const year = (post) => Number.parseInt(post.meta?.anio, 10);
  return posts
    .map((post, order) => ({ post, order }))
    .sort((a, b) => {
      const ya = year(a.post);
      const yb = year(b.post);
      if (Number.isNaN(ya) !== Number.isNaN(yb)) return Number.isNaN(ya) ? 1 : -1;
      if (!Number.isNaN(ya) && ya !== yb) return yb - ya;
      return a.order - b.order;
    })
    .map(({ post }) => post);
}

const isWeb = (profile) => String(profile.id) === "2" || /web/i.test(`${profile.name} ${profile.bio}`);
const isIsotiposProfile = (profile) => /isotipo/i.test(profile.name);
const isBrandingProfile = (profile) => /branding/i.test(profile.name);

// Hero del área Isotipos: sustituye la cabecera tipo perfil (avatar, contadores
// y biografía) por un texto de presentación y un isotipo destacado.
function IsotiposHero({ profile, cover }) {
  return (
    <section className={styles.areaHero} aria-labelledby="isotipos-title">
      <div className={styles.areaHeroCopy}>
        <span>Iconología</span>
        <h1 id="isotipos-title">{profile.name}</h1>
        <p>
          Símbolos que condensan una marca en su forma esencial. Cada isotipo nace de una idea
          sencilla, se construye sobre una retícula y se pone a prueba en cualquier tamaño.
        </p>
        <p className={styles.areaHeroCount}>
          {profile.posts.length} {profile.posts.length === 1 ? "proyecto" : "proyectos"}
        </p>
      </div>
      {cover && (
        <figure className={styles.areaHeroMedia}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" draggable={false} />
        </figure>
      )}
    </section>
  );
}

// Recibe los perfiles ya resueltos (desde Supabase con fallback local).
export default function DisenoProfiles({ profiles = [], initialProfile = 0 }) {
  const [current, setCurrent] = useState(initialProfile);
  const router = useRouter();

  useEffect(() => {
    setCurrent(initialProfile);
  }, [initialProfile]);

  if (!profiles.length) {
    return <div className="md:pt-[120px] px-6 text-white/70">Sin contenido.</div>;
  }

  const safeCurrent = Math.min(current, profiles.length - 1);
  const profile = profiles[safeCurrent];
  const isWebProfile = isWeb(profile);
  const isIsotipos = isIsotiposProfile(profile);
  const isBranding = isBrandingProfile(profile);
  const posts = sortByYear(profile.posts);

  return (
    <div className={isBranding ? styles.conHero : "md:pt-[120px]"}>
      {/* Branding usa el mismo hero por capas de Sketch (la pluma flotando),
          detrás del navbar en escritorio y bajo los botones en móvil */}
      {isBranding && <HeroSketch name={profile.name} />}

      {/* La vista Web ya no tiene botón aquí; sigue accesible con ?vista=web
          (lo usan los enlaces "Volver a Web" de sus proyectos) */}
      <div className={styles.buttonsContainer}>
        {profiles.map((p, i) => isWeb(p) ? null : (
          <button
            key={p.id}
            onClick={() => setCurrent(i)}
            className={`${styles.profileButton} ${i === safeCurrent ? styles.profileButtonActive : ""}`}
            aria-pressed={i === safeCurrent}
          >
            {p.name}
          </button>
        ))}
      </div>

      {isIsotipos ? (
        <IsotiposHero profile={profile} cover={posts[0]?.image} />
      ) : isWebProfile ? (
        // Web: hero con código que se escribe solo
        <HeroCodigo titulo="Web" proyectos={profile.posts.length} />
      ) : isBranding ? (
        <div className={styles.heroHistorias}>
          <Highlights highlights={profile.highlights} />
        </div>
      ) : (
        <>
          <ProfileHeader profile={isWebProfile ? { ...profile, name: "Web" } : profile} />
          <Highlights highlights={profile.highlights} />
        </>
      )}

      {isWebProfile ? <WebShowcase profile={profile} /> : (
        <div className={styles.designGrid}>
          <PostGrid
            posts={posts}
            onClick={(index) => {
              const post = posts[index];
              router.push(`/diseno/proyectos/${profile.id}/${post.id}`);
            }}
          />
        </div>
      )}
    </div>
  );
}

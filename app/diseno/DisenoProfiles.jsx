"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProfileHeader from "../../components/galeria/ProfileHeader";
import Highlights from "../../components/galeria/Highlights";
import PostGrid from "../../components/galeria/PostGrid";
import WebShowcase from "./WebShowcase";
import styles from "./page.module.css";

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
  const isWebProfile = String(profile.id) === "2" || /web/i.test(`${profile.name} ${profile.bio}`);

  return (
    <div className="md:pt-[120px]">
      <div className={styles.buttonsContainer}>
        {profiles.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setCurrent(i)}
            className={styles.profileButton}
          >
            {String(p.id) === "2" || /web/i.test(`${p.name} ${p.bio}`) ? "Web" : p.name}
          </button>
        ))}
      </div>

      <ProfileHeader profile={isWebProfile ? { ...profile, name: "Web" } : profile} />

      <Highlights highlights={profile.highlights} />

      {isWebProfile ? <WebShowcase profile={profile} /> : (
        <div className={styles.designGrid}>
          <PostGrid
            posts={profile.posts}
            onClick={(index) => {
              const post = profile.posts[index];
              router.push(`/diseno/proyectos/${profile.id}/${post.id}`);
            }}
          />
        </div>
      )}
    </div>
  );
}

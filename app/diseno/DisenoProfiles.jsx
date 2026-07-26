"use client";
import { useState } from "react";

import ProfileHeader from "../../components/galeria/ProfileHeader";
import Highlights from "../../components/galeria/Highlights";
import PostGrid from "../../components/galeria/PostGrid";
import FeedModal from "../../components/galeria/FeedModal";
import styles from "./page.module.css";

// Recibe los perfiles ya resueltos (desde Supabase con fallback local).
export default function DisenoProfiles({ profiles = [] }) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  if (!profiles.length) {
    return <div className="md:pt-[120px] px-6 text-white/70">Sin contenido.</div>;
  }

  const safeCurrent = Math.min(current, profiles.length - 1);
  const profile = profiles[safeCurrent];

  return (
    <div className="md:pt-[120px]">
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

      <ProfileHeader profile={profile} />

      <Highlights highlights={profile.highlights} />

      <div className={styles.designGrid}>
        <PostGrid
          posts={profile.posts}
          onClick={(index) => {
            setStartIndex(index);
            setOpen(true);
          }}
        />
      </div>

      {open && (
        <FeedModal
          posts={profile.posts}
          startIndex={startIndex}
          projectPathPrefix={`/diseno/proyectos/${profile.id}`}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

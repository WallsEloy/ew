"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function BackButton() {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <button
      type="button"
      className={styles.backButton}
      onClick={goBack}
      aria-label="Regresar a la página anterior"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m14.5 5-7 7 7 7" />
      </svg>
    </button>
  );
}

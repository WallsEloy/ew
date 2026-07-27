"use client";

import { useEffect } from "react";

/*
 * Frontera de error de la app. Sin ella, Next no tiene qué renderizar cuando
 * algo falla y en desarrollo sirve un HTML de relleno en su lugar.
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        padding: "2rem",
        textAlign: "center",
        color: "#fefaf4",
      }}
    >
      <p style={{ letterSpacing: "0.18em", fontSize: 12, opacity: 0.6 }}>
        ALGO SE ROMPIÓ
      </p>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>No pudimos cargar esto</h1>
      <p style={{ maxWidth: 460, opacity: 0.7, lineHeight: 1.6 }}>
        {error?.message || "Error inesperado."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        style={{
          marginTop: 8,
          padding: "12px 22px",
          borderRadius: 999,
          border: "1px solid rgba(254,250,244,0.9)",
          background: "#fefaf4",
          color: "#0b0b0b",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Reintentar
      </button>
    </div>
  );
}

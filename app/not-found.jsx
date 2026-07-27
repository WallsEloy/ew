import Link from "next/link";

/*
 * Página 404. Además de ser lo correcto de cara al visitante, su ausencia hacía
 * que en desarrollo Next devolviera un HTML de relleno («missing required error
 * components») a cualquier petición fallida, incluidas las llamadas a /api,
 * que entonces reventaban al intentar leerlas como JSON.
 */
export default function NotFound() {
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
        ERROR 404
      </p>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Esta página no existe</h1>
      <p style={{ maxWidth: 420, opacity: 0.7, lineHeight: 1.6 }}>
        Puede que el enlace esté mal escrito o que la pieza que buscas ya no esté
        publicada.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 8,
          padding: "12px 22px",
          borderRadius: 999,
          background: "#fefaf4",
          color: "#0b0b0b",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}

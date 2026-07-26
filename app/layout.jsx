import Navbar from "../components/Navbar";
import "./globals.css";

export const metadata = {
  title: "Instagram 2026",
  description: "Enhanced Instagram UI Clone",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          background: "#000",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
        className="antialiased"
      >
        <Navbar />
        {/* Espaciador solo móvil: reserva la altura del nav fijo (94px) para que
            empuje el contenido hacia abajo y no lo tape. En desktop se oculta. */}
        <div aria-hidden="true" className="md:hidden h-[94px]" />
        {children}
      </body>
    </html>
  );
}

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
        {children}
      </body>
    </html>
  );
}

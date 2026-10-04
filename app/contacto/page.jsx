import ContactoView from "./ContactoView";
import { getContactoConfig } from "../../lib/contactoConfig";

// Página en caché: el dashboard la regenera al guardar (revalidatePath) y,
// como red de seguridad, se vuelve a generar como máximo cada 5 minutos.
export const revalidate = 300;

export const metadata = {
  title: "Contacto",
  description: "Escríbeme para tu próximo proyecto de diseño, branding o desarrollo.",
};

export default async function ContactoPage() {
  // Lee de Supabase (fallback a los defaults si no hay fila ni credenciales).
  const { config } = await getContactoConfig();
  return <ContactoView config={config} />;
}

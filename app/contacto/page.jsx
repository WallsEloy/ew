import ContactoView from "./ContactoView";
import { getContactoConfig } from "../../lib/contactoConfig";

export const dynamic = "force-dynamic";

export default async function ContactoPage() {
  // Lee de Supabase (fallback a los defaults si no hay fila ni credenciales).
  const { config } = await getContactoConfig();
  return <ContactoView config={config} />;
}

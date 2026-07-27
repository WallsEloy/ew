import ContactoEditor from "../../../components/dashboard/ContactoEditor";

export const metadata = { title: "Dashboard · Contacto" };
export const dynamic = "force-dynamic";

export default function DashboardContactoPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Contacto</h1>
      <p className="text-sm text-gray-400 mb-6">
        Todo lo que se ve en la tarjeta de contacto: perfil y foto giratoria,
        botón de agencia, historias, redes, botones de asesoría y contacto, y los
        acordeones de la derecha.
      </p>
      <ContactoEditor />
    </div>
  );
}

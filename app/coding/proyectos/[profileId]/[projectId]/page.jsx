import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileProject } from "../../../../../lib/portfolioServer";
import { FeatureRow, StoryBlock } from "../../../../diseno/proyectos/[profileId]/[projectId]/bloques";
import styles from "../../../../diseno/proyectos/[profileId]/[projectId]/page.module.css";

// Página en caché: el dashboard la regenera al guardar (revalidatePath) y,
// como red de seguridad, se vuelve a generar como máximo cada 5 minutos.
export const revalidate = 300;

/*
 * Proyectos de Coding armados con el mismo método que los de Web
 * (doc/documentos/proyectos web/acomodo_paginas_web.md): hero con el logotipo
 * como título, bloques de texto y filas de capturas. La clave es
 * "perfil/proyecto" de la colección Coding (no choca con Diseño: es otro archivo).
 */
const dm = (name, alt, width = 1800, height = 1125) => ({ image: `/Coding/DentalMaya/${name}.webp`, alt, width, height });
// Capturas de celular (390×844, 19.5:9) dentro de un iPhone
const dmMovil = (name, alt) => ({ image: `/Coding/DentalMaya/movil-${name}-iphone.webp`, alt, width: 720, height: 1558, device: "iphone" });

const PROYECTOS = {
  "1/0": {
    hero: {
      title: "Dental Maya",
      titleLogo: "/Coding/DentalMaya/logo-sin-contorno.svg",
      category: "Software · Gestión odontológica",
      description:
        "Dental Maya es un sistema para administrar un consultorio dental: pacientes, historiales clínicos, citas, cobros y gastos en un solo lugar. Lo diseñé y programé como una app multiplataforma para web, celular y escritorio.",
      meta: [
        ["Disciplina", "Desarrollo de software"],
        ["Tecnología", "Flutter · Supabase"],
        ["Plataformas", "Web · Android · iOS · macOS · Windows"],
        ["Desarrollador", "Eloy Walls"],
      ],
      background: "#0f2230",
      ink: "#ffffff",
      accent: "#7fd0f0",
    },
    rows: [
      {
        story: {
          eyebrow: "Acceso",
          title: "Entrar por rol, sin perder tiempo.",
          body: [
            "El acceso combina correo y contraseña con **Google y Facebook**, y un **modo demo** con un botón por rol —dirección, operativa o paciente— para recorrer la app con datos de ejemplo sin tocar la base de datos real.",
          ],
        },
      },
      { items: [dm("login", "Pantalla de inicio de sesión de Dental Maya con acceso por rol")] },
      {
        story: {
          eyebrow: "Panel de la doctora",
          title: "Todo el consultorio de un vistazo.",
          body: [
            "Al entrar, la **Dra. Carolina Vega Maya** ve el resumen de la clínica: ingresos, gastos, utilidad, cobros pendientes, citas y ocupación del periodo, con alertas clínicas y operativas.",
            "Las gráficas muestran los **ingresos por servicio** y los **gastos por categoría**, y debajo el panel administrativo resume el día: pacientes atendidos, procedimientos y productos con stock bajo.",
          ],
        },
      },
      { items: [dm("carolina", "Inicio de la Dra. Carolina: resumen general con ingresos, gastos y utilidad")] },
      { items: [dm("carolina-2", "Gráficas de ingresos por servicio y gastos por categoría"), dm("carolina-3", "Panel administrativo con cifras del día")] },
      {
        story: {
          eyebrow: "Pacientes",
          title: "Cada paciente, con su historia.",
          body: [
            "La lista de **pacientes** se busca por nombre y se puede ver en general, **por doctor** o como **prospectos**. Al abrir uno aparece su **resumen clínico**: datos y alertas, la última consulta, el tratamiento en curso y accesos directos a su historial médico, expediente, odontograma, consentimientos, recetas y tratamientos.",
          ],
        },
      },
      { items: [dm("patients", "Lista de pacientes con buscador y vistas por doctor y prospectos")] },
      // Ficha de la paciente María López: resumen clínico con alertas, última consulta y tratamiento
      { items: [dm("paciente-maria", "Resumen clínico de María López: alertas, última consulta, tratamiento en progreso y accesos al expediente")] },
      {
        story: {
          eyebrow: "Odontograma",
          title: "La boca completa, pieza por pieza.",
          body: [
            "El **odontograma** dibuja las 32 piezas por arco —maxilar y mandibular— con su numeración y un color por tipo de diente, en dentición **permanente o infantil**. Las piezas con hallazgos se marcan sobre el dibujo.",
            "A un lado, los **diagnósticos** de la paciente: caras afectadas, descripción, fecha, tratamiento indicado y estado —activo o resuelto—, con acceso directo a cada diente.",
          ],
        },
      },
      { items: [dm("odontograma-maria", "Odontograma de María López con arcos maxilar y mandibular y diagnósticos por diente")] },
      {
        story: {
          eyebrow: "Versión móvil",
          title: "El consultorio en el bolsillo.",
          body: [
            "La misma app corre en el celular: el menú lateral pasa a una **barra de navegación inferior** y cada panel se reorganiza en una columna, con las gráficas, la agenda del día y los accesos rápidos a la mano.",
          ],
        },
      },
      {
        compact: true,
        columns: 4,
        items: [
          dmMovil("login", "Inicio de sesión de Dental Maya en el celular"),
          dmMovil("carolina", "Resumen general de la Dra. Carolina en el celular"),
          dmMovil("carolina-2", "Gráficas de ingresos y gastos en el celular"),
          dmMovil("clinical-dashboard", "Mi día: agenda de la doctora en el celular"),
        ],
      },
    ],
  },
};

export async function generateMetadata({ params }) {
  const route = await params;
  const proyecto = PROYECTOS[`${route.profileId}/${route.projectId}`];
  if (proyecto) return { title: proyecto.hero.title, description: proyecto.hero.description.slice(0, 160) };
  return {};
}

export default async function CodingProjectPage({ params }) {
  const route = await params;
  const data = await getProfileProject("coding", route.profileId, route.projectId);
  if (!data) notFound();

  const proyecto = PROYECTOS[`${route.profileId}/${route.projectId}`];
  if (proyecto) return <ProyectoCoding proyecto={proyecto} profileName={data.profileName} />;

  const title = data.title || (data.caption || "Proyecto Coding").split("#")[0].trim();
  const technicalData = [
    ["Categoría", data.web?.type || "Desarrollo"],
    ["Colección", data.meta?.coleccion],
    ["Año", data.meta?.anio],
    ["Tecnología", data.meta?.tecnica],
    ["Formato", data.meta?.formato],
    ["Estudio", data.web?.author || "EW Studio"],
  ].filter(([, value]) => value);

  return (
    <main className={styles.projectPage}>
      <Link href="/coding" className={styles.backLink} aria-label="Volver a Coding">
        <span>←</span> Volver a Coding
      </Link>

      <section className={styles.projectLayout}>
        <div className={styles.mosaic}>
          {data.image && (
            <figure className={`${styles.card} ${styles.card1}`}>
              <img src={data.image} alt={title} />
            </figure>
          )}
        </div>

        <aside className={styles.details}>
          <div className={styles.brandLine}>
            <span className={styles.brandDot} />
            <span>{data.profileName}</span>
          </div>
          <h1>{title}</h1>
          <p className={styles.category}>{data.web?.type || "Desarrollo digital"}</p>
          <div className={styles.descriptionBlock}>
            <span>Sobre el proyecto</span>
            <p>{data.caption || data.profileBio}</p>
          </div>
          <dl className={styles.metaGrid}>
            {technicalData.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </aside>
      </section>
    </main>
  );
}

// Página de proyecto con el mismo acomodo que los proyectos de Web
function ProyectoCoding({ proyecto, profileName }) {
  const { hero, rows } = proyecto;
  return (
    <main
      className={styles.projectPage}
      style={{ "--story-ink": hero.accent, "--page-bg": hero.background }}
    >
      <section
        className={`${styles.hero} ${styles.heroFilled}`}
        style={{ "--hero-bg": hero.background, "--hero-ink": hero.ink }}
      >
        <Link href="/coding" className={styles.backLink} aria-label="Volver a Coding">
          <span>←</span> Volver a Coding
        </Link>

        <div className={`${styles.heroCopy} ${styles.heroCopyTinted}`} style={{ "--hero-ink": hero.ink }}>
          <div className={styles.brandLine}>
            <span className={styles.brandDot} />
            <span>{profileName}</span>
          </div>
          <h1 className={styles.heroTitleLogo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero.titleLogo} alt={hero.title} draggable={false} />
          </h1>
          <p className={styles.category}>{hero.category}</p>
          <p className={styles.description}>{hero.description}</p>
          <dl className={styles.metaRow}>
            {hero.meta.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {rows.map((row, index) =>
        row.story ? <StoryBlock block={row.story} key={row.story.title} /> : <FeatureRow {...row} key={row.items[0]?.image || index} />,
      )}
    </main>
  );
}

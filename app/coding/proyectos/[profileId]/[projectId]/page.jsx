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
// Project Lab: capturas de escritorio a 1800 px (proporción ≈ 2.1:1, la de la pantalla grabada)
const gp = (name, alt) => ({ image: `/Coding/Gestion_Proyectos/${name}.webp`, alt, width: 1800, height: 855 });
// Plataforma para restaurantes: paneles a 1800×1125 y menús de cliente en iPhone
const rs = (name, alt) => ({ image: `/Coding/Restaurantes/${name}.webp`, alt, width: 1800, height: 1125 });
const rsMovil = (name, alt) => ({ image: `/Coding/Restaurantes/movil-${name}-iphone.webp`, alt, width: 720, height: 1558, device: "iphone" });
const rsVideo = (name, alt) => ({ video: `/Coding/Restaurantes/video/${name}.mp4`, poster: `/Coding/Restaurantes/video/${name}-poster.webp`, alt, width: 600, height: 1298, device: "iphone" });
const gpVideo = (name, alt) => ({ video: `/Coding/Gestion_Proyectos/video/${name}.mp4`, poster: `/Coding/Gestion_Proyectos/video/${name}-poster.webp`, alt, width: 1280, height: 606 });

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
  "1/1": {
    hero: {
      title: "Project Lab Dashboard",
      category: "Software · Gestión de proyectos",
      description:
        "Project Lab es un sistema para llevar proyectos de principio a fin: planeación visual, sprints, tablero Kanban, línea de tiempo, control de horas, equipo y base de conocimiento. Lo diseñé y programé como un dashboard web.",
      meta: [
        ["Disciplina", "Desarrollo de software"],
        ["Tecnología", "Next.js · React Flow · Zustand"],
        ["Plataforma", "Web"],
        ["Desarrollador", "Eloy Walls"],
      ],
      background: "#0a0a0b",
      ink: "#ffffff",
      accent: "#5b8def",
    },
    rows: [
      {
        story: {
          eyebrow: "Panel general",
          title: "El estado de todos los proyectos, al entrar.",
          body: [
            "El **dashboard** resume lo importante: proyectos activos, tareas, horas registradas, capacidad del equipo y miembros, con una gráfica de la **carga de trabajo** de cada persona y la actividad reciente.",
          ],
        },
      },
      // Grabación completa del sistema (4 min 19 s): se carga solo al llegar a ella
      { items: [gpVideo("recorrido-completo", "Recorrido completo por Project Lab Dashboard: dashboard, planeación, Kanban, Gantt, tiempo, equipo y conocimiento")] },
      {
        story: {
          eyebrow: "Proyectos",
          title: "Un portafolio con responsables y presupuesto.",
          body: [
            "Cada proyecto tiene su tarjeta con responsable, estado y presupuesto, y el **portafolio** los lista en una tabla con avance y horas para comparar de un vistazo.",
          ],
        },
      },
      { items: [gp("proyectos", "Proyectos personales y de clientes con su portafolio en tabla")] },
      {
        story: {
          eyebrow: "Planeación",
          title: "Pensar el proyecto antes de repartirlo.",
          body: [
            "La planeación es visual: un **mapa estilo Miro** para ideas, imágenes y notas sobre un lienzo libre, y un **diagrama de procesos** donde cada paso es un nodo que se conecta con el siguiente, con decisiones, documentos y responsables.",
          ],
        },
      },
      { items: [gpVideo("procesos", "Grabación del diagrama de procesos: los nodos se conectan paso a paso")] },
      { items: [gp("planeacion-mapa", "Mapa de proyecto estilo Miro con nodos sobre un lienzo"), gp("planeacion-procesos", "Diagrama de procesos con nodos conectados")] },
      {
        story: {
          eyebrow: "Scrum y Kanban",
          title: "Del backlog a terminado.",
          body: [
            "**Scrum** muestra el sprint activo, las preguntas del **daily** y el **burndown**, junto al product backlog. El tablero **Kanban** mueve las tareas por columnas —backlog, pendiente, en proceso, en revisión y completado— arrastrándolas.",
          ],
        },
      },
      { items: [gp("scrum", "Sprint activo, daily scrum, burndown y product backlog"), gp("kanban", "Tablero Kanban con tareas por estado")] },
      {
        story: {
          eyebrow: "Tiempo",
          title: "Lo planeado contra lo trabajado.",
          body: [
            "La **línea de tiempo (Gantt)** ordena proyectos y tareas por días, semanas o meses. El **time tracking** tiene un temporizador por tarea y una hoja de horas que compara lo estimado con lo realmente trabajado por cada persona.",
          ],
        },
      },
      { items: [gp("gantt", "Línea de tiempo Gantt de proyectos y tareas")] },
      { items: [gp("time-tracking", "Temporizador y hoja de horas por proyecto y tarea")] },
      {
        story: {
          eyebrow: "Equipo",
          title: "Quién hace qué, y cuánto puede hacer.",
          body: [
            "El **organigrama** se arma con nodos por departamento y persona, y cada miembro tiene su ficha con rol, capacidad semanal y tarifa por hora, que alimenta la carga de trabajo del dashboard.",
          ],
        },
      },
      { items: [gp("equipo", "Organigrama del equipo y fichas con capacidad semanal")] },
      {
        story: {
          eyebrow: "Conocimiento",
          title: "Lo que aprende el equipo, conectado.",
          body: [
            "La **base de conocimiento** guarda documentos, notas y decisiones del equipo y los muestra como un **grafo**: cada nota es un nodo y sus enlaces aparecen al seleccionarla, con filtros por categoría para encontrar las relaciones.",
          ],
        },
      },
      { items: [gpVideo("conocimiento", "Grabación del grafo de conocimiento creciendo y mostrando sus enlaces")] },
      { items: [gp("conocimiento", "Grafo de conocimiento con filtros por categoría")] },
      {
        story: {
          eyebrow: "Archivos e integraciones",
          title: "Todo el material del proyecto en el mismo lugar.",
          body: [
            "El **almacenamiento** organiza los archivos por carpetas con la capacidad usada, y la sección de **integraciones** reúne los servicios conectados —bases de datos, almacenamiento en la nube, repositorios y modelos de IA— y un catálogo de MCP, APIs y skills.",
          ],
        },
      },
      { items: [gp("almacenamiento", "Almacenamiento por carpetas con capacidad"), gp("integraciones", "Integraciones activas y catálogo de MCP, APIs y skills")] },
    ],
  },
  // Plataforma para restaurantes: la misma base desplegada para varias marcas,
  // por eso el hero va sin logotipo (título en texto)
  "1/2": {
    hero: {
      title: "Plataforma para restaurantes",
      category: "Software · Menú digital, lealtad y punto de venta",
      description:
        "Un sistema completo para restaurantes que se adapta a cada marca: menú digital con fotos, tarjeta de lealtad, reseñas, y tres paneles —administración, empleados y punto de venta—. La misma base corre hoy para seis restaurantes, cada uno con su logotipo y sus colores.",
      meta: [
        ["Disciplina", "Desarrollo de software"],
        ["Tecnología", "Next.js · Supabase · MongoDB"],
        ["Marcas", "El Tejaban · Caminos de Michoacán · El Jardín · Luigi's · Nicho · Portales"],
        ["Desarrollador", "Eloy Walls"],
      ],
      background: "#141210",
      ink: "#ffffff",
      accent: "#e8a76a",
    },
    rows: [
      {
        story: {
          eyebrow: "Una base, muchas marcas",
          title: "Cada restaurante, con su propia cara.",
          body: [
            "La plataforma toma el **logotipo, los colores y el menú** de cada restaurante desde su configuración: el mismo código se ve azul en **El Tejaban**, terracota en **Caminos de Michoacán**, naranja en **El Jardín de Acámbaro**, rojo en **Luigi's** y magenta en **Nicho**.",
          ],
        },
      },
      { items: [rs("portada-marcas", "Menú digital de cinco restaurantes, cada uno con sus colores")] },
      {
        story: {
          eyebrow: "Menú digital",
          title: "El menú en el celular del cliente.",
          body: [
            "El cliente escanea el QR de la mesa y abre el menú por **categorías**: cada platillo se despliega con su **foto, precio** y el botón para agregarlo al pedido; los agotados se marcan y los favoritos acumulan *likes*. Abajo, una barra lleva a **reseñas** y a la **tarjeta de lealtad**.",
          ],
        },
      },
      { items: [rsVideo("menu-tejaban-iphone", "Grabación del menú de El Tejaban: se abre una categoría y tres platillos con su foto"), rsMovil("tejaban-platillo", "Platillo abierto en el menú de El Tejaban")] },
      {
        compact: true,
        columns: 4,
        items: [
          rsMovil("caminos-platillo", "Menú de Caminos de Michoacán con un platillo abierto"),
          rsMovil("jardin-platillo", "Menú de El Jardín de Acámbaro con una hamburguesa"),
          rsMovil("luigis-platillo", "Menú de Luigi's con una pizza abierta"),
          rsMovil("nicho-platillo", "Menú de Nicho con una hamburguesa"),
        ],
      },
      {
        story: {
          eyebrow: "Lealtad y reseñas",
          title: "Que el cliente vuelva.",
          body: [
            "La **tarjeta de lealtad** se consulta con nombre y teléfono, sin descargar nada, y suma un sello por visita hasta ganar un premio. Las **reseñas** se dejan desde el mismo menú; las malas avisan por correo al dueño antes de que se vuelvan públicas.",
          ],
        },
      },
      {
        compact: true,
        columns: 4,
        items: [
          rsMovil("tejaban-card", "Tarjeta de lealtad de El Tejaban"),
          rsMovil("portales-card", "Tarjeta de lealtad de Coffee Shop Portales"),
          rsMovil("caminos-review", "Reseñas de Caminos de Michoacán"),
          rsMovil("nicho-review", "Reseñas de Nicho"),
        ],
      },
      {
        story: {
          eyebrow: "Panel de administración",
          title: "El negocio completo, desde un panel.",
          body: [
            "El dueño ve la **fidelización** de sus clientes por nivel, los puntos y las recompensas más canjeadas; administra el **menú inteligente** con su ranking de platillos más gustados, el **recetario** con costos, el **CRM**, campañas de **marketing** por canal, **automatizaciones** con IA y el inventario de **producción**.",
          ],
        },
      },
      { items: [rs("admin-fidelizacion", "Dashboard de fidelización con clientes por nivel y puntos")] },
      { items: [rs("admin-menu", "Menú inteligente con ranking de platillos")] },
      {
        story: {
          eyebrow: "Cupones",
          title: "Recompensas que se envían solas.",
          body: [
            "Los **cupones automáticos** se disparan sin que nadie los mande: un postre gratis en el **cumpleaños**, un 20% para recuperar a quien lleva 15 días sin volver, un 10% de **bienvenida** en la primera compra y un regalo sorpresa al **subir de nivel**. El panel muestra cuántos se han enviado y cuáles están activos.",
          ],
        },
      },
      { items: [rs("cupones-dashboard", "Dashboard de fidelización con la sección de cupones automáticos"), { image: "/Coding/Restaurantes/cupones-tarjeta.webp", alt: "Cupones automáticos: cumpleaños, recuperación, bienvenida y ascenso de nivel", width: 569, height: 482 }] },
      {
        story: {
          eyebrow: "Recetario",
          title: "Cada platillo, con su receta.",
          body: [
            "El **recetario** guarda las recetas del restaurante con su foto, categoría, ingredientes y pasos de preparación, para que la cocina prepare igual cada vez. El dueño las edita desde el admin y los **empleados** las consultan desde su panel, filtradas por categoría.",
          ],
        },
      },
      { items: [rs("admin-recetario", "Recetario con fotos y categorías"), rs("receta-detalle", "Receta del Despertar del Ranchero con ingredientes y preparación")] },
      { items: [rs("recetario-2", "Más recetas del recetario: caldo de res, churipo, morisqueta"), rs("recetario-empleado", "Recetario en el panel del empleado, filtrado por categoría")] },
      { items: [rs("admin-marketing", "Marketing por canal con presupuesto y retorno"), rs("admin-crm", "CRM de clientes con visitas y gasto")] },
      { items: [rs("admin-automatizaciones", "Automatizaciones con IA para clientes inactivos y ofertas"), rs("admin-produccion", "Producción e inventario con stock mínimo")] },
      {
        story: {
          eyebrow: "Resta3 · Punto de venta",
          title: "Caja, mesas y cocina en el mismo sistema.",
          body: [
            "**Resta3** es el panel de operación: un **TPV** con la foto de cada platillo para tomar la comanda, el estado de las **mesas**, la pantalla de **cocina** con las órdenes en preparación, domicilios, inventario, corte de caja y **reportes** de ventas.",
          ],
        },
      },
      { items: [rs("resta3-tpv-tejaban", "Punto de venta de El Tejaban con la foto de cada platillo")] },
      { items: [rs("resta3-dashboard-tejaban", "Dashboard de Resta3 con ventas, pedidos y estado de cocina"), rs("resta3-tpv-caminos", "Punto de venta de Caminos de Michoacán")] },
      { items: [rs("resta3-reportes", "Reportes con platillos más vendidos y ventas por categoría"), rs("resta3-cocina", "Pantalla de cocina con las órdenes de entrada")] },
      {
        story: {
          eyebrow: "Empleados y versiones ligeras",
          title: "Del mesero a la versión más sencilla.",
          body: [
            "Los **empleados** tienen su propio acceso para sellar visitas con el QR del cliente y atender pedidos. Para negocios más chicos hay versiones ligeras: **menú y pedidos** (El Jardín, Luigi's —esta sobre **MongoDB**—) o solo la **tarjeta de lealtad** (Coffee Shop Portales).",
          ],
        },
      },
      { items: [rs("empleado-sellar", "Panel del empleado para sellar visitas con QR"), rs("jardin-pedidos", "Pedidos activos en el panel de El Jardín")] },
      { items: [rs("luigis-menu", "Menú inteligente del panel de Luigi's"), rs("portales-tarjetas", "Tarjetas de lealtad del panel de Coffee Shop Portales")] },
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
          {/* Con logotipo, el logotipo es el título; si no hay, el nombre en texto */}
          {hero.titleLogo ? (
            <h1 className={styles.heroTitleLogo}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.titleLogo} alt={hero.title} draggable={false} />
            </h1>
          ) : (
            <h1>{hero.title}</h1>
          )}
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

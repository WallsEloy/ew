// Configuración por defecto de la página de Contacto.
// Sirve como FALLBACK si site_settings no tiene la clave 'contacto', y es la
// base que consume app/contacto/ContactoView.jsx. Replica EXACTAMENTE la
// tarjeta de contacto tal como estaba escrita a mano en el código.

export const defaultContactoConfig = {
  perfil: {
    nombre: "Eloy Walls",
    rol: "CEO / Director Creativo",
    // La foto gira mostrando el siguiente medio. type: 'image' | 'video'.
    // Los videos aceptan varias fuentes (webm para Chrome/Firefox, MOV para Safari).
    medios: [
      {
        type: "image",
        src: "/Imagenes/428646700_2628303167349157_8166977006435626776_n.jpg",
      },
      { type: "video", sources: ["/perfil/IMG_1327.webm", "/perfil/IMG_1327.MOV"] },
      { type: "video", sources: ["/perfil/IMG_1329.webm", "/perfil/IMG_1329.MOV"] },
    ],
  },
  agencia: {
    label: "dreamoun.&Co.",
    href: "https://www.instagram.com/dreamoun_agencia",
    descripcion:
      "Agencia creativa y tecnológica enfocada en potenciar marcas mediante diseño, IA, automatización y estrategias basadas en Data Point.",
  },
  stories: [
    {
      id: "proyectos",
      label: "Proyectos",
      cover: "/Imagenes/icon_1.jpg",
      videos: [
        "/Videos/Proyectos/d.mp4",
        "/Videos/Proyectos/recor480.mp4",
        "/Videos/Proyectos/c.mp4",
      ],
    },
    {
      id: "code",
      label: "CODE",
      cover: "/Imagenes/icon_2.jpg",
      videos: ["/Videos/code/1108.mp4", "/Videos/code/Codi.mp4"],
    },
    {
      id: "conferencias",
      label: "Conferencias",
      cover: "/Imagenes/icon_3.jpg",
      videos: [
        "/Videos/Conferencia/vido2.mp4",
        "/Videos/Conferencia/vido1_1.mp4",
        "/Videos/Conferencia/vido_3.mp4",
      ],
    },
    {
      id: "design",
      label: "Design",
      cover: "/Imagenes/icon_4.jpg",
      videos: [
        "/Videos/desing/A1.mp4",
        "/Videos/desing/A2.mp4",
        "/Videos/desing/B1.mp4",
        "/Videos/desing/B2.mp4",
        "/Videos/desing/1129.mp4",
      ],
    },
    {
      id: "branding",
      label: "Branding",
      cover: "/Imagenes/icon_5.jpg",
      videos: [
        "/Videos/branding/1.mp4",
        "/Videos/branding/A1.mp4",
        "/Videos/branding/A2.mp4",
        "/Videos/branding/B2.mp4",
        "/Videos/branding/C1.mp4",
        "/Videos/branding/c2.mp4",
        "/Videos/branding/cel.mp4",
      ],
    },
    // Sin videos: el story se muestra pero no abre nada.
    { id: "artes", label: "Artes", cover: "/Imagenes/icon_6.jpg", videos: [] },
  ],
  redes: [
    {
      href: "https://www.facebook.com/jorsheloy",
      icon: "/Imagenes/icon_7.png",
      alt: "Facebook",
    },
    {
      href: "https://www.instagram.com/eloy_walls/",
      icon: "/Imagenes/icon_8.png",
      alt: "Instagram",
    },
    {
      href: "https://www.linkedin.com/in/eloy-walls-6490832b3/",
      icon: "/Imagenes/icon_9.png",
      alt: "LinkedIn",
    },
    {
      href: "https://www.tiktok.com/@eloy_walls",
      icon: "/Imagenes/icon_10.png",
      alt: "TikTok",
    },
  ],
  asesoria: {
    titulo: "Agendar asesoría",
    label: "Whatsapp",
    href: "https://wa.me/524171033804",
  },
  // Con estos datos se arma el .vcf que se descarga con "Guardar contacto"
  vcard: {
    label: "Guardar contacto 📱",
    nombre: "Eloy Walls",
    organizacion: "Agencia Dreamoun",
    puesto: "CEO y Director Creativo",
    telefono: "+524171033804",
  },
  secciones: [
    {
      title: "Servicios",
      lines: [
        "• Desarrollo integral de branding y diseño estratégico.",
        "• Entrenamiento y personalización de neuronas IA para empresas.",
        "• Implementación de soluciones basadas en inteligencia artificial.",
        "• Creación y administración de campañas con KPIs orientadas a resultados.",
        "• Estudios de mercado, análisis de data points y diagnóstico comercial.",
      ],
    },
    {
      title: "Estudios",
      lines: [
        "Licenciatura en Medios Interactivos — formación creativa y tecnológica orientada al diseño, desarrollo digital y soluciones interactivas.",
        "Licenciatura en Derecho — enfoque en contratos, conciliación mercantil y análisis normativo aplicado a negocios.",
      ],
    },
    {
      title: "Experiencia Profesional",
      lines: [
        "Experiencia en diseño digital, producción publicitaria, campañas de marketing, gestión creativa y optimización de procesos para marcas y negocios.",
      ],
    },
    {
      title: "Trayectoria Emprendedora",
      lines: [
        "Fundación de múltiples proyectos enfocados en innovación, transformación digital, optimización de procesos y estrategias para negocios emergentes.",
      ],
    },
    {
      title: "Desarrollo Autónomo",
      lines: [
        "Desarrollo de automatizaciones inteligentes, creación de agentes especializados, modelos de flujo y sistemas orientados a eficiencia operativa.",
      ],
    },
    {
      title: "Experiencia en IA",
      lines: [
        "Dominio en modelos de IA, generación avanzada de imágenes, entrenamiento de agentes inteligentes, administración de servidores y pipelines de automatización.",
      ],
    },
    {
      title: "Conferencias",
      lines: [
        "Charlas y capacitaciones sobre marketing estratégico, inteligencia artificial, liderazgo creativo, innovación y metodologías de crecimiento.",
      ],
    },
    {
      title: "Habilidades",
      lines: [
        "Habilidades en liderazgo efectivo, comunicación estratégica, creatividad aplicada, dirección de equipos multidisciplinarios y resolución de problemas.",
      ],
    },
    {
      title: "Habilidades Técnicas",
      lines: [
        "Manejo profesional de HTML, CSS, JavaScript, modelado 3D, Adobe Suite, IA aplicada, pipelines creativos y herramientas para optimización digital.",
      ],
    },
    {
      title: "Software y Tecnologías",
      lines: [
        "Experiencia con Adobe Suite, Meta Ads, Google Ads, herramientas de IA, sistemas de automatización, analítica comercial y ecosistemas multimediales.",
      ],
    },
  ],
};

// Piezas en blanco para el botón "agregar" del dashboard.
export function makeBlankStory() {
  return { id: `story-${Date.now()}`, label: "", cover: "", videos: [] };
}

export function makeBlankRed() {
  return { href: "", icon: "", alt: "" };
}

export function makeBlankSeccion() {
  return { title: "", lines: [""] };
}

// Arma el data URI del .vcf a partir de los datos del contacto.
export function buildVCard(vcard = {}) {
  const datos = { ...defaultContactoConfig.vcard, ...vcard };
  const cuerpo = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${datos.nombre}`,
    `ORG:${datos.organizacion}`,
    `TITLE:${datos.puesto}`,
    `TEL;TYPE=CELL:${datos.telefono}`,
    "END:VCARD",
  ].join("\n");
  return `data:text/vcard;charset=utf-8,${encodeURIComponent(cuerpo)}`;
}

// Combina lo guardado (parcial) con los defaults, por si a la BD le faltan
// claves tras añadir campos nuevos. Degradación elegante.
export function mergeContactoConfig(saved) {
  if (!saved || typeof saved !== "object") return defaultContactoConfig;

  const lista = (valor, porDefecto) =>
    Array.isArray(valor) ? valor : porDefecto;

  return {
    perfil: {
      ...defaultContactoConfig.perfil,
      ...(saved.perfil || {}),
      medios: lista(saved.perfil?.medios, defaultContactoConfig.perfil.medios),
    },
    agencia: { ...defaultContactoConfig.agencia, ...(saved.agencia || {}) },
    stories: lista(saved.stories, defaultContactoConfig.stories),
    redes: lista(saved.redes, defaultContactoConfig.redes),
    asesoria: { ...defaultContactoConfig.asesoria, ...(saved.asesoria || {}) },
    vcard: { ...defaultContactoConfig.vcard, ...(saved.vcard || {}) },
    secciones: lista(saved.secciones, defaultContactoConfig.secciones),
  };
}

import { defaultFlowConfig, mergeFlowConfig } from "./growFlow";

export const defaultGrowConfig = {
  eyebrow: "Grow / Opción A",
  title: "Proyectos que crecen con una idea.",
  flow: defaultFlowConfig,
  projects: [
    {
      slug: "identidad-visual",
      clientLogo: "",
      eyebrow: "Branding",
      title: "Identidad visual",
      action: "Ver proyecto",
      image: "/branding-demo/brand-workspace.jpg",
      summary: "Una identidad construida para crecer con coherencia en cada punto de contacto.",
      body: "Dirección de arte, sistema visual y aplicaciones desarrolladas como una experiencia de marca completa.",
    },
    {
      slug: "experiencias-web",
      clientLogo: "",
      eyebrow: "Digital",
      title: "Experiencias web",
      action: "Ver proyecto",
      image: "/carrusel/A1_escala.webp",
      summary: "Interfaces digitales que convierten una idea en una experiencia clara y memorable.",
      body: "Diseño de producto, interacción y desarrollo reunidos en sistemas digitales con carácter propio.",
    },
    {
      slug: "humans",
      clientLogo: "",
      eyebrow: "Fotografía",
      title: "Humans",
      action: "Ver proyecto",
      image: "/humans/Portadas/P_Humans_recortada.webp",
      summary: "Una exploración visual de identidad, presencia y gesto humano.",
      body: "Serie fotográfica concebida como archivo vivo: retrato, atmósfera y narrativa editorial.",
    },
  ],
};

const cleanProject = (project, fallback, index) => ({
  ...fallback,
  ...(project || {}),
  slug: String(project?.slug || fallback?.slug || `proyecto-${index + 1}`)
    .trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""),
});

export function mergeGrowConfig(saved) {
  if (!saved || typeof saved !== "object") return defaultGrowConfig;
  const projects = Array.isArray(saved.projects) && saved.projects.length
    ? saved.projects.map((project, index) => cleanProject(project, defaultGrowConfig.projects[index] || defaultGrowConfig.projects[0], index))
    : defaultGrowConfig.projects;
  return { ...defaultGrowConfig, ...saved, projects, flow: mergeFlowConfig(saved.flow) };
}

export function makeBlankGrowProject(index = 0) {
  return cleanProject({ title: "Nuevo proyecto", action: "Ver proyecto", image: "/branding-demo/brand-workspace.jpg", clientLogo: "" }, defaultGrowConfig.projects[0], index);
}

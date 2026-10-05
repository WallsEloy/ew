export const disenoProfiles = [
  {
    id: 1,
    name: "Branding",
    logo: "ew_com_B.png",
    avatar: "/perfil/Sin título-1 copia.webp",
    bio: "Diseño Gráfico 🎨\nCreando identidades visuales memorables.\n🔗 linktr.ee/disenografico",
    stats: { posts: 7, followers: "8.5K", following: "120" },
    highlights: [],
    posts: [
      {
        file: "DELIZ.webp",
        text: "Proyecto Deliz 🎨 #branding #design",
      },
      {
        file: "all.webp",
        text: "Logofolio y marcas que inspiran 💡 #logodesign",
      },
      {
        file: "enevesol.webp",
        text: "Desarrollo de identidad para Enevesol ☀️ #identity",
      },
      {
        file: "rejilla portafolio2Mesa de trabajo 1 copia 19.webp",
        text: "Detalles del sistema gráfico 📏 #grid",
      },
      {
        file: "rejilla portafolio2Mesa de trabajo 1 copia 6.webp",
        text: "Exploración tipográfica ✒️ #typography",
      },
      {
        file: "rejilla portafolio2Mesa de trabajo 1 copia 7.webp",
        text: "Aplicaciones de marca y papelería 📝 #mockup",
      },
      {
        file: "yadi.webp",
        text: "Identidad visual Yadi 🌟 #visual identity",
      },
    ]
      .reverse()
      .map((item, i) => ({
        id: i,
        image: `/Branding/${item.file}`,
        likes: Math.floor(Math.random() * 500) + 50,
        isLiked: false,
        isHorizontal: false, // Defaulting to vertical, can be changed later
        caption: item.text,
        comments: [],
      })),
  },
  {
    id: 2,
    name: "Diseño",
    logo: "ew_com_B.png",
    avatar: "/perfil/Sin título-1 copia.webp",
    bio: "Diseño Web 💻\nDesarrollo de experiencias digitales interactivas.\n🔗 linktr.ee/disenoweb",
    stats: { posts: 0, followers: "10.2K", following: "250" },
    highlights: [],
    posts: [],
  },
];

export const profiles = [
  {
    id: 1,
    name: "Humans",
    logo: "ew_com_B.png", // Reemplaza esto con la ruta de tu logo real, ej: "/perfil/mi-logo.png"
    avatar: "/perfil/Sin título-1 copia.webp",
    // Portadas del carrusel de la cabecera; sólo se pintan en escritorio. Viven
    // en public/, que no se versiona: en una máquina nueva hay que copiarlas.
    portadas: ["/humans/Portadas/P_Humans_recortada.webp"],
    bio: "Fotógrafo & Artista Digital 📸\nCapturando la esencia de la ciudad y el diseño.\n🔗 linktr.ee/humans",
    stats: { posts: 25, followers: "14.2K", following: "340" },
    highlights: [
      { id: 1, title: "Tips JS", image: "https://placehold.co/80?text=JS" },
      { id: 2, title: "Setup", image: "https://placehold.co/80?text=PC" },
      { id: 3, title: "Viajes", image: "https://placehold.co/80?text=Vuelo" },
    ],
    // Lista con las 25 imágenes encontradas en la carpeta 'public/humans' y sus textos personalizados
    posts: [
      {
        file: "nft mark copia.webp",
        text: "¡Bienvenidos a mi nuevo portafolio interactivo! 🌟 #new #portfolio",
        // Añade layout: "horizontal" para que este post abarque de lado a lado
      },
      {
        file: "DSC_0005.webp",
        text: "Momentos capturados en la ciudad. El contraste de las sombras. 🏙️ #cityphotography",
        // Al no poner layout, se asume el vertical normal por defecto.
        // Puedes agregar layout: "vertical" si quieres que sea más obvio.
      },
      {
        file: "DSC_0033.webp",
        text: "Día de shooting exterior, aprovechando la luz natural al máximo ☀️ #light",
        layout: "horizontal", // Al igual que arriba, hacemos este post horizontal
      },
      {
        file: "DSC_0061 copia.webp",
        text: "Un enfoque diferente para mostrar texturas. ¿Qué les parece? 🎨 #textures",
        layout: "horizontal", // Al igual que arriba, hacemos este post horizontal
      },
      {
        file: "DSC_0173 copia.webp",
        text: "Minimalismo en su máxima expresión. Menos es siempre más. ◾ #minimal",
      },
      {
        file: "DSC_0222.webp",
        text: "Jugando con los ángulos y la perspectiva de este increíble espacio. 📐 #architecture",
      },
      {
        file: "DSC_0227.webp",
        text: "Retrato en estado puro. La mirada lo dice todo. 👁️ #portrait",
      },
      {
        file: "DSC_0245.webp",
        text: "Detalles que hacen la diferencia en el encuadre perfecto. 🔎 #details",
        // Al igual que arriba, hacemos este post horizontal
      },
      {
        file: "DSC_0437 copia.webp",
        text: "Paisaje de fin de semana, buscando inspiración lejos del caos. 🌲 #nature",
      },
      {
        file: "DSC_4862.webp",
        text: "Sesión de estudio: preparando el montaje de luces. 💡 #bts #studio",
      },
      {
        file: "DSC_4864.webp",
        text: "Pruebas de iluminación creativa con geles de color. 🌈 #color",
      },
      {
        file: "DSC_4867Mesa de trabajo 1.webp",
        text: "En proceso de edición, armando la mesa de trabajo digital. 💻 #editing",
      },
      {
        file: "DSC_4941.webp",
        text: "Capturando el movimiento en el momento exacto. 🏃‍♂️ #action",
      },
      {
        file: "DSC_4957.webp",
        text: "Tonalidades cálidas para transmitir energía en la toma. 🔥 #warm",
      },
      {
        file: "DSC_5045.webp",
        text: "Explorando la fotografía blanco y negro una vez más. 📸 #bw",
      },
      {
        file: "DSC_5093.webp",
        text: "El arte de contar una historia en una sola fracción de segundo. 📖 #story",
      },
      {
        file: "DSC_7060.webp",
        text: "Magia nocturna: fotografía de larga exposición. 🌌 #night",
      },
      {
        file: "IMG_9233B copia.webp",
        text: "Proyecto alterno finalizado con éxito. ¡Muy contento con los resultados! 🎉 #done",
      },
      {
        file: "_DSC0206.webp",
        text: "Reflejos inesperados que crean composiciones únicas. 🪞 #reflections",
      },
      {
        file: "_DSC0442 copia.webp",
        text: "Conectando elementos en la naturaleza urbana. 🍂 #urban",
      },
      {
        file: "b.webp",
        text: "Experimentando con nuevos filtros y paletas de color en post-producción. 🖌️ #post",
      },
      {
        file: "c (1).webp",
        text: "Una perspectiva aérea que cambia por completo el panorama. 🚁 #drone",
      },
      {
        file: "c.webp",
        text: "Encontrando simetría en lugares donde no la esperarías. ⚖️ #symmetry",
      },
      {
        file: "muestra de nft.webp",
        text: "Adentrándome al mundo del criptoarte digital y Coleccionables. 💎 #nft #crypto",
      },
      {
        file: "_DSC0442 copia.webp",
        text: "Prueba de concepto de arte interactivo. 🤖 #digitalart",
        layout: "horizontal", // Al igual que arriba, hacemos este post horizontal
      },
    ]
      .reverse()
      .map((item, i) => ({
        id: i,
        image: `/humans/${item.file}`, // Ruta accesible vía web
        likes: Math.floor(Math.random() * 500) + 50,
        isLiked: false,
        // Si el post define explícitamente "horizontal", lo pasamos; si no, queda false.
        isHorizontal: item.layout === "horizontal",
        caption: item.text, // Usamos el texto individual asignado a la foto
        comments: [
          { id: 1, user: "photo_fan", text: "¡Gran toma! 👏" },
          { id: 2, user: "creativexyz", text: "Me encanta la iluminación 💡" },
        ],
      })),
  },
  {
    id: 2,
    name: "IceCream",
    avatar: "https://placehold.co/100",
    highlights: [
      { id: 1, title: "Eventos", image: "https://placehold.co/80?text=Evt" },
      { id: 2, title: "Vlogs", image: "https://placehold.co/80?text=Vlog" },
    ],
    posts: Array.from({ length: 10 }, (_, i) => ({
      id: i,
      image: `https://placehold.co/600x750?text=CF+${i + 1}`,
      likes: Math.floor(Math.random() * 100) + 10,
      isLiked: false,
      caption: `Vibras creativas para arrancar la semana ✨ #creativeflow #art`,
      comments: [
        {
          id: 1,
          user: "art_lover",
          text: "Me encanta esta paleta de colores 😍",
        },
      ],
    })),
  },
  {
    id: 3,
    name: "Sketch",
    logo: "ew_com_B.png",
    avatar: "/perfil/Sin título-1 copia.webp",
    bio: "Sketch Art & Illustration ✏️\nExplorando ideas en diferentes técnicas.\n🔗 linktr.ee/sketch",
    stats: { posts: 8, followers: "5.1K", following: "89" },
    highlights: [],
    posts: [
      {
        file: "cuadros2Mesa de trabajo 2 copia 2.webp",
        text: "Explorando nuevas formas ✏️ #sketch",
      },
      {
        file: "cuadros2Mesa de trabajo 2 copia.webp",
        text: "Trazos sueltos y expresivos 🎨 #illustration",
      },
      {
        file: "cuadros2Mesa de trabajo 2.webp",
        text: "Detalles del proceso creativo 💡 #wip",
      },
      {
        file: "cuadros4Mesa de trabajo 2 copia 2.webp",
        text: "Composición y equilibrio en este nuevo sketch 📐 #design",
      },
      {
        file: "cuadros4Mesa de trabajo 2 copia 3.webp",
        text: "Jugando con contrastes y sombras 🌑 #art",
      },
      {
        file: "cuadros4Mesa de trabajo 2 copia.webp",
        text: "Un vistazo a mi libreta de bocetos 📖 #sketchbook",
      },
      {
        file: "cuadros4Mesa de trabajo 2.webp",
        text: "Ideas abstractas tomando forma ✨ #abstract",
      },
      {
        file: "cuadrosMesa de trabajo 2.webp",
        text: "Arte conceptual en desarrollo 🚀 #conceptart",
      },
    ]
      .reverse()
      .map((item, i) => ({
        id: i,
        image: `/sketch/${item.file}`,
        likes: Math.floor(Math.random() * 500) + 50,
        isLiked: false,
        isHorizontal: false, // Default to vertical
        caption: item.text,
        comments: [],
      })),
  },
  {
    id: 4,
    name: "Fotografia",
    logo: "ew_com_B.png",
    avatar: "/perfil/Sin título-1 copia.webp",
    bio: "Fotografía Profesional 📸\nExplorando el mundo a través de la lente.\n🔗 linktr.ee/fotografia",
    stats: { posts: 9, followers: "12.4K", following: "450" },
    highlights: [],
    posts: [
      {
        file: "sol2Mesa de trabajo 1 copia 2.webp",
        text: "Luz y sombra 🌘 #photography",
      },
      {
        file: "sol2Mesa de trabajo 1 copia 6.webp",
        text: "Explorando texturas naturales 🍃 #nature",
      },
      {
        file: "sol2Mesa de trabajo 1 copia 7.webp",
        text: "Composición minimalista 🖼️ #minimal",
      },
      {
        file: "sol2Mesa de trabajo 1 copia 8.webp",
        text: "Colores del atardecer 🌅 #sunset",
      },
      {
        file: "sol2Mesa de trabajo 1 copia.webp",
        text: "Reflejos urbanos 🏙️ #city",
      },
      {
        file: "sol2Mesa de trabajo 1.webp",
        text: "Capturando el momento exacto ⏱️ #timing",
      },
      {
        file: "sol3Mesa de trabajo 1 copia 7.webp",
        text: "Perspectiva diferente 📸 #angle",
      },
      {
        file: "sol3Mesa de trabajo 1 copia 8.webp",
        text: "Magia en la edición ✨ #edit",
      },
      {
        file: "sol3Mesa de trabajo 1 copia.webp",
        text: "Sesión de estudio terminada 📸 #studio",
      },
    ]
      .reverse()
      .map((item, i) => ({
        id: i,
        image: `/fotografia/${item.file}`,
        likes: Math.floor(Math.random() * 500) + 50,
        isLiked: false,
        isHorizontal: false, // Default to vertical
        caption: item.text,
        comments: [],
      })),
  },
  {
    id: 5,
    name: "Anacronismo",
    logo: "ew_com_B.png",
    avatar: "/perfil/Sin título-1 copia.webp",
    bio: "Anacronismo Art ⏳\nMezclando el pasado con el futuro.\n🔗 linktr.ee/anacronismo",
    stats: { posts: 0, followers: "3.2K", following: "15" },
    highlights: [],
    posts: [],
  },
];

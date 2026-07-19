const nodeIds = Array.from({ length: 72 }, (_, index) => `n${index + 1}`);

const sizes = [
  18, 15, 17, 14, 20, 16, 15, 23, 16, 17, 19, 14, 17, 18, 17, 15,
  16, 18, 15, 17, 13, 16, 12, 18, 14, 15, 17, 12, 16, 14, 18, 13,
  14, 17, 13, 16, 12, 18, 15, 13,
];

const createNodes = (coordinates) => {
  const [hubX, hubY] = coordinates[7];
  const orbitNodes = Array.from({ length: 52 }, (_, index) => {
    const angle = (index / 52) * Math.PI * 2 - Math.PI / 22;
    const radius = index % 6 === 0 ? 735 : index % 3 === 0 ? 650 : index % 2 === 0 ? 565 : 610;
    return [
      hubX + Math.cos(angle) * radius,
      hubY + Math.sin(angle) * radius,
    ];
  });
  const allCoordinates = [...coordinates, ...orbitNodes];

  return nodeIds.map((id, index) => ({
    id,
    x: allCoordinates[index][0],
    y: allCoordinates[index][1],
    size: sizes[index] ?? 12 + ((index * 5) % 7),
  }));
};

export const graphEdges = nodeIds
  .filter((nodeId) => nodeId !== "n8")
  .map((nodeId) => ["n8", nodeId]);

export const visualGraphScenes = [
  {
    id: "connections",
    eyebrow: "GRAFOS VISUALES",
    title: "Conexiones",
    text: "Toda idea comienza como un punto aislado. Su valor aparece cuando encuentra una conexión.",
    activeNodes: ["n8"],
    highlightedNodes: ["n1", "n5", "n9", "n13", "n17", "n25"],
    accent: "#35d07f",
    nodes: createNodes([
      [190, 135], [340, 85], [505, 100], [650, 175], [105, 290],
      [95, 455], [255, 265], [400, 375], [555, 245], [690, 325],
      [245, 455], [130, 600], [335, 585], [510, 485], [650, 525],
      [720, 650], [350, 705], [185, 710], [515, 725], [610, 635],
    ]),
  },
  {
    id: "affinities",
    eyebrow: "GRAFOS VISUALES",
    title: "Afinidades",
    text: "Las afinidades reúnen conceptos, personas y posibilidades que parecían independientes.",
    activeNodes: ["n5", "n8", "n11", "n14"],
    highlightedNodes: ["n5", "n11", "n14", "n22", "n34"],
    accent: "#35d07f",
    nodes: createNodes([
      [120, 180], [230, 125], [565, 125], [680, 190], [245, 305],
      [115, 390], [355, 245], [410, 365], [575, 275], [690, 380],
      [280, 495], [145, 570], [395, 575], [505, 485], [630, 555],
      [710, 650], [335, 690], [180, 700], [485, 720], [590, 655],
    ]),
  },
  {
    id: "expansion",
    eyebrow: "GRAFOS VISUALES",
    title: "Expansión",
    text: "Una conexión puede convertirse en una red que crece, cambia y abre nuevas direcciones.",
    activeNodes: ["n8", "n9", "n10", "n14", "n15", "n16"],
    highlightedNodes: ["n9", "n10", "n14", "n15", "n16", "n42"],
    accent: "#35d07f",
    nodes: createNodes([
      [75, 90], [220, 160], [430, 80], [710, 130], [110, 310],
      [55, 540], [290, 270], [435, 350], [610, 260], [755, 340],
      [205, 470], [65, 710], [330, 610], [515, 510], [675, 555],
      [770, 720], [275, 750], [140, 635], [470, 735], [590, 670],
    ]),
  },
  {
    id: "movement",
    eyebrow: "GRAFOS VISUALES",
    title: "Movimiento",
    text: "El centro no es permanente. La atención transforma la manera en que interpretamos el sistema.",
    activeNodes: ["n13", "n14", "n17", "n19", "n20"],
    highlightedNodes: ["n13", "n14", "n17", "n19", "n20"],
    accent: "#35d07f",
    nodes: createNodes([
      [155, 105], [320, 85], [510, 155], [700, 105], [100, 330],
      [220, 405], [365, 255], [515, 335], [665, 260], [730, 440],
      [310, 480], [120, 590], [300, 625], [455, 550], [620, 570],
      [730, 690], [390, 700], [205, 745], [500, 755], [590, 675],
    ]),
  },
  {
    id: "system",
    eyebrow: "GRAFOS VISUALES",
    title: "Sistema",
    text: "Cada parte conserva su identidad, pero el significado final pertenece al conjunto.",
    activeNodes: ["n5", "n8", "n11", "n14", "n17", "n20"],
    highlightedNodes: ["n5", "n11", "n14", "n17", "n20", "n55"],
    accent: "#35d07f",
    nodes: createNodes([
      [150, 130], [300, 95], [475, 115], [650, 155], [165, 310],
      [80, 455], [315, 270], [430, 355], [585, 285], [710, 405],
      [250, 475], [120, 630], [350, 590], [500, 510], [640, 565],
      [720, 700], [300, 705], [155, 745], [470, 735], [585, 660],
    ]),
  },
];

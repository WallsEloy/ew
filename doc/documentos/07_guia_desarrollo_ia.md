# 📑 Sección 7: Guía de Desarrollo para Asistentes de IA

Este documento detalla las directrices de codificación, pautas de diseño visual premium y reglas de desarrollo para cualquier asistente de inteligencia artificial (como Claude o Antigravity) que colabore en el proyecto.

---

## 🎨 Criterios de Diseño Visual (Aesthetics)

> [!IMPORTANT]
> El diseño web en este repositorio debe sentirse premium, moderno e interactivo. Cualquier componente nuevo o modificado debe seguir estas pautas:

1. **Uso de Colores Curados**: Evita colores primarios simples de la paleta básica de CSS (ej. rojo, azul, verde planos). Usa esquemas de colores HSL bien integrados o degradados progresivos oscuros (ej. fucsia, morado oscuro, oro apagado).
2. **Interactividad Vivaz**: Todo elemento interactivo (botones, inputs, imágenes clickeables) debe tener estados bien marcados:
   - Efectos hover (escalados sutiles `hover:scale-105`, transiciones de brillo).
   - Animaciones usando **Framer Motion** para transiciones fluidas de entrada y salida de elementos.
3. **No usar Placeholders**: Si necesitas añadir recursos o demostraciones en el desarrollo, crea gráficos interactivos con CSS/SVG limpios o solicita la generación de imágenes optimizadas para la estética del portafolio.

---

## 🛠️ Reglas de Codificación para la IA

### 1. Integridad del Código Existente
- Conserva todos los comentarios, explicaciones de variables, tipos de TypeScript y documentación JSDoc que no estén involucrados en la lógica que vas a reescribir.
- Mantén el formato y la indentación definidos en el proyecto.

### 2. Estructura de Componentes
- **Lógica Cliente-Servidor**: Separa adecuadamente los componentes que requieren interacción (marcados con `"use client"`) de los componentes de servidor que realizan lecturas directas o consultas optimizadas.
- **Estilos Modulares**: Si un estilo requiere alta especificidad o animaciones css complejas aisladas, utiliza archivos `.module.css` (como el del [Navbar.module.css](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/components/Navbar.module.css)). Para el resto de componentes genéricos, utiliza las clases utilitarias de Tailwind CSS.

### 3. Buenas Prácticas de Rutas y SEO
- Cada nueva página o ruta debe incluir metadatos SEO adecuados de manera nativa (`export const metadata = { ... }`).
- Usa etiquetas HTML semánticas (`<main>`, `<header>`, `<footer>`, `<section>`) para estructurar correctamente las páginas.

---

## 📁 Ubicación Clave de las Directrices de IA

El archivo general que define estas directrices de forma resumida para cargarse en prompts iniciales se encuentra en la carpeta raíz de documentación:
*   **[Reglas Generales de IA (claude.md)](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/doc/claude.md)**.

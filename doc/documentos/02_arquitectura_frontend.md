# 📑 Sección 2: Arquitectura del Frontend

Esta sección detalla cómo está estructurada la interfaz de usuario en el frontend, el sistema de rutas dinámicas de Next.js, la navegación y los componentes principales.

---

## 🧭 Sistema de Enrutamiento (Next.js App Router)

El enrutamiento está basado en archivos dentro del directorio [app/](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/app). Cada subcarpeta representa un segmento de ruta:

| Segmento de Ruta | Tipo de Página | Archivo Principal |
| :--- | :--- | :--- |
| `/` | Landing Principal | [app/page.jsx](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/app/page.jsx) |
| `/galeria` | Portafolio Artístico | [app/galeria/page.jsx](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/app/galeria/page.jsx) |
| `/diseno` | Portafolio de Diseño | [app/diseno/page.jsx](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/app/diseno/page.jsx) |
| `/contacto` | Formulario de Contacto | [app/contacto/page.jsx](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/app/contacto/page.jsx) |
| `/dashboard` | Panel de Control de Usuario | `app/dashboard/page.jsx` |
| `/login` | Inicio de Sesión | `app/login/page.jsx` |
| `/register` | Registro de Usuario | `app/register/page.jsx` |

---

## 🧭 Barra de Navegación ([Navbar.jsx](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/components/Navbar.jsx))

La barra de navegación es fija (`fixed`) y se carga globalmente a través del archivo de diseño principal [app/layout.jsx](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/app/layout.jsx). Sus características clave son:
1. **Acceso de Usuarios**: Botones superiores para Login y Registro estilizados con el color de acento principal `#00aff0` (azul característico).
2. **Línea Central de Marca**: Un divisor visual blanco con el nombre del artista en espaciado amplio: `e l o y  w a l l s`.
3. **Menús Desplegables**:
   - **Galerías**: Enlaza a subcategorías como *Humans*, *Ice Cream*, *Sketch*, *Fotografía* y *Anacronismo*.
   - **Diseño**: Clasifica el trabajo en *Gráfico* y *Web*.
   - **Eventos** y **Shopping**: Permite accesos rápidos para compras y asistencia.
4. **Responsividad**: Un menú tipo hamburguesa personalizado que se desliza en dispositivos móviles.

---

## 🎠 Componente de Portada ([HomeCarousel.jsx](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/components/HomeCarousel.jsx))

El carrusel dinámico es el núcleo visual de la landing page. Está implementado con:
- **Autoplay**: Un intervalo automático que cambia de slide cada `5000ms` (5 segundos).
- **Navegación por Teclado**: Soporte nativo para alternar diapositivas usando las flechas izquierda (`ArrowLeft`) y derecha (`ArrowRight`).
- **Navegación por Puntos**: Indicadores circulares flotantes en el fondo que permiten saltar a diapositivas específicas al hacer clic.
- **Efectos de Brillo (Background Glows)**: Orbes difusos de color fucsia y morado colocados en el fondo con desenfoque extremo (`blur-[120px]`) para generar profundidad.
- **Marco Estático**: Un marco de borde grueso blanco (`border-[15px] bg-white`) que sirve como ventana de exhibición artística.
- **Estructura del Slide**: Cada diapositiva contiene:
  1. Título y botón de acción a la izquierda.
  2. Imagen del portafolio centrada que sobresale verticalmente.
  3. Descripción del proyecto a la derecha con un color de acento representativo.

---

> [!NOTE]
> Para el renderizado de estilos, el carrusel utiliza clases de Tailwind CSS, mientras que la navegación utiliza una mezcla de utilidades Tailwind y un archivo CSS Module ([Navbar.module.css](file:///C:/REPOS/EloyWasll%20dashboard/portafolio%20STUDIO/EW/components/Navbar.module.css)) para controlar la animación de las hamburguesas y los submenús de forma aislada.

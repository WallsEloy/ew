// Las etiquetas 3D de React Three Fiber (<group>, <points>, <mesh>…).
// R3F 8 las declara en el JSX global, pero con @types/react 19 el JSX vive en
// React.JSX; esta declaración las conecta.
import type { ThreeElements } from "@react-three/fiber";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends ThreeElements {}
  }
}

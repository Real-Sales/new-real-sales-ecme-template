import { ThreeElements } from '@react-three/fiber';

declare module '@react-three/fiber' {
  interface ThreeElements {
    points: ThreeElements['mesh'];
    shaderMaterial: any;
    ambientLight: any;
    primitive: any;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      primitive: any;
      ambientLight: any;
      points: any;
      shaderMaterial: any;
    }
  }
}

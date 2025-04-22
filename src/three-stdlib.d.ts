// src/three-stdlib.d.ts

declare module "three/examples/jsm/loaders/MTLLoader" {
    export class MTLLoader extends THREE.Loader {
      setMaterialOptions(options: any): this;
      preload(): void;
      load(
        url: string,
        onLoad: (materialCreator: any) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void
      ): void;
    }
  }
  
  declare module "three/examples/jsm/loaders/OBJLoader" {
    export class OBJLoader extends THREE.Loader {
      setMaterials(materials: any): this;
      load(
        url: string,
        onLoad: (object: THREE.Group) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void
      ): void;
    }
  }
  
  declare module "three/examples/jsm/controls/OrbitControls" {
    export class OrbitControls extends THREE.EventDispatcher {
      constructor(object: THREE.Camera, domElement?: HTMLElement);
      enabled: boolean;
      target: THREE.Vector3;
      update(): void;
      enableDamping: boolean;
    }
  }
  


import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class ThreeBase {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;

  constructor() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    const light = new THREE.AmbientLight(0xffffff);
    this.scene.add(light);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    const axesHelper = new THREE.AxesHelper(2);
    this.scene.add(axesHelper);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  start = () => {
    this.animate();
  };

  cleanup = () => {
    document.body.removeChild(this.renderer.domElement);
  };
}

export class ModelLoader {
  static loadModel(scene: THREE.Scene, mtlPath: string, objPath: string) {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(mtlPath, (materials: any) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(objPath, (object: any) => {
        scene.add(object);
      });
    });
  }
}

export class LineDrawer {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private enabled: boolean = false;
  private points: THREE.Vector3[] = [];
  private allPoints: { x: number; y: number }[] = [];
  private handleClickBound: (event: MouseEvent) => void;

  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.handleClickBound = this.handleClick.bind(this);
  }

  private handleClick(event: MouseEvent) {
    if (event.target !== this.renderer.domElement) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;

      if (this.points.length < 2) {
        this.points.push(point.clone());
        console.log(` Point ${this.points.length}:`, point);
      }

      if (this.points.length === 2) {
        const [p1, p2] = this.points;
        const distance = p1.distanceTo(p2);

        if (distance < 0.1) {
          console.warn("⚠ Distance too short.");
          this.points = [];
          return;
        }

        // Draw line
        const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);

        const deltaX = p2.x - p1.x;
        const deltaY = p2.y - p1.y;

        if (deltaX === 0) {
          console.warn(" Vertical line detected.");
          this.points = [];
          return;
        }

        const slope = deltaY / deltaX;
        const stepSize = distance >= 1 ? 0.5 : 0.2;
        const step = p1.x < p2.x ? stepSize : -stepSize;

        this.allPoints = [];

        // Include first point
        this.allPoints.push({ x: parseFloat(p1.x.toFixed(2)), y: parseFloat(p1.y.toFixed(2)) });

        // Intermediate points
        for (let x = p1.x + step; Math.abs(x - p2.x) >= stepSize / 2; x += step) {
          const y = p1.y + slope * (x - p1.x);
          this.allPoints.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
        }

        // Include second point
        this.allPoints.push({ x: parseFloat(p2.x.toFixed(2)), y: parseFloat(p2.y.toFixed(2)) });

        console.log(" Full point array (including initial):", this.allPoints);
        this.points = [];
      }
    }
  }

  enable() {
    if (!this.enabled) {
      window.addEventListener("click", this.handleClickBound);
      this.enabled = true;
      this.points = [];
      console.log(" Line drawing enabled");
    }
  }

  disable() {
    if (this.enabled) {
      window.removeEventListener("click", this.handleClickBound);
      this.enabled = false;
      this.points = [];
      console.log(" Line drawing disabled");
    }
  }

  toggle() {
    this.enabled ? this.disable() : this.enable();
  }

  isEnabled() {
    return this.enabled;
  }

  getPoints() {
    return this.allPoints;
  }
}

export class ElevationProfile {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private raycaster: THREE.Raycaster;

  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.raycaster = new THREE.Raycaster();
  }

  // Use 2D screen points (like mouse clicks)
  generateFromScreenPoints(points: { x: number; y: number }[]) {
    if (!points || points.length === 0) {
      console.warn("⚠️ No screen points provided.");
      return;
    }

    for (const screenPoint of points) {
      // Convert screen (pixel) to normalized device coordinates (-1 to +1)
      const mouse = new THREE.Vector2(
        (screenPoint.x / this.renderer.domElement.clientWidth) * 2 - 1,
        -(screenPoint.y / this.renderer.domElement.clientHeight) * 2 + 1
      );

      // Set ray from camera using mouse position
      this.raycaster.setFromCamera(mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length > 0) {
        console.log("📍 Intersection at:", intersects[0].point);
      } else {
        console.warn("❌ No intersection found for screen point:", screenPoint);
      }
    }
  }

  // Still keeping your original function for direct XYZ coordinates
  generateFromPoints(points: { x: number; y: number }[]) {
    if (!points || points.length === 0) {
      console.warn("⚠️ No points provided.");
      return;
    }
  
    const down = new THREE.Vector3(0, 0, -1); // Negative Z
    const up = new THREE.Vector3(0, 0, 1); // Positive Z
  
    const intersectionResults: THREE.Vector3[] = [];
  
    points.forEach((point, index) => {
      const origin = new THREE.Vector3(point.x, point.y, 0); // Assuming z = 0
  
      // Try downward direction
      this.raycaster.set(origin, down);
      let intersects = this.raycaster.intersectObjects(this.scene.children, true);
  
      if (intersects.length > 0) {
        console.log(` [${index}] Downward intersection at:`, intersects[0].point);
        intersectionResults.push(intersects[0].point);
        return;
      }
  
      // Try upward direction
      this.raycaster.set(origin, up);
      intersects = this.raycaster.intersectObjects(this.scene.children, true);
  
      if (intersects.length > 0) {
        console.log(` [${index}] Upward intersection at:`, intersects[0].point);
        intersectionResults.push(intersects[0].point);
      } else {
        console.warn(` [${index}] No intersection found in Z direction.`);
        // Optional: Push null or placeholder if needed
      }
    });
  
    // Optional: Do something with intersectionResults array
    console.log("All intersections:", intersectionResults);
  }
}

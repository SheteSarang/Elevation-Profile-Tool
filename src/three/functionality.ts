import * as THREE from "three";
import Plotly from "plotly.js-dist";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import store from "../store/store";
// import { setIselevationProfiledone } from "../store/angleSlice";
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
    const baseDiv = document.getElementById("base-div");
    if (baseDiv) {
      baseDiv.appendChild(this.renderer.domElement);
    } else {
      console.error("Element with ID 'base-div' not found in the document.");
    }

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
  private elevationProfile: ElevationProfile; // Add ElevationProfile instance
  private handleClickBound: (event: MouseEvent) => void;
  static iselevationProfiledone: boolean = false; // Flag to check if elevation profile is done

  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.elevationProfile = new ElevationProfile(scene, camera, renderer, (coordinates) => {
      console.log("Final coordinates:", coordinates);
    }); // Initialize ElevationProfile
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
        console.log(`✅ Point ${this.points.length}:`, point);
      }

      if (this.points.length === 2) {
        const [p1, p2] = this.points;
        const distance = p1.distanceTo(p2);

        if (distance < 0.1) {
          console.warn("⚠️ Distance too short.");
          this.points = [];
          return;
        }

        // Draw white line
        const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);

        const deltaX = p2.x - p1.x;
        const deltaY = p2.y - p1.y;

        if (deltaX === 0) {
          console.warn("⚠️ Vertical line detected.");
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

        console.log("📌 Full point array (including initial):", this.allPoints);

        // Delay before drawing the elevation profile
        setTimeout(() => {
          this.elevationProfile.generateFromPoints(this.allPoints);
        }, 500); // 500ms delay

        this.points = [];
      }
    }
  }

  enable() {
    if (!this.enabled) {
      window.addEventListener("click", this.handleClickBound);
      this.enabled = true;
      console.log("🟢 Line drawing enabled");
    }
  }

  disable() {
    if (this.enabled) {
      window.removeEventListener("click", this.handleClickBound);
      this.enabled = false;
      console.log("🔴 Line drawing disabled");
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
  private labeledPoints: { label: string; x: string; z: string }[] = [];
  private setFinalCoordinates: (coordinates: { label: string; x: string; z: string }[]) => void;

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    setFinalCoordinates: (coordinates: { label: string; x: string; z: string }[]) => void
  ) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.raycaster = new THREE.Raycaster();
    this.setFinalCoordinates = setFinalCoordinates; // Store the callback
  }

  // Use 2D screen points (like mouse clicks)
  generateFromScreenPoints(points: { x: number; y: number }[]) {
    if (!points || points.length === 0) {
      console.warn("⚠️ No screen points provided.");
      return;
    }

    for (const screenPoint of points) {
      const mouse = new THREE.Vector2(
        (screenPoint.x / this.renderer.domElement.clientWidth) * 2 - 1,
        -(screenPoint.y / this.renderer.domElement.clientHeight) * 2 + 1
      );

      this.raycaster.setFromCamera(mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length > 0) {
        console.log("📍 Intersection at:", intersects[0].point);
      } else {
        console.warn("❌ No intersection found for screen point:", screenPoint);
      }
    }
  }

  // Raycasting on 2D world XY points to find terrain Z
  generateFromPoints(points: { x: number; y: number }[]) {
    if (!points || points.length === 0) {
      console.warn("⚠️ No points provided.");
      return;
    }

    const down = new THREE.Vector3(0, 0, -1);
    const up = new THREE.Vector3(0, 0, 1);

    const intersectionResults: THREE.Vector3[] = [];

    points.forEach((point, index) => {
      const origin = new THREE.Vector3(point.x, point.y, 0);

      this.raycaster.set(origin, down);
      let intersects = this.raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length > 0) {
        console.log(`🔽 [${index}] Downward intersection at:`, intersects[0].point);
        intersectionResults.push(intersects[0].point);
        return;
      }

      this.raycaster.set(origin, up);
      intersects = this.raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length > 0) {
        console.log(`🔼 [${index}] Upward intersection at:`, intersects[0].point);
        intersectionResults.push(intersects[0].point);
      } else {
        console.warn(`❌ [${index}] No intersection found in Z direction.`);
      }
    });

    if (intersectionResults.length > 1) {
      this.draw3DCurve(intersectionResults);
      this.plotElevationProfile(intersectionResults); // Call the new method to plot the graph
    }

    console.log("✅ All intersections:", intersectionResults);
  }

  // 🔧 Bold 3D curved path from points
  private draw3DCurve(points: THREE.Vector3[]) {
    if (points.length < 2) {
      console.warn("⚠️ Not enough points to draw a curve.");
      return;
    }

    const curve = new THREE.CatmullRomCurve3(points);
    curve.curveType = 'centripetal';
    curve.closed = false;

    const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.1, 8, false);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      transparent: true,
      opacity: 0.9
    });

    const mesh = new THREE.Mesh(tubeGeometry, material);
    mesh.name = 'elevationCurve';

    // Remove previous curve if it exists
    const old = this.scene.getObjectByName('elevationCurve');
    if (old) {
      this.scene.remove(old);
    }

    this.scene.add(mesh);
  }

  // 📊 Plot elevation profile using Plotly
  public plotElevationProfile(intersectionResults: THREE.Vector3[]) {
    const x_coords = intersectionResults.map((point) => point.x);
    const z_coords = intersectionResults.map((point) => point.z);

    // Create a labeled object for all points
    this.labeledPoints = intersectionResults.map((point, index) => ({
      label: `Point${index + 1}`,
      x: point.x.toFixed(2),
      z: point.z.toFixed(2),
    }));

    console.log("Labeled Points:", this.labeledPoints); // Log the labeled points

    // Update the finalCoordinates state in CallingFn.tsx
    this.setFinalCoordinates(this.labeledPoints);

    const data = [
      {
        x: x_coords,
        y: z_coords,
        mode: "lines+markers",
        name: "Elevation Profile",
        type: "scatter",
        text: this.labeledPoints.map((point) => `${point.label} (${point.x}, ${point.z})`), // Add labels to hover text
        hovertemplate: "%{text}<extra></extra>", // Custom hover template
      },
    ];

    const layout = {
      title: "Elevation Profile",
      xaxis: { title: "Distance (units)" },
      yaxis: { title: "Elevation (units)" },
    };

    // Render the graph in a new div
    const graphDiv = document.createElement("div");
    graphDiv.id = "elevation-profile-graph";
    document.body.appendChild(graphDiv);

    Plotly.newPlot(graphDiv, data, layout);

    LineDrawer.iselevationProfiledone = true; // Set the flag to true after plotting
    console.log("iselevationprofiledone:", LineDrawer.iselevationProfiledone);

  }

  getLabeledPoints() {
    console.log("Labeled Points from getLabeledPoints:", this.labeledPoints);
    return this.labeledPoints;
  }
}





export class AngleCalculate {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private points: THREE.Vector3[];
  private handleClickBound: (event: MouseEvent) => void;

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer
  ) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.points = [];
    this.handleClickBound = this.handleClick.bind(this);
  }

  /** Start listening for clicks */
  enable() {
    window.addEventListener("click", this.handleClickBound);
    console.log("🟢 Click to select points (2 clicks draws first line, 3rd click draws second + angle)");
  }

  /** Stop listening and reset state */
  disable() {
    window.removeEventListener("click", this.handleClickBound);
    console.log(" Click listener removed");
    this.points = [];
  }

  /** Handle each click on the canvas */
  private handleClick(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    if (!intersects.length) return;

    const point = intersects[0].point.clone();
    this.points.push(point);
    console.log(` Point ${this.points.length}:`, point);

    if (this.points.length === 2) {
      // Draw first segment between point1 and point2
      this.drawLine(this.points[0], this.points[1]);
      console.log(" Line drawn between points 1 and 2");
    }
    else if (this.points.length === 3) {
      // Draw second segment between point2 and point3
      this.drawLine(this.points[1], this.points[2]);
      console.log(" Line drawn between points 2 and 3");

      // Calculate angle at point2
      const angle = this.calculateAngle(this.points[0], this.points[1], this.points[2]);
      console.log(`Angle between 2 lines: ${angle.toFixed(2)}°`);

      // Reset for next measurement
      this.points = [];
      console.log(" Ready for next measurement");
    }
  }

  /** Draw a single line segment between two 3D points */
  private drawLine(pA: THREE.Vector3, pB: THREE.Vector3) {
    const geometry = new THREE.BufferGeometry().setFromPoints([pA, pB]);
    const material = new THREE.LineBasicMaterial({
      color: 0xff0000,
      depthTest: false,
      transparent: true,
      opacity: 1.0,
    });
    const line = new THREE.Line(geometry, material);
    line.renderOrder = 999;
    this.scene.add(line);
  }

  /** Calculate the angle at p2 between segments p1→p2 and p3→p2 */
  private calculateAngle(
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    p3: THREE.Vector3
  ): number {
    // Vector from p2 to p1
    const v1 = new THREE.Vector3().subVectors(p1, p2).normalize();
    // Vector from p2 to p3
    const v2 = new THREE.Vector3().subVectors(p3, p2).normalize();
    // Dot product = cos(theta) for normalized vectors
    const dot = THREE.MathUtils.clamp(v1.dot(v2), -1, 1);
    const angleRad = Math.acos(dot);
    return THREE.MathUtils.radToDeg(angleRad);
  }
}

  


// export class AngleCalculate {
//   private scene: THREE.Scene;
//   private camera: THREE.Camera;
//   private renderer: THREE.WebGLRenderer;
//   private raycaster: THREE.Raycaster;
//   private mouse: THREE.Vector2;
//   private points: THREE.Vector3[];
//   private handleClickBound: (event: MouseEvent) => void;

//   constructor(
//     scene: THREE.Scene,
//     camera: THREE.Camera,
//     renderer: THREE.WebGLRenderer
//   ) {
//     this.scene = scene;
//     this.camera = camera;
//     this.renderer = renderer;
//     this.raycaster = new THREE.Raycaster();
//     this.mouse = new THREE.Vector2();
//     this.points = [];
//     this.handleClickBound = this.handleClick.bind(this);
//   }

//   enable() {
//     window.addEventListener("click", this.handleClickBound);
//     console.log("🟢 Click to select points");
//   }

//   disable() {
//     window.removeEventListener("click", this.handleClickBound);
//     console.log("🔴 Click listener removed");
//   }

//   private handleClick(event: MouseEvent) {
//     const rect = this.renderer.domElement.getBoundingClientRect();
//     this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
//     this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

//     const mouseVector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
//     mouseVector.unproject(this.camera);

//     const origin = (this.camera as THREE.PerspectiveCamera).position.clone();
//     const direction = mouseVector.sub(origin).normalize();

//     this.raycaster.set(origin, direction);
//     const intersects = this.raycaster.intersectObjects(this.scene.children, true);

//     if (intersects.length > 0) {
//       const point = intersects[0].point.clone();
//       this.points.push(point);
//       console.log(`📍 Point ${this.points.length}:`, point);

//       if (this.points.length === 2) {
//         this.drawLine(this.points[0], this.points[1]);
//         this.points = [];
//       }
//     }
//   }

//   private drawLine(p1: THREE.Vector3, p2: THREE.Vector3) {
//     const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
//     const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
//     const line = new THREE.Line(geometry, material);
//     this.scene.add(line);
//     console.log("🧵 Line drawn between two points");
//   }
// }
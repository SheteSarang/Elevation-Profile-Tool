import { useEffect, useRef } from "react";
import {
  ThreeBase,
  ModelLoader,
  LineDrawer,
  ElevationProfile,
} from "../three/functionality";

const CallingFn: React.FC = () => {
  const lineDrawerRef = useRef<LineDrawer | null>(null);
  const elevationProfileRef = useRef<ElevationProfile | null>(null);
  const threeRef = useRef<ThreeBase | null>(null);

  useEffect(() => {
    // Initialize Three.js scene
    const three = new ThreeBase();
    threeRef.current = three;

    // Load 3D model
    ModelLoader.loadModel(
      three.scene,
      "/model/strairs_free.mtl",
      "/model/strairs_free.obj"
    );

    // Initialize LineDrawer
    const lineDrawer = new LineDrawer(
      three.scene,
      three.camera,
      three.renderer
    );
    lineDrawerRef.current = lineDrawer;

    // Initialize ElevationProfile
    const elevationProfile = new ElevationProfile(
      three.scene,
      three.camera,
      three.renderer
    );
    elevationProfileRef.current = elevationProfile;

    // Start render loop
    three.start();

    // Handle toggle event to draw lines and elevation curve
    const toggleHandler = () => {
      const drawer = lineDrawerRef.current;
      const elevation = elevationProfileRef.current;

      if (drawer && elevation) {
        drawer.toggle();

        const points2D = drawer.getPoints(); // Expecting [{x, y}]
        if (points2D.length > 0) {
          // Call ElevationProfile logic here
          elevation.generateFromPoints(points2D); // Will raycast & draw curve
        }
      }
    };

    window.addEventListener("line-drawing-toggle", toggleHandler);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("line-drawing-toggle", toggleHandler);
      lineDrawerRef.current?.disable();
      three.cleanup();
    };
  }, []);

  return null;
};

export default CallingFn;

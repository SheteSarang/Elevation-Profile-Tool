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
    // Setup Three.js scene
    const three = new ThreeBase();
    threeRef.current = three;

    // Load model
    ModelLoader.loadModel(
      three.scene,
      "/model/strairs_free.mtl",
      "/model/strairs_free.obj"
    );

    // LineDrawer setup
    const lineDrawer = new LineDrawer(
      three.scene,
      three.camera,
      three.renderer
    );
    lineDrawerRef.current = lineDrawer;

    // ElevationProfile setup
    const elevationProfile = new ElevationProfile(
      three.scene,
      three.camera,
      three.renderer
    );
    elevationProfileRef.current = elevationProfile;

    // Start render loop
    three.start();

    // Custom toggle event
    const toggleHandler = () => {
      const drawer = lineDrawerRef.current;

      if (drawer) {
        drawer.toggle();
          const points = drawer.getPoints();
          if (points.length > 0) {
            elevationProfileRef.current?.generateFromPoints(points);
           
          }
        
      }
    };

    window.addEventListener("line-drawing-toggle", toggleHandler);

    return () => {
      window.removeEventListener("line-drawing-toggle", toggleHandler);
      lineDrawerRef.current?.disable();
      three.cleanup();
    };
  }, []);

  return null;
};

export default CallingFn;

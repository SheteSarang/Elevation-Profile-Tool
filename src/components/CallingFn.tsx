import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { ThreeBase, ModelLoader, LineDrawer } from "../three/functionality";

const CallingFn: React.FC = () => {
  const lineDrawerRef = useRef<LineDrawer | null>(null);
  const threeRef = useRef<ThreeBase | null>(null);

  // Get the state directly from Redux
  const drawingEnabled = useSelector((state: RootState) => state.drawing.drawingEnabled);
  console.log( drawingEnabled);
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
    const lineDrawer = new LineDrawer(three.scene, three.camera, three.renderer);
    lineDrawerRef.current = lineDrawer;

    // Start render loop
    three.start();

    // Cleanup on unmount
    return () => {
      lineDrawerRef.current?.disable();
      three.cleanup();
    };
  }, []);

  useEffect(() => {
    const drawer = lineDrawerRef.current;

    if (drawer) {
      if (drawingEnabled) {
        drawer.enable();
      } else {
        drawer.disable();
      }
    }
  }, [drawingEnabled]); // React to changes in drawingEnabled

  return null;
};

export default CallingFn;

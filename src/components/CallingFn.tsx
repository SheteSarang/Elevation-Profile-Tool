import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import {
  ThreeBase,
  ModelLoader,
  LineDrawer,
  AngleCalculate,
} from "../three/functionality";

const CallingFn: React.FC = () => {
  const lineDrawerRef = useRef<LineDrawer | null>(null);
  const threeRef = useRef<ThreeBase | null>(null);
  const angleCalcRef = useRef<AngleCalculate | null>(null);

  const drawingEnabled = useSelector(
    (state: RootState) => state.drawing.drawingEnabled
  );

  // initialize Three.js + LineDrawer once
  useEffect(() => {
    const three = new ThreeBase();
    threeRef.current = three;

    ModelLoader.loadModel(
      three.scene,
      "/model/strairs_free.mtl",
      "/model/strairs_free.obj"
    );

    lineDrawerRef.current = new LineDrawer(
      three.scene,
      three.camera,
      three.renderer
    );

    three.start();

    return () => {
      lineDrawerRef.current?.disable();
      angleCalcRef.current?.disable();
      three.cleanup();
    };
  }, []);

  // toggle line-drawing
  useEffect(() => {
    if (drawingEnabled) lineDrawerRef.current?.enable();
    else lineDrawerRef.current?.disable();
  }, [drawingEnabled]);

  // listen for angle-mode toggle events
  useEffect(() => {
    const handleAngleToggle = (e: Event) => {
      const on = (e as CustomEvent).detail as boolean;
      const three = threeRef.current;
      if (!three) return;

      // lazily create AngleCalculate once
      if (!angleCalcRef.current) {
        angleCalcRef.current = new AngleCalculate(
          three.scene,
          three.camera,
          three.renderer
        );
      }

      if (on) angleCalcRef.current.enable();
      else angleCalcRef.current.disable();
    };

    window.addEventListener("angle-calculate-toggle", handleAngleToggle);
    return () =>
      window.removeEventListener("angle-calculate-toggle", handleAngleToggle);
  }, []);

  return null;
};

export default CallingFn;

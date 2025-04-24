import React, { useEffect, useRef } from "react";
import { ThreeBase, ModelLoader, AngleCalculate } from "../three/functionality";

const Angle: React.FC = () => {
  const threeRef = useRef<ThreeBase | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const angleCalcRef = useRef<AngleCalculate | null>(null);

  const handleAngleMode = () => {
    if (threeRef.current && !angleCalcRef.current) {
      const angleCalc = new AngleCalculate(
        threeRef.current.scene,
        threeRef.current.camera,
        threeRef.current.renderer
      );
      angleCalc.enable(); // Start listening for clicks
      angleCalcRef.current = angleCalc;
    }
  };

  useEffect(() => {
    const three = new ThreeBase();
    threeRef.current = three;

    ModelLoader.loadModel(
      three.scene,
      "/model/strairs_free.mtl",
      "/model/strairs_free.obj"
    );
 
    three.start();
    // if (mountRef.current) {
    //   mountRef.current.appendChild(three.renderer.domElement);
    // }
    
    return () => {
      angleCalcRef.current?.disable();
      three.cleanup();
    };
  }, []);

  return (
    <div>
      <button
        onClick={handleAngleMode}
        className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
      >
        Angle calculate
      </button>
      <div ref={mountRef} className="w-full h-screen" />
    </div>
  );
};

export default Angle;
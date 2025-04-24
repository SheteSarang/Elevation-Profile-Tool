import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { toggleDrawing } from "../store/drawingSlice";
import { toggleAngleMode } from "../store/angleSlice";

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const drawingEnabled = useSelector((state: RootState) => state.drawing.drawingEnabled);
  const angleEnabled = useSelector((state: RootState) => state.Angle.angleModeEnabled);

  const handleToggleDrawing = () => {
    dispatch(toggleDrawing());
    window.dispatchEvent(new CustomEvent("line-drawing-toggle", { detail: !drawingEnabled }));
  };

  const handleToggleAngle = () => {
    dispatch(toggleAngleMode());
    window.dispatchEvent(new CustomEvent("angle-calculate-toggle", { detail: !angleEnabled }));
  };

  return (
    <header className="bg-gray-900 text-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">🧱 3D Model Viewer</h1>
        <nav className="space-x-4">
          <button
            onClick={handleToggleDrawing}
            className={`px-4 py-2 rounded-md ${
              drawingEnabled ? "bg-red-600" : "bg-green-600"
            } hover:opacity-90 transition ease-in-out duration-150`}
          >
            {drawingEnabled ? "Disable Line Drawing" : "Enable Line Drawing"}
          </button>

          <button
            onClick={handleToggleAngle}
            className={`px-4 py-2 rounded-md ${
              angleEnabled ? "bg-red-600" : "bg-purple-600"
            } hover:opacity-90 transition ease-in-out duration-150`}
          >
            {angleEnabled ? "Disable Angle Mode" : "Enable Angle Mode"}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

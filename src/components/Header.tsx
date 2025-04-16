import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { toggleDrawing } from "../store/drawingSlice";

const Header: React.FC = () => {
  const drawingEnabled = useSelector((state: RootState) => state.drawing.drawingEnabled);
  const dispatch = useDispatch();

  const handleToggle = () => {
    dispatch(toggleDrawing());
    window.dispatchEvent(new CustomEvent("line-drawing-toggle", { detail: !drawingEnabled }));
  };

  return (
    <header className="bg-gray-900 text-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">🧱 3D Model Viewer</h1>
        <nav className="space-x-6">
          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded ${
              drawingEnabled ? "bg-red-600" : "bg-green-600"
            } hover:opacity-90 transition`}
          >
            {drawingEnabled ? "Disable Line Drawing" : "Enable Line Drawing"}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
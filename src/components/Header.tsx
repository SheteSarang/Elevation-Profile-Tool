// Header.tsx
import React, { useState } from "react";

const Header: React.FC = () => {
  const [drawingEnabled, setDrawingEnabled] = useState(false);

  const toggleDrawing = () => {
    const newState = !drawingEnabled;
    setDrawingEnabled(newState);
    window.dispatchEvent(new CustomEvent("line-drawing-toggle", { detail: newState }));
  };

  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">🧱 3D Model Viewer</h1>
        <nav className="space-x-6">
          <button
            onClick={toggleDrawing}
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

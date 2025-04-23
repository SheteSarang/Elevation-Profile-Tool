import React, { useState } from "react";
import { PointHandler } from "../three/functionality"; // Import the new class

const Angle: React.FC = () => {
  const [point1, setPoint1] = useState<number | null>(null);
  const [point2, setPoint2] = useState<number | null>(null);
  const [point3, setPoint3] = useState<number | null>(null);

  const pointHandler = new PointHandler([]); // Create an instance of PointHandler

  const handleSubmit = () => {
    if (point1 !== null && point2 !== null && point3 !== null) {
      pointHandler.inPointHandle(point1, point2, point3); // Call the inPointHandle method
    } else {
      console.error("All points must be provided before submitting.");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label htmlFor="point1" className="block text-lg font-bold mb-2">
          Point 1
        </label>
        <input
          id="point1"
          type="number"
          value={point1 ?? ""}
          onChange={(e) => setPoint1(e.target.value ? parseFloat(e.target.value) : null)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Enter Point 1"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="point2" className="block text-lg font-bold mb-2">
          Point 2
        </label>
        <input
          id="point2"
          type="number"
          value={point2 ?? ""}
          onChange={(e) => setPoint2(e.target.value ? parseFloat(e.target.value) : null)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Enter Point 2"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="point3" className="block text-lg font-bold mb-2">
          Point 3
        </label>
        <input
          id="point3"
          type="number"
          value={point3 ?? ""}
          onChange={(e) => setPoint3(e.target.value ? parseFloat(e.target.value) : null)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Enter Point 3"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Submit
      </button>
    </div>
  );
};

export default Angle;
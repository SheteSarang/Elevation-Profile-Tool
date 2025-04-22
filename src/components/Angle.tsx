import React, { useState } from "react";



const Angle: React.FC = () => {



  const [point1, setPoint1] = useState<string>("");

  const [point2, setPoint2] = useState<string>("");

  const [point3, setPoint3] = useState<string>("");


  return (

    <div className="p-4">

      <div className="mb-4">

        <label htmlFor="point1" className="block text-lg font-bold mb-2">

          Point 1

        </label>

        <input

          id="point1"

          type="text"

          value={point1}

          onChange={(e) => setPoint1(e.target.value)}

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

          type="text"

          value={point2}

          onChange={(e) => setPoint2(e.target.value)}

          className="w-full p-2 border border-gray-300 rounded"

          placeholder="Enter Point 2"

        />

      </div>

      <div className="mb-4">

        <label htmlFor="point2" className="block text-lg font-bold mb-2">

          Point 3

        </label>

        <input

          id="point2"

          type="text"

          value={point3}

          onChange={(e) => setPoint3(e.target.value)}

          className="w-full p-2 border border-gray-300 rounded"

          placeholder="Enter Point 2"

        />

      </div>

     

    </div>

  );

};



export default Angle;
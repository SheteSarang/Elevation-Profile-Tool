import React, { useState } from "react";
import Header from "./components/Header";
import CallingFn from "./components/CallingFn";

const App: React.FC = () => {
  const [drawingEnabled, setDrawingEnabled] = useState(false);

  return (
    <div>
      <Header drawingEnabled={drawingEnabled} setDrawingEnabled={setDrawingEnabled} />
      <CallingFn drawingEnabled={drawingEnabled} />
    </div>
  );
};

export default App;

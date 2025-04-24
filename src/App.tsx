import React from "react";

import Header from "./components/Header";
import CallingFn from "./components/CallingFn";


const App: React.FC = () => {
  // Access the Redux state

  return (
    <div>
      <Header />
      <CallingFn />
      
    </div>
  );
};

export default App;
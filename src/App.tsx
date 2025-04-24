import React from "react";

import Header from "./components/Header";
import CallingFn from "./components/CallingFn";


const App: React.FC = () => {
  // Access the Redux state

  return (
    <div id="base-div" >
      <Header />
      <CallingFn />
    </div>
  );
};

export default App;
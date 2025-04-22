import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store/store"; // Ensure the correct path to your store
import Header from "./components/Header";
import CallingFn from "./components/CallingFn";
import Angle from "./components/Angle";

const App: React.FC = () => {
  // Access the Redux state
  const angleShouldRender = useSelector((state: RootState) => state.Angle.iselevationProfiledone);

  return (
    <div>
      <Header />
      <CallingFn />
      {angleShouldRender && <Angle />} {/* Conditionally render Angle */}
    </div>
  );
};

export default App;
import { createSlice } from "@reduxjs/toolkit";

interface AngleState {
 
  iselevationProfiledone: boolean; // Add this property
}

const initialState: AngleState = {

  iselevationProfiledone: false, // Initial state: Elevation profile not done
};

const angleSlice = createSlice({
  name: "Angle",
  initialState,
  reducers: {
   
    setIselevationProfiledone: (state, action: { payload: boolean }) => {
      state.iselevationProfiledone = action.payload; // Update elevation profile state
    },
  },
});

export const {  setIselevationProfiledone } = angleSlice.actions;
export default angleSlice.reducer;

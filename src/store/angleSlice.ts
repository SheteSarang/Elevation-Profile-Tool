import { createSlice } from "@reduxjs/toolkit";

interface AngleState {
  angleModeEnabled: boolean;
}

const initialState: AngleState = {
  angleModeEnabled: false,
};

const angleSlice = createSlice({
  name: "angle",
  initialState,
  reducers: {
    toggleAngleMode: (state) => {
      state.angleModeEnabled = !state.angleModeEnabled;
    },
    setAngleMode: (state, action: { payload: boolean }) => {
      state.angleModeEnabled = action.payload;
    },
  },
});

export const { toggleAngleMode, setAngleMode } = angleSlice.actions;
export default angleSlice.reducer;
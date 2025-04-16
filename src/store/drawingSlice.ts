import { createSlice } from "@reduxjs/toolkit";

interface DrawingState {
  drawingEnabled: boolean;
}

const initialState: DrawingState = {
  drawingEnabled: false, // Initial state
};

const drawingSlice = createSlice({
  name: "drawing",
  initialState,
  reducers: {
    toggleDrawing: (state) => {
      state.drawingEnabled = !state.drawingEnabled; // Toggle the state
    },
    setDrawingEnabled: (state, action: { payload: boolean }) => {
      state.drawingEnabled = action.payload; // Explicitly set the state
    },
  },
});

export const { toggleDrawing, setDrawingEnabled } = drawingSlice.actions;
export default drawingSlice.reducer;
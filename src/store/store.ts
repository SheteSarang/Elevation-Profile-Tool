import { configureStore } from "@reduxjs/toolkit";
import drawingReducer from "./drawingSlice";
import angleReducer from "./angleSlice";

const store = configureStore({
  reducer: {
    drawing: drawingReducer, // Add the drawing slice reducer
    Angle: angleReducer,
    

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import influencerReducer from "./influencerSlice";

export const store = configureStore({
  reducer: {
    influencers: influencerReducer,
  },
});

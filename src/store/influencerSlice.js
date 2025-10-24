import { createSlice } from "@reduxjs/toolkit";

const influencerSlice = createSlice({
  name: "influencer",
  initialState: {
    allInfluencers: [],
    selectedInfluencers: [],
  },
  reducers: {
    setInfluencers: (state, action) => {
      state.allInfluencers = action.payload;
    },
    addToCampaign: (state, action) => {
      const inf = action.payload;
      const exists = state.selectedInfluencers.find(i => i.id === inf.id);
      if (exists) {
        // update selected influencer
        state.selectedInfluencers = state.selectedInfluencers.map(i =>
          i.id === inf.id ? inf : i
        );
      } else {
        state.selectedInfluencers.push(inf);
      }
    },
    removeFromCampaign: (state, action) => {
      state.selectedInfluencers = state.selectedInfluencers.filter(
        i => i.id !== action.payload
      );
    },
    clearCampaign: (state) => {
      state.selectedInfluencers = [];
    },
  },
});

export const { setInfluencers, addToCampaign, removeFromCampaign, clearCampaign } =
  influencerSlice.actions;
export default influencerSlice.reducer;

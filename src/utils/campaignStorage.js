// src/utils/campaignStorage.js

const KEY = "campaignInfluencers";

export const getCampaign = () => {
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveCampaign = (data) => {
  localStorage.setItem(KEY, JSON.stringify(data));
};

export const clearCampaign = () => {
  localStorage.removeItem(KEY);
};

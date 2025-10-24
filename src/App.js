import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Howitworks from "./pages/Howitworks";
import PostNews from "./pages/PostNews";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./pages/ProtectedRoutes";
import DashboardLayout from "./layout/DashboardLayout";

// Dashboard pages
import Dashboard from "./pages/Dashboard";
import Stations from "./pages/Stations";
import Shows from "./pages/Shows";
import Presenters from "./pages/Presenters";
import Ads from "./pages/Ads";
import InfluencerSelectionPage from "./pages/InfluencerSelectionPage";
import Campaignpage from "./pages/Campaignpage";
import InfluencersPage from "./pages/InfluencersPage";
import Campaigns from "./pages/Campaigns";

function App() {

  const [selectedInfluencers, setSelectedInfluencers] = useState([]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/how-it-works" element={<Howitworks />} />
        <Route path="/post-news" element={<PostNews />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/influencer"
          element={
            <InfluencerSelectionPage
              selectedInfluencers={selectedInfluencers}
              setSelectedInfluencers={setSelectedInfluencers}
            />
          }
        />
        <Route
          path="/campaign"
          element={
            <Campaignpage
              selectedInfluencers={selectedInfluencers}
              setSelectedInfluencers={setSelectedInfluencers}
            />
          }
        />

        {/* Protected Dashboard Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested routes (share the sidebar) */}
          <Route index element={<Dashboard />} />
          <Route path="stations" element={<Stations />} />
          <Route path="shows" element={<Shows />} />
          <Route path="presenters" element={<Presenters />} />
          <Route path="ads" element={<Ads />} />
          <Route path="influencers" element={<InfluencersPage />} />
          <Route path="campaigns" element={<Campaigns />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

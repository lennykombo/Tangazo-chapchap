import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Howitworks from "./pages/Howitworks";
import PostNews from "./pages/PostNews";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/how-it-works" element={<Howitworks />} />
        <Route path="/post-news" element={<PostNews />} />
      </Routes>
    </Router>
  );
}

export default App;

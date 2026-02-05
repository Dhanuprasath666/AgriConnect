import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import FarmerLogin from "./pages/FarmerLogin";
import FarmerDashboard from "./pages/FarmerDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/farmer/login" element={<FarmerLogin/>} />
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />

        <Route path="/consumer/login" element={<div>Consumer Login Page</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

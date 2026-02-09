import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import FarmerLogin from "./pages/FarmerLogin";
import FarmerDashboard from "./pages/FarmerDashboard";
import ConsumerDashboard from "./pages/ConsumerDashboard";
import ConsumerCategory from "./pages/ConsumerCategory";
import AddProduct from "./pages/AddProduct";
import ConsumerMarket from "./pages/ConsumerMarket";
import ConsumerLogin from "./pages/Consumerlogin";
import FarmerRegister from "./pages/FarmerRegister";
import Register from "./pages/Register";
import ConsumerRegister from "./pages/ConsumerRegister";
import ConsumerBuyNow from "./pages/ConsumerBuyNow";
import ConsumerProfile from "./pages/ConsumerProfile";
import SidebarLayout from "./components/SidebarLayout";

function App() {
  return (
    <BrowserRouter>
      <div className="ac-app-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />

        <Route element={<SidebarLayout />}>
          <Route path="/register" element={<Register />} />
          <Route
            path="/register/farmer"
            element={<Navigate to="/farmer/register" replace />}
          />
          <Route
            path="/register/consumer"
            element={<Navigate to="/consumer/register" replace />}
          />
          <Route path="/Register" element={<Navigate to="/register" replace />} />

          <Route path="/farmer/register" element={<FarmerRegister />} />
          <Route path="/consumer/register" element={<ConsumerRegister />} />

          <Route path="/farmer/login" element={<FarmerLogin />} />
          <Route path="/consumer/login" element={<ConsumerLogin />} />
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          <Route path="/consumer" element={<ConsumerDashboard />} />
          <Route path="/farmer/add-product" element={<AddProduct />} />
          <Route path="/consumer/market" element={<ConsumerMarket />} />
          <Route path="/consumer/buy-now" element={<ConsumerBuyNow />} />
          <Route path="/consumer/profile" element={<ConsumerProfile />} />
          <Route path="/consumer/:category" element={<ConsumerCategory />} />
        </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

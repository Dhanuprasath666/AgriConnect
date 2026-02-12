import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import FarmerLogin from "./pages/FarmerLogin";
import FarmerDashboard from "./pages/FarmerDashboard";
import ConsumerDashboard from "./pages/ConsumerDashboard";
import ConsumerCategory from "./pages/ConsumerCategory";
import AddProduct from "./pages/AddProduct";
import ConsumerLogin from "./pages/Consumerlogin";
import FarmerRegister from "./pages/FarmerRegister";
import Register from "./pages/Register";
import ConsumerRegister from "./pages/ConsumerRegister";
import ConsumerBuyNow from "./pages/ConsumerBuyNow";
import ConsumerProfile from "./pages/ConsumerProfile";
import SidebarLayout from "./components/SidebarLayout";
import ConsumerOrders from "./pages/ConsumerOrders";
import RequireConsumerAuth from "./components/RequireConsumerAuth";
import RequireFarmerAuth from "./components/RequireFarmerAuth";
import RequireFarmerVerification from "./components/RequireFarmerVerification";
import RequireFarmerSubscription from "./components/RequireFarmerSubscription";
import FarmerSubscription from "./pages/FarmerSubscription";
import EmployeePortal from "./pages/EmployeePortal";
import FarmerVerificationPending from "./pages/FarmerVerificationPending";

function App() {
  return (
    <BrowserRouter>
      <div className="ac-app-content">
        <Routes>
          <Route element={<SidebarLayout />}>
          <Route path="/" element={<LandingPage />} />
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

          <Route path="/login/farmer" element={<FarmerLogin />} />
          <Route path="/login/consumer" element={<ConsumerLogin />} />
          <Route
            path="/farmer/login"
            element={<Navigate to="/login/farmer" replace />}
          />
          <Route
            path="/consumer/login"
            element={<Navigate to="/login/consumer" replace />}
          />
          <Route
            path="/farmer/dashboard"
            element={
              <RequireFarmerAuth>
                <RequireFarmerVerification>
                  <FarmerDashboard />
                </RequireFarmerVerification>
              </RequireFarmerAuth>
            }
          />
          <Route
            path="/farmer/verification-pending"
            element={
              <RequireFarmerAuth>
                <FarmerVerificationPending />
              </RequireFarmerAuth>
            }
          />
          <Route path="/consumer" element={<ConsumerDashboard />} />
          <Route
            path="/farmer/add-product"
            element={
              <RequireFarmerAuth>
                <RequireFarmerVerification>
                  <RequireFarmerSubscription>
                    <AddProduct />
                  </RequireFarmerSubscription>
                </RequireFarmerVerification>
              </RequireFarmerAuth>
            }
          />
          <Route
            path="/farmer/subscription"
            element={
              <RequireFarmerAuth>
                <FarmerSubscription />
              </RequireFarmerAuth>
            }
          />
          <Route path="/consumer/dashboard" element={<ConsumerDashboard />} />
          <Route
            path="/consumer/buy-now"
            element={
              <RequireConsumerAuth>
                <ConsumerBuyNow />
              </RequireConsumerAuth>
            }
          />
          <Route
            path="/consumer/profile"
            element={
              <RequireConsumerAuth>
                <ConsumerProfile />
              </RequireConsumerAuth>
            }
          />
          <Route
            path="/consumer/orders"
            element={
              <RequireConsumerAuth>
                <ConsumerOrders />
              </RequireConsumerAuth>
            }
          />
          <Route path="/consumer/:category" element={<ConsumerCategory />} />
          <Route path="/employee/portal" element={<EmployeePortal />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;


import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentFarmerId } from "../lib/currentFarmer";
import { isFarmerPendingVerification } from "../lib/farmerVerification";

const RequireFarmerVerification = ({ children }) => {
  const location = useLocation();
  const farmerId = getCurrentFarmerId();

  if (isFarmerPendingVerification(farmerId)) {
    return (
      <Navigate
        to="/farmer/verification-pending"
        replace
        state={{ redirectTo: location.pathname }}
      />
    );
  }

  return children;
};

export default RequireFarmerVerification;

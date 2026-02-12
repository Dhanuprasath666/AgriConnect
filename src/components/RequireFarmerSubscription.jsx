import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasActiveCurrentFarmerSubscription } from "../lib/subscription";

const RequireFarmerSubscription = ({ children }) => {
  const location = useLocation();

  if (!hasActiveCurrentFarmerSubscription()) {
    return (
      <Navigate
        to="/farmer/subscription"
        replace
        state={{ redirectTo: location.pathname }}
      />
    );
  }

  return children;
};

export default RequireFarmerSubscription;

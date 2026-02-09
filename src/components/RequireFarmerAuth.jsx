import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isFarmerAuthenticated } from "../utils/auth";

const RequireFarmerAuth = ({ children }) => {
  const location = useLocation();
  if (!isFarmerAuthenticated()) {
    return (
      <Navigate
        to="/login/farmer"
        replace
        state={{ redirectTo: location.pathname, farmerLoginAccess: "guard" }}
      />
    );
  }

  return children;
};

export default RequireFarmerAuth;

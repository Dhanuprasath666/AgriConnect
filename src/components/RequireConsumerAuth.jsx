import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isConsumerAuthenticated } from "../utils/auth";
import { setPostLoginRedirect } from "../utils/buyNowFlow";

const RequireConsumerAuth = ({ children }) => {
  const location = useLocation();

  if (!isConsumerAuthenticated()) {
    // Preserve intended destination so login can route back deterministically.
    const target = location.pathname || "/consumer/profile";
    setPostLoginRedirect(target, location.state?.item);
    return (
      <Navigate
        to="/login/consumer"
        replace
        state={{ redirectTo: target, buyNowItem: location.state?.item }}
      />
    );
  }

  return children;
};

export default RequireConsumerAuth;

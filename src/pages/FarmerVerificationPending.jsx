import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentFarmerId } from "../lib/currentFarmer";
import { isFarmerVerified } from "../lib/farmerVerification";
import "../style.css";

const FarmerVerificationPending = () => {
  const navigate = useNavigate();
  const farmerId = getCurrentFarmerId();

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isFarmerVerified(farmerId)) {
        navigate("/farmer/dashboard", { replace: true });
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [farmerId, navigate]);

  return (
    <div className="fvp-page">
      <div className="fvp-card">
        <h1>Verification Pending</h1>
        <p>
          Your farmer account is under verification. An AgriConnect employee must
          verify your profile before dashboard access is enabled.
        </p>
        <p className="fvp-id">Farmer ID: {farmerId}</p>
        <div className="fvp-actions">
          <button className="fvp-btn fvp-btn-primary" onClick={() => navigate(0)}>
            Refresh Status
          </button>
          <button
            className="fvp-btn fvp-btn-ghost"
            onClick={() => navigate("/login/farmer")}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmerVerificationPending;

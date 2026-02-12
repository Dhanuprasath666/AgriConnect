import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getCurrentFarmerSubscription,
  hasActiveCurrentFarmerSubscription,
  setCurrentFarmerSubscription,
} from "../lib/subscription";
import "../style.css";

const COMMON_PLAN_ID = "standard";

const commonPlan = {
  id: COMMON_PLAN_ID,
  name: "Premium Farmer Plan (1 Year)",
  price: "INR 4999 / year",
  details: "Annual premium subscription with full crop listing access.",
};

const FarmerSubscription = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => {
    const stateTarget = location.state?.redirectTo;
    if (typeof stateTarget === "string" && stateTarget.startsWith("/")) {
      return stateTarget;
    }
    return "/farmer/add-product";
  }, [location.state]);

  const subscription = getCurrentFarmerSubscription();
  const isSelected =
    hasActiveCurrentFarmerSubscription() &&
    subscription?.planId === COMMON_PLAN_ID;

  const handleSubscribe = () => {
    setCurrentFarmerSubscription(COMMON_PLAN_ID);
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="subscription-page">
      <div className="subscription-card">
        <p className="subscription-kicker">Subscription Required</p>
        <h1>Activate subscription to continue</h1>
        <p className="subscription-subtext">
          Subscribe to Premium for 1 year to add crops to the consumer dashboard.
        </p>

        <div className="subscription-grid">
          <button
            type="button"
            className={`subscription-plan ${isSelected ? "is-active" : ""}`}
            onClick={handleSubscribe}
          >
            <span className="subscription-plan-name">{commonPlan.name}</span>
            <span className="subscription-plan-price">{commonPlan.price}</span>
            <span className="subscription-plan-details">{commonPlan.details}</span>
            <span className="subscription-plan-cta">
              {isSelected ? "Continue to Add Crop" : "Activate and Continue"}
            </span>
          </button>
        </div>

        <button
          type="button"
          className="subscription-back-btn"
          onClick={() => navigate("/farmer/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default FarmerSubscription;

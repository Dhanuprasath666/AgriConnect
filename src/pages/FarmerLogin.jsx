import React from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";

const FarmerLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>👨‍🌾 Farmer Login portal</h2>
        <p className="auth-subtitle">
          Grow smart. Sell direct. Stay informed.
        </p>

        <input
          type="text"
          placeholder="Enter Mobile Number"
          className="auth-input"
        />

        <button className="auth-button" onClick={() => navigate("/farmer/dashboard")}>
          Continue
        </button>

        <p className="auth-footer">
          Helping farmers with technology 🌱
        </p>
      </div>
    </div>
  );
};

export default FarmerLogin;

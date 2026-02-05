import React from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";
import farmBg from "../assets/farm-bg.jpg";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="landing-container"
      style={{ backgroundImage: `url(${farmBg})` }}
    >
      {/* Overlay */}
      <div className="landing-overlay"></div>

      {/* Card */}
      <div className="landing-card">
        <h1 className="landing-title">
          🌱 AgriConnect
        </h1>

        <p className="landing-subtitle">
          Connecting Farmers and Consumers with Trust & Transparency
        </p>

        <div className="landing-buttons">
          <button
            className="farmer-btn"
            onClick={() => navigate("/farmer/login")}
          >
            👨‍🌾 Farmer Login
          </button>

          <button
            className="consumer-btn"
            onClick={() => navigate("/consumer/login")}
          >
            🧑‍💻 Consumer Login
          </button>
        </div>

        <p className="landing-footer">
          Fresh • Local • Transparent
        </p>
      </div>
    </div>
  );
};

export default LandingPage;

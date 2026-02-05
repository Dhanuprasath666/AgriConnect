import React from "react";
import "../style.css";

const FarmerDashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>👨‍🌾 Welcome, Farmer</h1>
        <p>Your land. Your crops. Our intelligence.</p>
      </div>

      {/* Cards Grid */}
      <div className="dashboard-grid">
        
        {/* Weather Card */}
        <div className="dashboard-card">
          <h3>🌦️ Weather Alert</h3>
          <p className="card-main">Rain expected in 30 minutes</p>
          <p className="card-sub">Temperature: 28°C | Humidity: High</p>
        </div>

        {/* Pest Alert */}
        <div className="dashboard-card warning">
          <h3>🐛 Pest Alert</h3>
          <p className="card-main">
            Leaf blight reported nearby
          </p>
          <p className="card-sub">
            Preventive spray recommended
          </p>
        </div>

        {/* Crop Progress */}
        <div className="dashboard-card success">
          <h3>🌱 Crop Status</h3>
          <p className="card-main">
            Tomato crop — Day 18 / 60
          </p>
          <p className="card-sub">
            Growth: Healthy
          </p>
        </div>

        {/* Smart Advice */}
        <div className="dashboard-card info">
          <h3>🧠 Smart Advice</h3>
          <p className="card-main">
            Ideal time for fertilization
          </p>
          <p className="card-sub">
            Next sowing window in 12 days
          </p>
        </div>

      </div>
    </div>
  );
};

export default FarmerDashboard;


import React, { useState } from "react";
import "../style.css";
import { useNavigate } from "react-router-dom";
const FarmerDashboard = () => {
  const [showProfile, setShowProfile] = useState(false);
  const navigate=useNavigate();
  return (
    <div className="fd-layout">

      {/* SIDEBAR */}
      <aside className="fd-sidebar">
        <div className="fd-logo">AC</div>
        <nav className="fd-nav">
          <span>🏠</span>
          <span>🌦️</span>
          <span>🚨</span>
          <span>🌱</span>
          <span>💰</span>
          <span>⚙️</span>
        </nav>
      
      </aside>

      {/* MAIN */}
      <main className="fd-main">

        {/* HEADER */}
        <header className="fd-header">
          <div>
            <h1>Farmer Dashboard</h1>
            <p>Your land. Your crops. Our intelligence.</p>
          </div> 
          <button onClick={() => navigate("/farmer/add-product")}>
  Add Product to Market
</button><button onClick={() => navigate("/consumer/market")}>
 CONSUMER MARKET 
</button>
         

          {/* Profile Avatar */}
          <div className="fd-profile">
            <div
              className="fd-avatar"
              onClick={() => setShowProfile(!showProfile)}
            >
              F
            </div>

            {showProfile && (
              <div className="fd-profile-menu">
                <p><strong>Farmer</strong></p>
                <p>Village, District</p>
                <button>Edit Profile</button>
                <button className="logout">Logout</button>
              </div>
            )}
          </div>
        </header>

        {/* WEATHER HERO */}
        <section className="fd-section fd-hero">
          <h2>Live Weather</h2>
          <div className="weather-box">
            <div>
              <h3>28°C</h3>
              <p>Partly Cloudy ☁️</p>
            </div>
            <div>
              <p>💧 Humidity: 72%</p>
              <p>💨 Wind: 10 km/h</p>
              <span className="live">Updated just now</span>
            </div>
          </div>
        </section>

        {/* ALERTS */}
        <section className="fd-section">
          <h2>Alerts & Notifications</h2>
          <div className="fd-row">
            <div className="alert-card warning">
              🌧️ Rain expected in 30 minutes
            </div>
            <div className="alert-card danger">
              🐛 Pest alert nearby
            </div>
            <div className="alert-card info">
              🔔 Consumers searching for tomatoes
            </div>
          </div>
        </section>

        {/* CROP & FARM */}
        <section className="fd-section">
          <h2>Crop & Farm Status</h2>
          <div className="fd-row">
            <div className="status-card">
              <h3>Tomato</h3>
              <p>Day 18 / 60</p>
              <div className="progress">
                <div className="progress-fill" style={{ width: "30%" }} />
              </div>
              <span className="tag healthy">Healthy</span>
            </div>

            <div className="status-card">
              <h3>Farm Health</h3>
              <p>Soil Moisture: 41%</p>
              <p>Status: Moderate</p>
            </div>
          </div>
        </section>

        {/* CONSUMER TRENDS */}
        <section className="fd-section">
          <h2>Trending Consumer Demand</h2>
          <div className="consumer-box">
            <p>🍅 Tomato — High demand</p>
            <p>🥬 Greens — Medium demand</p>
            <blockquote>
              “Looking for fresh tomatoes this weekend”
            </blockquote>
          </div>
        </section>

        {/* EARNINGS */}
        <section className="fd-section">
          <h2>Earnings Snapshot</h2>
          <div className="fd-row">
            <div className="money-card">₹48,000<br />Total</div>
            <div className="money-card">₹6,500<br />This Month</div>
            <div className="money-card">₹12,000<br />Expected</div>
          </div>
        </section>

        {/* FUTURE PLANS */}
        <section className="fd-section">
          <h2>Upcoming Actions</h2>
          <ul className="todo">
            <li>🌱 Next sowing window: 12 days</li>
            <li>🌾 Harvest expected in 3 weeks</li>
            <li>💧 Irrigation planned tomorrow</li>
          </ul>
        </section>

      </main>
    </div>
  );
};

export default FarmerDashboard;



import React from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";
import farmBg from "../assets/farm-bg.jpg";

const LandingPage = () => {
  const navigate = useNavigate();

  const openFarmerLoginFromTop = () => {
    navigate("/farmer/login", {
      state: { farmerLoginAccess: "top-nav" },
    });
  };

  const urgentCrops = [
    {
      id: 1,
      name: "Tomato",
      discount: "50% OFF",
      quantity: "10 units",
      daysLeft: "2 days",
    },
    {
      id: 2,
      name: "Spinach",
      discount: "25% OFF",
      quantity: "6 units",
      daysLeft: "1 day",
    },
    {
      id: 3,
      name: "Banana",
      discount: "40% OFF",
      quantity: "15 units",
      daysLeft: "2 days",
    },
  ];

  const features = [
    {
      id: 1,
      title: "Direct farm sourcing",
      description:
        "Consumers buy produce directly from nearby farmers, reducing extra costs and improving freshness.",
      label: "Transparent pricing",
    },
    {
      id: 2,
      title: "Smart urgency deals",
      description:
        "Low shelf-life products get highlighted quickly so farmers sell faster and food waste is reduced.",
      label: "Waste reduction",
    },
    {
      id: 3,
      title: "Verified quality signals",
      description:
        "Listings include quantity, freshness windows, and pickup details so buyers can decide with confidence.",
      label: "Trust first",
    },
  ];

  return (
    <div className="lp-page">
      <div className="lp-bg-orb lp-bg-orb-one" aria-hidden="true"></div>
      <div className="lp-bg-orb lp-bg-orb-two" aria-hidden="true"></div>

      <header className="lp-nav">
        <button className="lp-brand" onClick={() => navigate("/")}>
          <span className="lp-brand-mark">AC</span>
          <span className="lp-brand-name">AgriConnect</span>
        </button>

        <div className="lp-nav-links">
          <a href="#features">Features</a>
          <a href="#deals">Deals</a>
          <button className="lp-nav-login" onClick={openFarmerLoginFromTop}>
            Farmer Login
          </button>
        </div>
      </header>

      <main className="lp-main">
        <section
          className="lp-hero"
          style={{ backgroundImage: `url(${farmBg})` }}
        >
          <div className="lp-hero-overlay"></div>

          <div className="lp-hero-content">
            <p className="lp-kicker">Farm to home marketplace</p>
            <h1>Modern produce commerce for farmers and families.</h1>
            <p className="lp-hero-text">
              AgriConnect helps farmers sell efficiently and helps consumers buy
              fresher products with trusted listing details and fair pricing.
            </p>

            <div className="lp-hero-actions">
              <button
                className="lp-btn lp-btn-primary"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
              <button
                className="lp-btn lp-btn-secondary"
                onClick={() => navigate("/consumer")}
              >
                Explore Marketplace
              </button>
            </div>

            <div className="lp-stats">
              <article className="lp-stat">
                <h3>30%</h3>
                <p>Less post-harvest waste</p>
              </article>
              <article className="lp-stat">
                <h3>24h</h3>
                <p>Average listing response time</p>
              </article>
            </div>
          </div>
        </section>

        <section className="lp-section" id="features">
          <div className="lp-section-head">
            <p>Why AgriConnect</p>
            <h2>Built for reliability, fairness, and growth</h2>
          </div>

          <div className="lp-feature-grid">
            {features.map((feature) => (
              <article className="lp-feature-card" key={feature.id}>
                <span className="lp-feature-label">{feature.label}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-section lp-section-muted" id="deals">
          <div className="lp-section-head">
            <p>Ending soon</p>
            <h2>Urgent deals currently available</h2>
          </div>

          <div className="lp-deals-grid">
            {urgentCrops.map((crop) => (
              <article className="lp-deal-card" key={crop.id}>
                <h3>{crop.name}</h3>
                <p className="lp-deal-discount">{crop.discount}</p>
                <p className="lp-deal-meta">
                  {crop.quantity} available / {crop.daysLeft} left
                </p>
                <button
                  className="lp-btn lp-btn-primary lp-btn-small"
                  onClick={() => navigate("/consumer/login")}
                >
                  Buy Now
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-cta">
          <h2>Bring your produce business online with confidence.</h2>
          <p>
            Create listings faster, reach nearby consumers, and improve
            profitability with transparent digital workflows.
          </p>
          <button
            className="lp-btn lp-btn-primary"
            onClick={() => navigate("/register")}
          >
            Register 
          </button>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;

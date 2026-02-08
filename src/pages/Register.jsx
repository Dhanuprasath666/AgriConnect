import React from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";

const roleOptions = [
  {
    key: "farmer",
    title: "Farmer Account",
    subtitle: "Sell produce and manage farm operations from one dashboard.",
    route: "/farmer/register",
    cta: "Register as Farmer",
    initials: "FR",
    accentClass: "rg-role-farmer",
    highlights: [
      "Publish fresh inventory quickly",
      "Track orders and urgent demand",
      "Manage pricing with clarity",
    ],
  },
  {
    key: "consumer",
    title: "Consumer Account",
    subtitle: "Buy fresh products from trusted farms near you.",
    route: "/consumer/register",
    cta: "Register as Consumer",
    initials: "CO",
    accentClass: "rg-role-consumer",
    highlights: [
      "Discover local produce deals",
      "Order from verified farmers",
      "Track purchases in one place",
    ],
  },
];

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="rg-page">
      <header className="rg-topbar">
        <button className="rg-brand" onClick={() => navigate("/")}>
          AgriConnect
        </button>
        <button className="rg-top-btn" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </header>

      <main className="rg-main">
        <section className="rg-card">
          <p className="rg-kicker">Registration</p>
          <h1>Choose your account type</h1>
          <p className="rg-subtext">
            Select how you want to join AgriConnect and continue to profile
            registration.
          </p>

          <div className="rg-step-strip">
            <span className="rg-step-pill">Step 1 of 2</span>
            <p>Choose the profile type you want to create.</p>
          </div>

          <div className="rg-role-grid">
            {roleOptions.map((option) => (
              <button
                key={option.key}
                className="rg-role-btn"
                onClick={() => navigate(option.route)}
              >
                <div className="rg-role-head">
                  <span className={`rg-role-icon ${option.accentClass}`}>
                    {option.initials}
                  </span>
                  <h3>{option.title}</h3>
                </div>
                <p>{option.subtitle}</p>
                <ul className="rg-role-list">
                  {option.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                <span className="rg-role-cta">{option.cta}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Register;

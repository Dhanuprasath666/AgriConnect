import React from "react";
import { useNavigate } from "react-router-dom";
import { isConsumerLoggedIn, getConsumerSession, clearConsumerSession } from "../utils/consumerSession";
import "../style.css";
import { useState } from "react";

const ConsumerDashboard = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const session = getConsumerSession();

  const categories = [
    {
      name: "Fruits",
      path: "/consumer/fruits",
      tag: "Seasonal picks",
      note: "Mango, banana, citrus and more",
    },
    {
      name: "Vegetables",
      path: "/consumer/vegetables",
      tag: "Daily essentials",
      note: "Farm-fresh greens and staples",
    },
    {
      name: "Plant Saplings",
      path: "/consumer/saplings",
      tag: "Home gardening",
      note: "Healthy saplings from local growers",
    },
    {
      name: "Plant Products",
      path: "/consumer/products",
      tag: "Value-added goods",
      note: "Natural products and farm byproducts",
    },
  ];

  const quickDeals = [
    { id: 1, title: "Tomatoes", offer: "Up to 35% off", eta: "Ends in 1 day" },
    { id: 2, title: "Spinach Bundles", offer: "Up to 20% off", eta: "Ends today" },
    { id: 3, title: "Bananas", offer: "Up to 28% off", eta: "Ends in 2 days" },
  ];

  const handleStartShopping = () => {
    if (categories.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * categories.length);
    navigate(categories[randomIndex].path);
  };

  const handleBuyNow = () => {
    if (isConsumerLoggedIn()) {
      navigate("/consumer/buy-now");
    } else {
      navigate("/consumer/login");
    }
  };

  const handleLogout = () => {
    clearConsumerSession();
    setShowProfileMenu(false);
    navigate("/consumer/login");
  };

  return (
    <div className="cd-page">
      <header className="cd-topbar">
        <button className="cd-brand" onClick={() => navigate("/")}>
          <span className="ac-brand-text">AC</span>
        </button>
        <div className="cd-topbar-actions">
          {isConsumerLoggedIn() ? (
            <div className="cd-profile">
              <div
                className="cd-avatar"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                {session?.name ? session.name.charAt(0).toUpperCase() : "C"}
              </div>

              {showProfileMenu && (
                <div className="cd-profile-menu">
                  <p><strong>{session?.name || "Consumer"}</strong></p>
                  <p>{session?.email || "email@example.com"}</p>
                  <button onClick={() => navigate("/")}>🏠 Home</button>
                  <button onClick={() => navigate("/consumer/market")}>
                    🛒 Marketplace
                  </button>
                  <button onClick={() => navigate("/consumer/profile")}>
                    👤 My Profile
                  </button>
                  <button className="logout" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="cd-login-btn"
              onClick={() => navigate("/consumer/login")}
            >
              Consumer Login
            </button>
          )}
        </div>
      </header>

      <main className="cd-main">
        <section className="cd-hero">
          <div className="cd-hero-content">
            <p className="cd-kicker">Consumer Dashboard</p>
            <h1>Shop directly from nearby farmers with full clarity.</h1>
            <p className="cd-hero-text">
              Discover fresh produce, compare prices transparently, and place
              faster purchase decisions with timely urgent-deal highlights.
            </p>

            <div className="cd-hero-actions">
              <button
                className="cd-btn cd-btn-primary"
                onClick={handleStartShopping}
              >
                Start Shopping
              </button>
              <button
                className="cd-btn cd-btn-secondary"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>
          </div>

          <aside className="cd-summary">
            <h2>Today at a glance</h2>
            <div className="cd-summary-grid">
              <article>
                <strong>42</strong>
                <p>Live listings</p>
              </article>
              <article>
                <strong>16</strong>
                <p>Urgent deals</p>
              </article>
              <article>
                <strong>11</strong>
                <p>Nearby farms</p>
              </article>
              <article>
                <strong>4.8/5</strong>
                <p>Buyer rating</p>
              </article>
            </div>
          </aside>
        </section>

        <section className="cd-section">
          <div className="cd-section-head">
            <p>Browse</p>
            <h2>Choose a category to explore available products</h2>
          </div>

          <div className="cd-grid">
            {categories.map((category) => (
              <button
                key={category.name}
                className="cd-card"
                onClick={() => navigate(category.path)}
              >
                <span className="cd-card-tag">{category.tag}</span>
                <h3>{category.name}</h3>
                <p>{category.note}</p>
                <span className="cd-card-link">Open category</span>
              </button>
            ))}
          </div>
        </section>

        <section className="cd-section cd-section-soft">
          <div className="cd-section-head">
            <p>Urgent offers</p>
            <h2>Fresh stock ending soon</h2>
          </div>

          <div className="cd-deals-grid">
            {quickDeals.map((deal) => (
              <article key={deal.id} className="cd-deal-card">
                <h3>{deal.title}</h3>
                <p className="cd-deal-offer">{deal.offer}</p>
                <p className="cd-deal-meta">{deal.eta}</p>
                <button
                  className="cd-btn cd-btn-primary cd-btn-small"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ConsumerDashboard;

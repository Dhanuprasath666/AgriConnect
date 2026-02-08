import React from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";

const ConsumerDashboard = () => {
  const navigate = useNavigate();

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

  return (
    <div className="cd-page">
      <header className="cd-topbar">
        <button className="cd-brand" onClick={() => navigate("/")}>
          AgriConnect
        </button>
        <button
          className="cd-login-btn"
          onClick={() => navigate("/consumer/login")}
        >
          Consumer Login
        </button>
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
                onClick={() => navigate("/consumer/login")}
              >
                Track Orders
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
                  onClick={() => navigate("/consumer/login")}
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

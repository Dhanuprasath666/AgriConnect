import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";
import farmBg from "../assets/farm-bg.jpg";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

function isDealActive(item) {
  if (!item?.isUrgentDeal) return false;
  if (!item?.dealExpiryTime) return true;
  const expiry = item.dealExpiryTime?.toDate?.() || new Date(item.dealExpiryTime);
  return expiry.getTime() > Date.now();
}

function formatDealCountdown(item) {
  if (!item?.dealExpiryTime) return null;
  const expiry = item.dealExpiryTime?.toDate?.() || new Date(item.dealExpiryTime);
  const ms = expiry.getTime() - Date.now();
  if (!Number.isFinite(ms)) return null;
  if (ms <= 0) return "Expired";
  const totalMin = Math.floor(ms / (1000 * 60));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h <= 0 ? `${m}m left` : `${h}h ${m}m left`;
}

const LandingPage = () => {
  const navigate = useNavigate();

  const openFarmerLoginFromTop = () => {
    navigate("/farmer/login", {
      state: { farmerLoginAccess: "top-nav" },
    });
  };

  const [marketItems, setMarketItems] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "marketItems"), orderBy("updatedAt", "desc"), limit(30));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMarketItems(data);
    });

    return () => unsub();
  }, []);

  const urgentDeals = useMemo(() => {
    return marketItems.filter(isDealActive).slice(0, 6);
  }, [marketItems]);

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
            {urgentDeals.length === 0 ? (
              <p className="muted">No urgent deals right now. Check back soon.</p>
            ) : (
              urgentDeals.map((deal) => (
                <article className="lp-deal-card" key={deal.id}>
                  <h3>{deal.productName || "Urgent deal"}</h3>
                  <p className="lp-deal-discount">
                    {typeof deal.discountPercent === "number"
                      ? `${Math.round(deal.discountPercent)}% OFF`
                      : "Limited-time deal"}
                  </p>
                  <p className="lp-deal-meta">
                    {deal.quantityKg ?? "--"} {deal.unit || "kg"} available
                    {formatDealCountdown(deal) ? ` / ${formatDealCountdown(deal)}` : ""}
                  </p>
                <button
                  className="lp-btn lp-btn-primary lp-btn-small"
                  onClick={() => navigate("/consumer/login")}
                >
                  Buy Now
                </button>
                </article>
              ))
            )}
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

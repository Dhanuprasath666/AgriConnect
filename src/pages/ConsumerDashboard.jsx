import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { getConsumerSession } from "../utils/consumerSession";
import { clearAllAuth, isConsumerAuthenticated } from "../utils/auth";
import { setPostLoginRedirect, storeBuyNowItem } from "../utils/buyNowFlow";
import "../style.css";
import { useState } from "react";
import UrgentDealsScroller from "../components/UrgentDealsScroller";

const ConsumerDashboard = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [marketItems, setMarketItems] = useState([]);
  const [marketLoading, setMarketLoading] = useState(true);
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

  const scrollerDeals = marketItems
    .filter((item) => Boolean(item.isUrgentDeal))
    .map((item) => ({
      id: item.id,
      title: item.productName || item.name,
      badge:
        typeof item.discountPercent === "number"
          ? `Up to ${item.discountPercent}% off`
          : "Urgent deal",
      meta: item.dealExpiryTime
        ? `Ends ${new Date(
            item.dealExpiryTime?.toDate?.() || item.dealExpiryTime
          ).toLocaleString()}`
        : "",
      raw: item,
    }));

  const handleStartShopping = () => {
    if (categories.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * categories.length);
    navigate(categories[randomIndex].path);
  };

  const handleBuyNow = () => {
    if (isConsumerAuthenticated()) {
      navigate("/consumer/buy-now");
    } else {
      setPostLoginRedirect("/consumer/buy-now");
      navigate("/login/consumer", {
        state: { redirectTo: "/consumer/buy-now" },
      });
    }
  };

  const handleBuyNowItem = (item) => {
    const payload = {
      id: item.id,
      productName: item.productName || item.name,
      pricePerKg: Number(item.pricePerKg ?? item.price) || 0,
      quantityKg: Number(item.quantityKg ?? item.quantity) || 0,
      unit: item.unit || "kg",
      farmerId: item.farmerId || item.ownerFarmerId,
      farmerName: item.farmerName,
      location: item.location,
      category: item.category,
      source: "firestore",
    };

    storeBuyNowItem(payload);

    if (!isConsumerAuthenticated()) {
      setPostLoginRedirect("/consumer/buy-now", payload);
      navigate("/login/consumer", {
        state: { redirectTo: "/consumer/buy-now", buyNowItem: payload },
      });
      return;
    }

    navigate("/consumer/buy-now", { state: { item: payload } });
  };

  const handleLogout = () => {
    clearAllAuth();
    setShowProfileMenu(false);
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "marketItems"),
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const aTime =
              a.createdAt?.toDate?.()?.getTime?.() ||
              new Date(a.createdAt || 0).getTime() ||
              0;
            const bTime =
              b.createdAt?.toDate?.()?.getTime?.() ||
              new Date(b.createdAt || 0).getTime() ||
              0;
            return bTime - aTime;
          });
        setMarketItems(data);
        setMarketLoading(false);
      },
      () => {
        setMarketItems([]);
        setMarketLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return (
    <div className="cd-page">
      <header className="cd-topbar">
        <button className="cd-brand" onClick={() => navigate("/")}>
          <span className="ac-brand-text">AC</span>
        </button>
        <div className="cd-topbar-actions">
          {isConsumerAuthenticated() ? (
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
                  <button onClick={() => navigate("/")}>Home</button>
                  <button onClick={() => navigate("/consumer/dashboard")}>
                    Marketplace
                  </button>
                  <button onClick={() => navigate("/consumer/profile")}>
                    My Profile
                  </button>
                  <button onClick={() => navigate("/consumer/orders")}>
                    My Orders
                  </button>
                  <button className="logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="cd-login-btn"
              onClick={() => navigate("/login/consumer")}
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

        <section className="cd-section">
          <div className="cd-section-head">
            <p>Latest listings</p>
            <h2>Newly added by farmers</h2>
          </div>

          {marketLoading ? (
            <p className="market-empty">Loading products...</p>
          ) : marketItems.length === 0 ? (
            <p className="market-empty">No products available yet.</p>
          ) : (
            <div className="market-grid">
              {marketItems.slice(0, 12).map((item) => (
                <div key={item.id} className="market-card consumer-card">
                  <h3>{item.productName || "Product"}</h3>
                  <p>{item.category || "Category"}</p>
                  <p>INR {item.pricePerKg ?? "--"} / {item.unit || "kg"}</p>
                  <p>Available: {item.quantityKg ?? "--"} {item.unit || "kg"}</p>
                  <button
                    className="market-buy-btn"
                    onClick={() => handleBuyNowItem(item)}
                  >
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="cd-section cd-section-soft">
          <div className="cd-section-head">
            <p>Urgent offers</p>
            <h2>Fresh stock ending soon</h2>
          </div>

          <UrgentDealsScroller
            deals={scrollerDeals}
            emptyText="No urgent offers right now."
            cardClassName="cd-deal-card"
            showButton
            buttonLabel="Buy Now"
            onDealClick={(deal) => {
              if (deal?.raw) {
                handleBuyNowItem(deal.raw);
              }
            }}
          />
        </section>
      </main>
    </div>
  );
};

export default ConsumerDashboard;


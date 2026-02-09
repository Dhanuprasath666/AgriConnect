import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { getConsumerSession } from "../utils/consumerSession";
import { clearAllAuth, isConsumerAuthenticated } from "../utils/auth";
import { setPostLoginRedirect, storeBuyNowItem } from "../utils/buyNowFlow";
import "../style.css";

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

function discountedPrice(item) {
  const base = Number(item?.pricePerKg ?? item?.price ?? 0);
  if (!Number.isFinite(base) || base <= 0) return null;
  const discount = Number(item?.discountPercent ?? 0);
  if (!Number.isFinite(discount) || discount <= 0) return base;
  return Math.round(base * (1 - discount / 100));
}

const ConsumerMarket = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const session = getConsumerSession();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "marketItems"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setItems(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleLogout = () => {
    clearAllAuth();
    setShowProfileMenu(false);
    navigate("/", { replace: true });
  };

  const handleBuyNow = (item) => {
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

  return (
    <div className="market-container">
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
                  <p>
                    <strong>{session?.name || "Consumer"}</strong>
                  </p>
                  <p>{session?.email || "email@example.com"}</p>
                  <button onClick={() => navigate("/")}>Home</button>
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
      <h2 className="market-title">Consumer Market</h2>

      {loading ? (
        <p className="market-empty">Loading products...</p>
      ) : items.length === 0 ? (
        <p className="market-empty">No products available yet.</p>
      ) : (
        <div className="market-grid">
          {items.map((item) => (
            <div key={item.id} className="market-card consumer-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <h3 style={{ margin: 0 }}>
                  {item.productName || item.name || "Unnamed Product"}
                </h3>
                {isDealActive(item) && (
                  <span className="cc-badge">
                    Urgent deal{formatDealCountdown(item) ? ` • ${formatDealCountdown(item)}` : ""}
                  </span>
                )}
              </div>

              <p>
                Price: INR{" "}
                {isDealActive(item) && discountedPrice(item) != null ? (
                  <>
                    <strong>{discountedPrice(item)}</strong>{" "}
                    <span className="muted" style={{ textDecoration: "line-through", marginLeft: 6 }}>
                      {item.pricePerKg ?? item.price ?? "-"}
                    </span>
                    {typeof item.discountPercent === "number" && (
                      <span className="muted" style={{ marginLeft: 8 }}>
                        ({Math.round(item.discountPercent)}% off)
                      </span>
                    )}
                  </>
                ) : (
                  <strong>{item.pricePerKg ?? item.price ?? "-"}</strong>
                )}{" "}
                / {item.unit || "kg"}
              </p>

              <p>
                Quantity: {item.quantityKg ?? item.quantity ?? "-"} {item.unit || "kg"}
              </p>

              <p>Location: {item.location || "Location not specified"}</p>

              <button
                className="cd-btn cd-btn-primary cd-btn-small"
                onClick={() => handleBuyNow(item)}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsumerMarket;

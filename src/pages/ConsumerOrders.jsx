import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { getConsumerSession } from "../utils/consumerSession";
import { clearAllAuth, getConsumerIdentity } from "../utils/auth";
import "../style.css";

const ConsumerOrders = () => {
  const navigate = useNavigate();
  const session = getConsumerSession();
  const consumerIdentity = getConsumerIdentity();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const consumerKey = useMemo(() => {
    return consumerIdentity?.consumerId || session?.mobile || "";
  }, [consumerIdentity?.consumerId, session?.mobile]);

  useEffect(() => {
    if (!consumerKey) return;
    setLoading(true);
    setError("");

    const dataMap = new Map();

    const applySnapshot = (snapshot) => {
      snapshot.docs.forEach((docSnap) => {
        dataMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
      });
      const merged = Array.from(dataMap.values()).sort((a, b) => {
        const aTime = a.createdAt?.toDate?.()?.getTime?.() || 0;
        const bTime = b.createdAt?.toDate?.()?.getTime?.() || 0;
        return bTime - aTime;
      });
      setOrders(merged);
      setLoading(false);
    };

    const handleError = (err) => {
      setError(err?.message || "Unable to load orders.");
      setLoading(false);
    };

    const qById = query(
      collection(db, "orders"),
      where("consumerId", "==", consumerKey),
      orderBy("createdAt", "desc")
    );
    const qByMobile = query(
      collection(db, "orders"),
      where("consumerMobile", "==", consumerKey),
      orderBy("createdAt", "desc")
    );

    const unsubById = onSnapshot(qById, applySnapshot, handleError);
    const unsubByMobile = onSnapshot(qByMobile, applySnapshot, handleError);

    return () => {
      unsubById();
      unsubByMobile();
    };
  }, [consumerKey]);

  const handleLogout = () => {
    clearAllAuth();
    setShowProfileMenu(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="orders-page">
      <header className="cd-topbar">
        <button className="cd-brand" onClick={() => navigate("/")}>
          <span className="ac-brand-text">AC</span>
        </button>
        <div className="cd-topbar-actions">
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
                <button onClick={() => navigate("/consumer/market")}>
                  Go To Market
                </button>
                <button className="logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="orders-main">
        <div className="orders-head">
          <h1>My Orders</h1>
          <button
            className="cd-btn cd-btn-primary"
            onClick={() => navigate("/consumer/market")}
          >
            Go To Market
          </button>
        </div>

        {loading ? (
          <p className="orders-empty">Loading orders...</p>
        ) : error ? (
          <p className="orders-empty">{error}</p>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <p>No orders placed yet.</p>
            <button
              className="cd-btn cd-btn-primary"
              onClick={() => navigate("/consumer/market")}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const createdAt = order.createdAt?.toDate?.() || order.createdAt;
              const dateLabel = createdAt
                ? new Date(createdAt).toLocaleString()
                : "N/A";
              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <p className="order-id">Order #{order.orderId || order.id}</p>
                      <p className="order-date">{dateLabel}</p>
                    </div>
                    <span className="order-status status-processing">
                      {order.orderStatus || "Placed"}
                    </span>
                  </div>
                  <div className="order-items">
                    <p>
                      {order.productName || "Product"} - {order.quantity}{" "}
                      {order.unit || "kg"}
                    </p>
                    <p>
                      Price: INR {order.price || 0} per {order.unit || "kg"}
                    </p>
                  </div>
                  <div className="order-footer">
                    <p className="order-total">INR {order.totalPrice || 0}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ConsumerOrders;

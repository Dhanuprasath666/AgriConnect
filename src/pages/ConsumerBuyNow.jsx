import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { getConsumerSession } from "../utils/consumerSession";
import { clearAllAuth, getConsumerIdentity } from "../utils/auth";
import {
  clearStoredBuyNowItem,
  getStoredBuyNowItem,
} from "../utils/buyNowFlow";
import "../style.css";

const ConsumerBuyNow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getConsumerSession();
  const consumerIdentity = getConsumerIdentity();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => {
    const stateItem = location.state?.item;
    const storedItem = getStoredBuyNowItem();
    const resolved = stateItem || storedItem;
    if (resolved) {
      setItem(resolved);
      clearStoredBuyNowItem();
    }
  }, [location.state]);

  const availableStock = useMemo(() => {
    const stock = Number(item?.quantityKg ?? item?.quantity ?? 0);
    return Number.isFinite(stock) ? stock : 0;
  }, [item]);

  const pricePerKg = useMemo(() => {
    const price = Number(item?.pricePerKg ?? item?.price ?? 0);
    return Number.isFinite(price) ? price : 0;
  }, [item]);

  const totalPrice = useMemo(() => pricePerKg * quantity, [pricePerKg, quantity]);

  const handleLogout = () => {
    clearAllAuth();
    setShowProfileMenu(false);
    navigate("/", { replace: true });
  };

  const validateQuantity = (value) => {
    if (availableStock <= 0) {
      return "This product is out of stock.";
    }
    if (!Number.isFinite(value) || value <= 0) {
      return "Quantity must be at least 1.";
    }
    if (availableStock > 0 && value > availableStock) {
      return `Only ${availableStock} ${item?.unit || "kg"} available.`;
    }
    return "";
  };

  const handlePlaceOrder = async () => {
    if (!item) return;

    const desiredQty = Number(quantity);
    const validationError = validateQuantity(desiredQty);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsPlacing(true);

    try {
      const productRef = doc(db, "marketItems", item.id);
      const orderRef = doc(collection(db, "orders"));
      const notificationRef = doc(collection(db, "notifications"));

      await runTransaction(db, async (transaction) => {
        // Transaction ensures stock decrement + order + notification stay consistent.
        const productSnap = await transaction.get(productRef);
        if (!productSnap.exists()) {
          throw new Error("This product is no longer available.");
        }

        const productData = productSnap.data() || {};
        const currentQty = Number(
          productData.quantityKg ?? productData.quantity ?? 0
        );
        if (!Number.isFinite(currentQty) || currentQty <= 0) {
          throw new Error("This product is out of stock.");
        }
        if (desiredQty > currentQty) {
          throw new Error(`Only ${currentQty} ${item?.unit || "kg"} left.`);
        }

        const updatedQty = currentQty - desiredQty;
        transaction.update(productRef, {
          quantityKg: updatedQty,
          quantity: updatedQty,
          outOfStock: updatedQty === 0,
          updatedAt: serverTimestamp(),
        });

        const consumerName = consumerIdentity?.name || "Consumer";
        const consumerMobile = consumerIdentity?.mobile || "";
        const consumerId = consumerIdentity?.consumerId || consumerMobile || "unknown";
        const productName = item.productName || productData.productName || "Product";
        const unit = item.unit || productData.unit || "kg";
        const notificationUnit = "kg";
        const farmerId =
          item.farmerId || productData.farmerId || productData.ownerFarmerId;
        const farmerName = item.farmerName || productData.farmerName || "";

        transaction.set(orderRef, {
          orderId: orderRef.id,
          consumerId,
          consumerName,
          consumerMobile,
          productId: item.id,
          productName,
          farmerId: farmerId || "unknown",
          farmerName,
          quantity: desiredQty,
          unit,
          price: pricePerKg,
          totalPrice: desiredQty * pricePerKg,
          orderStatus: "Placed",
          createdAt: serverTimestamp(),
        });

        transaction.set(notificationRef, {
          farmerId: farmerId || "unknown",
          orderId: orderRef.id,
          consumerName,
          message: `Consumer ${consumerName} purchased ${desiredQty} ${notificationUnit} of ${productName}`,
          read: false,
          createdAt: serverTimestamp(),
        });
      });

      navigate("/consumer/orders", { replace: true });
    } catch (e) {
      setError(e?.message || "Unable to place order. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  if (!item) {
    return (
      <div className="bn-page">
        <div className="bn-card">
          <h2>No product selected</h2>
          <p>Select a product from the marketplace to buy now.</p>
          <button className="bn-btn bn-btn-primary" onClick={() => navigate("/consumer/market")}>
            Go To Market
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bn-page">
      <header className="bn-topbar">
        <button className="bn-back" onClick={() => navigate(-1)}>
          Back
        </button>
        <div className="bn-topbar-actions">
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
                <button onClick={() => navigate("/consumer/profile")}>My Profile</button>
                <button onClick={() => navigate("/consumer/orders")}>My Orders</button>
                <button className="logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="bn-main">
        <section className="bn-product">
          <div className="bn-product-head">
            <h1>{item.productName || item.name || "Product"}</h1>
            <span className="bn-chip">{item.category || "Fresh produce"}</span>
          </div>
          <p className="bn-meta">
            Sold by {item.farmerName || "Farmer"} | {item.location || "Location not specified"}
          </p>
          <div className="bn-price">
            INR {pricePerKg} <span>per {item.unit || "kg"}</span>
          </div>
          <div className="bn-stock">
            Available: {availableStock} {item.unit || "kg"}
          </div>
        </section>

        <section className="bn-order">
          <h2>Choose quantity</h2>
          <div className="bn-qty-row">
            <input
              type="number"
              min="1"
              max={availableStock || undefined}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              onBlur={(e) => setError(validateQuantity(Number(e.target.value)))}
            />
            <span>{item.unit || "kg"}</span>
          </div>

          <div className="bn-summary">
            <div>
              <span>Subtotal</span>
              <strong>INR {totalPrice.toFixed(2)}</strong>
            </div>
            <div>
              <span>Stock limit</span>
              <strong>
                {availableStock} {item.unit || "kg"}
              </strong>
            </div>
          </div>

          {error && <p className="bn-error">{error}</p>}

          <button
            className="bn-btn bn-btn-primary"
            onClick={handlePlaceOrder}
            disabled={isPlacing}
          >
            {isPlacing ? "Placing order..." : "Place Order"}
          </button>
        </section>
      </main>
    </div>
  );
};

export default ConsumerBuyNow;

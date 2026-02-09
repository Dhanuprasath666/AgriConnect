import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
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

  return (
    <div className="market-container">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsumerMarket;

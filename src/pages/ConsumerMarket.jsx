import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "../style.css";

const ConsumerMarket = () => {
  const navigate = useNavigate();
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
        <div className="market-content">
          <div className="market-grid">
            {items.map((item) => (
              <div key={item.id} className="market-card consumer-card">
                <h3>{item.productName || item.name || "Unnamed Product"}</h3>

                <p>
                  Price: INR {item.pricePerKg ?? item.price ?? "-"} / {item.unit || "kg"}
                </p>

                <p>
                  Quantity: {item.quantityKg ?? item.quantity ?? "-"} {item.unit || "kg"}
                </p>

                <p>Location: {item.location || "Location not specified"}</p>
              </div>
            ))}
          </div>

          <button
            className="market-buy-btn"
            onClick={() => navigate("/consumer/buy-now")}
          >
            🛒 Buy Now
          </button>
        </div>
      )}
    </div>
  );
};

export default ConsumerMarket;

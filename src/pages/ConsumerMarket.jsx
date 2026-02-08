import React, { useEffect, useState } from "react";
import "../style.css";

const ConsumerMarket = () => {
  const [items, setItems] = useState([]);

  // ✅ Load on page open
  useEffect(() => {
    const data =
      JSON.parse(localStorage.getItem("market_items")) || [];
    setItems(data);
  }, []);

  // 🔁 PRO: Listen for storage updates
  useEffect(() => {
    const handleStorageChange = () => {
      const data =
        JSON.parse(localStorage.getItem("market_items")) || [];
      setItems(data);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  return (
    <div className="market-container">
      <h2 className="market-title">🛒 Consumer Market</h2>

      {items.length === 0 ? (
        <p className="market-empty">
          No products available yet.
        </p>
      ) : (
        <div className="market-grid">
          {items.map((item) => (
            <div
              key={item.id}
              className="market-card consumer-card"
            >
              <h3>{item.name}</h3>
              <p>💰 ₹{item.price} / kg</p>
              <p>📦 {item.quantity} kg</p>
              <p>📍 {item.location}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsumerMarket;

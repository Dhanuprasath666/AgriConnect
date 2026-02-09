import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase"; // adjust path if needed
import { isConsumerLoggedIn, getConsumerSession, clearConsumerSession } from "../utils/consumerSession";
import "../style.css";

/* --------------------------------------------------
   KEEP HARDCODED DATA (UNCHANGED)
-------------------------------------------------- */

const categoryCatalog = {
  fruits: {
    title: "Fruits",
    description: "Fresh fruit listings from nearby farms.",
    items: [
      {
        id: "h1",
        name: "Banana",
        price: "INR 45 / kg",
        stock: "20 kg available",
        farm: "Green Valley Farm",
        urgent: true,
      },
      {
        id: "h2",
        name: "Guava",
        price: "INR 60 / kg",
        stock: "14 kg available",
        farm: "Sunrise Orchards",
        urgent: false,
      },
      {
        id: "h3",
        name: "Papaya",
        price: "INR 55 / kg",
        stock: "16 kg available",
        farm: "Riverbank Farm",
        urgent: false,
      },
    ],
  },

  vegetables: {
    title: "Vegetables",
    description:
      "Daily-use vegetables with transparent farm pricing.",
    items: [
      {
        id: "h4",
        name: "Tomato",
        price: "INR 40 / kg",
        stock: "25 kg available",
        farm: "Maa Lakshmi Farms",
        urgent: true,
      },
      {
        id: "h5",
        name: "Potato",
        price: "INR 32 / kg",
        stock: "40 kg available",
        farm: "Harvest Hub",
        urgent: false,
      },
      {
        id: "h6",
        name: "Spinach",
        price: "INR 24 / bundle",
        stock: "30 bundles",
        farm: "Fresh Field Collective",
        urgent: true,
      },
    ],
  },

  saplings: {
    title: "Plant Saplings",
    description:
      "Healthy saplings selected for home and terrace gardens.",
    items: [
      {
        id: "h7",
        name: "Mango Sapling",
        price: "INR 120 / plant",
        stock: "18 plants",
        farm: "Hari Nursery",
        urgent: false,
      },
      {
        id: "h8",
        name: "Guava Sapling",
        price: "INR 95 / plant",
        stock: "22 plants",
        farm: "Vruksha Gardens",
        urgent: false,
      },
      {
        id: "h9",
        name: "Lemon Sapling",
        price: "INR 85 / plant",
        stock: "15 plants",
        farm: "Agri Bloom Nursery",
        urgent: true,
      },
    ],
  },

  products: {
    title: "Plant Products",
    description:
      "Value-added agricultural products and farm byproducts.",
    items: [
      {
        id: "h10",
        name: "Cold-Pressed Groundnut Oil",
        price: "INR 220 / liter",
        stock: "35 liters",
        farm: "PureCrop Foods",
        urgent: false,
      },
      {
        id: "h11",
        name: "Organic Compost",
        price: "INR 180 / bag",
        stock: "28 bags",
        farm: "SoilCare Organics",
        urgent: false,
      },
      {
        id: "h12",
        name: "Dried Curry Leaves",
        price: "INR 55 / pack",
        stock: "40 packs",
        farm: "Leafline Naturals",
        urgent: true,
      },
    ],
  },
};

/* --------------------------------------------------
   COMPONENT
-------------------------------------------------- */

const ConsumerCategory = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const session = getConsumerSession();

  const selectedKey = (category || "").toLowerCase();
  const selectedCategory = categoryCatalog[selectedKey];
  const categoryKeys = Object.keys(categoryCatalog);

  /* -------------------------------
     FIRESTORE STATE
  -------------------------------- */

  const [fireItems, setFireItems] = useState([]);

  /* -------------------------------
     FIRESTORE LISTENER
  -------------------------------- */

  useEffect(() => {
    if (!selectedCategory) return;

    const q = query(
      collection(db, "marketItems"),
      where("category", "==", selectedCategory.title)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFireItems(data);
    });

    return () => unsubscribe();
  }, [selectedCategory]);

  /* -------------------------------
     MERGE HARDCODED + FIRESTORE
  -------------------------------- */

  const mergedItems = [
    ...selectedCategory.items.map((item) => ({
      ...item,
      __source: "hardcoded",
    })),

    ...fireItems.map((item) => ({
      id: item.id,
      name: item.productName,
      farm: item.farmerName,
      price: `INR ${item.pricePerKg} / ${item.unit}`,
      stock: `${item.quantityKg} ${item.unit} available`,
      urgent: item.quantityKg < 10,
      __source: "firestore",
    })),
  ];

  /* -------------------------------
     RANDOM CATEGORY
  -------------------------------- */

  const handleRandomCategory = () => {
    const otherKeys = categoryKeys.filter(
      (key) => key !== selectedKey
    );
    const pool = otherKeys.length > 0
      ? otherKeys
      : categoryKeys;

    const randomIndex = Math.floor(
      Math.random() * pool.length
    );

    navigate(`/consumer/${pool[randomIndex]}`);
  };

  const handleLogout = () => {
    clearConsumerSession();
    setShowProfileMenu(false);
    navigate("/consumer/login");
  };

  /* -------------------------------
     INVALID CATEGORY
  -------------------------------- */

  if (!selectedCategory) {
    return (
      <div className="cd-page">
        <h2>Category not found</h2>
      </div>
    );
  }

  /* -------------------------------
     UI
  -------------------------------- */

  return (
    <div className="cd-page">
      <header className="cd-topbar">
        <button
          className="cd-brand"
          onClick={() => navigate("/")}
        >
          AgriConnect
        </button>

        <div className="cd-topbar-actions">
          <button
            className="cd-login-btn"
            onClick={() => navigate("/consumer")}
          >
            All Categories
          </button>

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
        <section className="cc-hero">
          <p className="cd-kicker">
            {selectedCategory.title}
          </p>

          <h1>
            {selectedCategory.title} listings from
            local farmers
          </h1>

          <p className="cc-hero-text">
            {selectedCategory.description}
          </p>

          <div className="cc-actions">
            <button
              className="cd-btn cd-btn-secondary"
              onClick={() => navigate("/consumer")}
            >
              Back to Categories
            </button>

            <button
              className="cd-btn cd-btn-primary"
              onClick={handleRandomCategory}
            >
              Open Random Category
            </button>
          </div>
        </section>

        <section className="cd-section cd-section-soft">
          <div className="cd-section-head">
            <p>{selectedCategory.title}</p>
            <h2>Available items in this category</h2>
          </div>

          <div className="cc-grid">
            {mergedItems.map((item) => (
              <article
                className="cc-card"
                key={`${item.__source}-${item.id}`}
              >
                <div className="cc-card-head">
                  <h3>{item.name}</h3>

                  {item.urgent && (
                    <span className="cc-badge">
                      Ending soon
                    </span>
                  )}
                </div>

                <p className="cc-farm">{item.farm}</p>
                <p className="cc-price">
                  {item.price}
                </p>
                <p className="cc-stock">
                  {item.stock}
                </p>

                <button
                  className="cd-btn cd-btn-primary cd-btn-small"
                  onClick={() =>
                    navigate("/consumer/login")
                  }
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

export default ConsumerCategory;

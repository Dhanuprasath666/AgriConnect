import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../style.css";

const categoryCatalog = {
  fruits: {
    title: "Fruits",
    description: "Fresh fruit listings from nearby farms.",
    items: [
      {
        id: 1,
        name: "Banana",
        price: "INR 45 / kg",
        stock: "20 kg available",
        farm: "Green Valley Farm",
        urgent: true,
      },
      {
        id: 2,
        name: "Guava",
        price: "INR 60 / kg",
        stock: "14 kg available",
        farm: "Sunrise Orchards",
        urgent: false,
      },
      {
        id: 3,
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
    description: "Daily-use vegetables with transparent farm pricing.",
    items: [
      {
        id: 1,
        name: "Tomato",
        price: "INR 40 / kg",
        stock: "25 kg available",
        farm: "Maa Lakshmi Farms",
        urgent: true,
      },
      {
        id: 2,
        name: "Potato",
        price: "INR 32 / kg",
        stock: "40 kg available",
        farm: "Harvest Hub",
        urgent: false,
      },
      {
        id: 3,
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
    description: "Healthy saplings selected for home and terrace gardens.",
    items: [
      {
        id: 1,
        name: "Mango Sapling",
        price: "INR 120 / plant",
        stock: "18 plants",
        farm: "Hari Nursery",
        urgent: false,
      },
      {
        id: 2,
        name: "Guava Sapling",
        price: "INR 95 / plant",
        stock: "22 plants",
        farm: "Vruksha Gardens",
        urgent: false,
      },
      {
        id: 3,
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
    description: "Value-added agricultural products and farm byproducts.",
    items: [
      {
        id: 1,
        name: "Cold-Pressed Groundnut Oil",
        price: "INR 220 / liter",
        stock: "35 liters",
        farm: "PureCrop Foods",
        urgent: false,
      },
      {
        id: 2,
        name: "Organic Compost",
        price: "INR 180 / bag",
        stock: "28 bags",
        farm: "SoilCare Organics",
        urgent: false,
      },
      {
        id: 3,
        name: "Dried Curry Leaves",
        price: "INR 55 / pack",
        stock: "40 packs",
        farm: "Leafline Naturals",
        urgent: true,
      },
    ],
  },
};

const ConsumerCategory = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const selectedKey = (category || "").toLowerCase();
  const selectedCategory = categoryCatalog[selectedKey];
  const categoryKeys = Object.keys(categoryCatalog);

  const handleRandomCategory = () => {
    const otherKeys = categoryKeys.filter((key) => key !== selectedKey);
    const pool = otherKeys.length > 0 ? otherKeys : categoryKeys;
    const randomIndex = Math.floor(Math.random() * pool.length);
    navigate(`/consumer/${pool[randomIndex]}`);
  };

  if (!selectedCategory) {
    return (
      <div className="cd-page">
        <header className="cd-topbar">
          <button className="cd-brand" onClick={() => navigate("/")}>
            AgriConnect
          </button>
          <button className="cd-login-btn" onClick={() => navigate("/consumer")}>
            Back to Categories
          </button>
        </header>

        <main className="cd-main">
          <section className="cc-hero">
            <p className="cd-kicker">Category not found</p>
            <h1>This category is not available.</h1>
            <p className="cc-hero-text">
              Please return to the consumer dashboard and select an available
              category.
            </p>
            <button
              className="cd-btn cd-btn-primary"
              onClick={() => navigate("/consumer")}
            >
              Open Consumer Dashboard
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="cd-page">
      <header className="cd-topbar">
        <button className="cd-brand" onClick={() => navigate("/")}>
          AgriConnect
        </button>
        <button className="cd-login-btn" onClick={() => navigate("/consumer")}>
          All Categories
        </button>
      </header>

      <main className="cd-main">
        <section className="cc-hero">
          <p className="cd-kicker">{selectedCategory.title}</p>
          <h1>{selectedCategory.title} listings from local farmers</h1>
          <p className="cc-hero-text">{selectedCategory.description}</p>

          <div className="cc-actions">
            <button
              className="cd-btn cd-btn-secondary"
              onClick={() => navigate("/consumer")}
            >
              Back to Categories
            </button>
            <button className="cd-btn cd-btn-primary" onClick={handleRandomCategory}>
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
            {selectedCategory.items.map((item) => (
              <article className="cc-card" key={item.id}>
                <div className="cc-card-head">
                  <h3>{item.name}</h3>
                  {item.urgent && <span className="cc-badge">Ending soon</span>}
                </div>
                <p className="cc-farm">{item.farm}</p>
                <p className="cc-price">{item.price}</p>
                <p className="cc-stock">{item.stock}</p>
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

export default ConsumerCategory;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import "../style.css";

const AddProduct = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");

  // 🔥 THIS FUNCTION RUNS ONLY WHEN CALLED
  const addProductToMarket = async (product) => {
    await addDoc(collection(db, "marketItems"), {
      ...product,
      createdAt: serverTimestamp(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newItem = {
      name,
      price,
      quantity,
      location,
    };

    // 👉 Firebase called HERE
    await addProductToMarket(newItem);

    alert("ADDED SUCCESSFULLY");
    navigate("/farmer/dashboard");
  };

  return (
    <div className="market-container">
      <form className="add-form" onSubmit={handleSubmit}>
        <h2>🧑‍🌾 Add Product</h2>

        <input
          type="text"
          placeholder="Crop Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Price per kg"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Quantity (kg)"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Village / District"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <button className="market-btn add-submit" type="submit">
          Add to Market
        </button>
      </form>
    </div>
  );
};

export default AddProduct;

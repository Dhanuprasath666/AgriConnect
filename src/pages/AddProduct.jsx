import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import "../style.css";

const AddProduct = () => {
  const navigate = useNavigate();

  const [productName, setProductName] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newItem = {
      productName,
      pricePerKg: Number(pricePerKg),
      quantityKg: Number(quantityKg),
      location,
      category, // 🔥 IMPORTANT
      farmerName: "Demo Farmer", // later from auth
      unit: "kg",
    };

    await addDoc(collection(db, "marketItems"), {
      ...newItem,
      createdAt: serverTimestamp(),
    });

    alert("ADDED SUCCESSFULLY");
    navigate("/farmer/dashboard");
  };

  return (
    <div className="market-container">
      <form className="add-form" onSubmit={handleSubmit}>
        <h2>🧑‍🌾 Add Product</h2>

        {/* PRODUCT NAME */}
        <input
          type="text"
          placeholder="Crop Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />

        {/* CATEGORY */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          <option value="Fruits">Fruits</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Plant Saplings">Plant Saplings</option>
          <option value="Plant Products">Plant Products</option>
        </select>

        {/* PRICE */}
        <input
          type="number"
          placeholder="Price per kg"
          value={pricePerKg}
          onChange={(e) => setPricePerKg(e.target.value)}
          required
        />

        {/* QUANTITY */}
        <input
          type="number"
          placeholder="Quantity (kg)"
          value={quantityKg}
          onChange={(e) => setQuantityKg(e.target.value)}
          required
        />

        {/* LOCATION */}
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

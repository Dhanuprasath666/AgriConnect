import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { getCurrentFarmerId, getCurrentFarmerName } from "../lib/currentFarmer";
import "../style.css";

const AddProduct = () => {
  const navigate = useNavigate();

  const [productName, setProductName] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [isUrgentDeal, setIsUrgentDeal] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("");
  const [dealExpiryHours, setDealExpiryHours] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const farmerId = getCurrentFarmerId();
    const farmerName = getCurrentFarmerName();

    const discount = discountPercent === "" ? null : Number(discountPercent);
    const expiryHours = dealExpiryHours === "" ? null : Number(dealExpiryHours);
    const expiry =
      isUrgentDeal && Number.isFinite(expiryHours) && expiryHours > 0
        ? new Date(Date.now() + expiryHours * 60 * 60 * 1000)
        : null;

    const newItem = {
      productName: productName.trim(),
      pricePerKg: Number(pricePerKg),
      quantityKg: Number(quantityKg),
      location: location.trim(),
      category,
      farmerId,
      farmerName,
      unit: "kg",
      isUrgentDeal: Boolean(isUrgentDeal),
      discountPercent:
        isUrgentDeal && Number.isFinite(discount) ? discount : null,
      dealExpiryTime: expiry,
    };

    await addDoc(collection(db, "marketItems"), {
      ...newItem,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    alert("ADDED SUCCESSFULLY");
    navigate("/farmer/dashboard");
  };

  return (
    <div className="market-container">
      <form className="add-form" onSubmit={handleSubmit}>
        <h2>Add Product</h2>

        <input
          type="text"
          placeholder="Crop Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />

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

        <input
          type="number"
          placeholder="Price per kg"
          value={pricePerKg}
          onChange={(e) => setPricePerKg(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Quantity (kg)"
          value={quantityKg}
          onChange={(e) => setQuantityKg(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Village / District"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={isUrgentDeal}
              onChange={(e) => setIsUrgentDeal(e.target.checked)}
            />
            Mark as Urgent Deal / Flash Sale
          </label>

          {isUrgentDeal && (
            <>
              <input
                type="number"
                placeholder="Discount % (optional)"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                min="0"
                max="80"
              />
              <input
                type="number"
                placeholder="Deal expiry in hours (optional)"
                value={dealExpiryHours}
                onChange={(e) => setDealExpiryHours(e.target.value)}
                min="1"
                max="168"
              />
            </>
          )}
        </div>

        <button className="market-btn add-submit" type="submit">
          Add to Market
        </button>
      </form>
    </div>
  );
};

export default AddProduct;


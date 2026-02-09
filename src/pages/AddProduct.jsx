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

    const farmerId = String(getCurrentFarmerId() || "").trim() || "demo-farmer";
    const farmerName = String(getCurrentFarmerName() || "").trim() || "Demo Farmer";

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
      ownerFarmerId: farmerId,
      sellerId: farmerId,
      ownerId: farmerId,
      createdBy: farmerId,
      unit: "kg",
      isUrgentDeal: Boolean(isUrgentDeal),
      discountPercent:
        isUrgentDeal && Number.isFinite(discount) ? discount : null,
      dealExpiryTime: expiry,
    };

    const createdDoc = await addDoc(collection(db, "marketItems"), {
      ...newItem,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (typeof window !== "undefined" && window.localStorage) {
      const ownerKeys = Array.from(
        new Set([farmerId, farmerId.toLowerCase()].filter(Boolean))
      );

      ownerKeys.forEach((ownerKey) => {
        const key = `ac_farmer_product_ids_${ownerKey}`;
        const existing = window.localStorage.getItem(key);
        let next = [];
        if (existing) {
          try {
            const parsed = JSON.parse(existing);
            next = Array.isArray(parsed) ? parsed : [];
          } catch {
            next = [];
          }
        }
        if (!next.includes(createdDoc.id)) next.push(createdDoc.id);
        window.localStorage.setItem(key, JSON.stringify(next));
      });
    }

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

        <div className="add-field">
          <label className="add-label" htmlFor="category-select">
            Select Category
          </label>
          <div className="add-select-wrap">
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Choose crop category</option>
              <option value="Fruits">Fruits</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Plant Saplings">Plant Saplings</option>
              <option value="Plant Products">Plant Products</option>
            </select>
          </div>
        </div>

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

        <div className="add-urgent-section">
          <label className="add-urgent-toggle">
            <input
              type="checkbox"
              checked={isUrgentDeal}
              onChange={(e) => setIsUrgentDeal(e.target.checked)}
            />
            <span className="add-urgent-copy">
              <span className="add-urgent-title">Mark as Urgent Deal</span>
              <span className="add-urgent-subtitle">
                Enable flash sale with optional discount and expiry
              </span>
            </span>
            <span className="add-urgent-chip">Flash Sale</span>
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


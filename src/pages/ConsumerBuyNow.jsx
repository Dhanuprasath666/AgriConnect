import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { getConsumerSession, clearConsumerSession } from "../utils/consumerSession";
import "../style.css";

const ConsumerBuyNow = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const session = getConsumerSession();
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("browse");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "card",
  });

  // Fetch products from Firebase
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

  // Add item to cart
  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  // Update quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.pricePerKg || item.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle checkout
  const handleCheckout = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      alert("Please fill in all required fields");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // Here you would typically send the order to your backend
    alert(
      `Order confirmed!\n\nItems: ${cart.length}\nTotal: ₹${calculateTotal().toFixed(2)}\n\nThank you for your purchase!`
    );

    // Reset form and cart
    setCart([]);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
      paymentMethod: "card",
    });
    setActiveTab("browse");
  };

  const handleLogout = () => {
    clearConsumerSession();
    setShowProfileMenu(false);
    navigate("/consumer/login");
  };

  return (
    <div className="buynow-container">
      <div className="buynow-header">
        <div className="buynow-header-left">
          <button className="buynow-back-btn" onClick={() => navigate("/consumer")}>
            ← Back to Dashboard
          </button>
          <div>
            <h1>Fresh Products from Farmers</h1>
            <p>🌱 Buy fresh, organic products directly from local farmers</p>
          </div>
        </div>
        <div className="buynow-header-right">
          {session ? (
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
                  <button onClick={() => navigate("/consumer")}>📊 Dashboard</button>
                  <button onClick={() => navigate("/consumer/profile")}>
                    👤 My Profile
                  </button>
                  <button className="logout" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="buynow-content">
        {/* Tab Navigation */}
        <div className="buynow-tabs">
          <button
            className={`buynow-tab ${activeTab === "browse" ? "active" : ""}`}
            onClick={() => setActiveTab("browse")}
          >
            🛒 Browse Products
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </button>
          <button
            className={`buynow-tab ${activeTab === "checkout" ? "active" : ""}`}
            onClick={() => setActiveTab("checkout")}
          >
            💳 Checkout
          </button>
        </div>

        {/* Browse Products Tab */}
        {activeTab === "browse" && (
          <div className="buynow-browse">
            {loading ? (
              <p className="buynow-loading">Loading products...</p>
            ) : items.length === 0 ? (
              <p className="buynow-empty">No products available yet.</p>
            ) : (
              <div className="buynow-products">
                {items.map((item) => (
                  <div key={item.id} className="buynow-product-card">
                    <div className="product-header">
                      <h3>{item.productName || item.name || "Unnamed Product"}</h3>
                      <span className="product-badge">Fresh</span>
                    </div>

                    <div className="product-details">
                      <p className="product-price">
                        ₹ {item.pricePerKg ?? item.price ?? "-"} / {item.unit || "kg"}
                      </p>
                      <p className="product-quantity">
                        📦 Available: {item.quantityKg ?? item.quantity ?? "-"} {item.unit || "kg"}
                      </p>
                      <p className="product-location">
                        📍 {item.location || "Location not specified"}
                      </p>
                      {item.description && <p className="product-desc">{item.description}</p>}
                    </div>

                    <button
                      className="product-add-btn"
                      onClick={() => addToCart(item)}
                    >
                      + Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Checkout Tab */}
        {activeTab === "checkout" && (
          <div className="buynow-checkout">
            <div className="checkout-wrapper">
              {/* Cart Summary */}
              <div className="checkout-cart">
                <h2>📋 Order Summary</h2>

                {cart.length === 0 ? (
                  <p className="empty-cart">Your cart is empty. Browse products first!</p>
                ) : (
                  <>
                    <div className="cart-items">
                      {cart.map((item) => {
                        const itemPrice = item.pricePerKg || item.price || 0;
                        const itemTotal = itemPrice * item.quantity;

                        return (
                          <div key={item.id} className="cart-item">
                            <div className="cart-item-info">
                              <h4>{item.productName || item.name}</h4>
                              <p className="cart-item-price">
                                ₹{itemPrice} × {item.quantity} = ₹{itemTotal.toFixed(2)}
                              </p>
                            </div>

                            <div className="cart-item-controls">
                              <button
                                className="qty-btn"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </button>
                              <span className="qty-display">{item.quantity}</span>
                              <button
                                className="qty-btn"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </button>
                              <button
                                className="remove-btn"
                                onClick={() => removeFromCart(item.id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="cart-totals">
                      <div className="total-row">
                        <span>Subtotal:</span>
                        <span>₹{calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="total-row">
                        <span>Delivery Charge:</span>
                        <span>₹50</span>
                      </div>
                      <div className="total-row final">
                        <span>Total Amount:</span>
                        <span>₹{(calculateTotal() + 50).toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Checkout Form */}
              <div className="checkout-form-wrapper">
                <h2>📍 Delivery Address</h2>

                <form onSubmit={handleCheckout} className="checkout-form">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Street Address *</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      placeholder="Enter delivery address"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleFormChange}
                        placeholder="City name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="pincode">Pincode</label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleFormChange}
                        placeholder="6-digit pincode"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="paymentMethod">Payment Method</label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleFormChange}
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="upi">UPI</option>
                      <option value="netbanking">Net Banking</option>
                      <option value="cod">Cash on Delivery</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="checkout-btn"
                    disabled={cart.length === 0}
                  >
                    🛍️ Complete Purchase
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerBuyNow;

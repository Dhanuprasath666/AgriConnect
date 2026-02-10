import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { getConsumerSession } from "../utils/consumerSession";
import { clearAllAuth, getConsumerIdentity, isConsumerAuthenticated } from "../utils/auth";
import { setPostLoginRedirect } from "../utils/buyNowFlow";
import "../style.css";

const ConsumerProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [activeSection, setActiveSection] = useState("wallet");
  const [walletBalance, setWalletBalance] = useState(1500); // Mock data
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [supportTickets, setSupportTickets] = useState([
    {
      id: "TKT001",
      subject: "Product Quality Issue",
      status: "Open",
      date: "2025-02-04",
    },
    {
      id: "TKT002",
      subject: "Delivery Delay",
      status: "Resolved",
      date: "2025-02-01",
    },
  ]);

  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "general",
    message: "",
  });

  useEffect(() => {
    const consumerSession = getConsumerSession();
    if (!isConsumerAuthenticated()) {
      navigate("/login/consumer");
    } else {
      setSession(consumerSession);
    }
  }, [navigate]);

  useEffect(() => {
    const requested = location.state?.section;
    if (requested === "orders") {
      setActiveSection("orders");
    }
  }, [location.state]);

  useEffect(() => {
    const identity = getConsumerIdentity();
    const consumerKey = identity?.consumerId || session?.mobile || "";
    if (!consumerKey) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);

    const q = query(
      collection(db, "orders"),
      where("consumerId", "==", consumerKey)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const mapped = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() || {};
          const createdAt = data.createdAt?.toDate?.() || data.createdAt;
          const dateLabel = createdAt
            ? new Date(createdAt).toLocaleString()
            : "N/A";
          const qty = data.quantity || 0;
          const unit = data.unit || "kg";
          const items = `${data.productName || "Product"} (${qty}${unit})`;
          const status = data.status || "Placed";
          const statusColor =
            status === "Delivered"
              ? "success"
              : status === "In Transit"
              ? "processing"
              : "pending";

          return {
            id: data.orderId || docSnap.id,
            date: dateLabel,
            items,
            total: (data.price || 0) * qty,
            status,
            statusColor,
            createdAt: createdAt ? new Date(createdAt).getTime() : 0,
          };
        });
        mapped.sort((a, b) => b.createdAt - a.createdAt);
        setOrders(mapped);
        setOrdersLoading(false);
      },
      () => {
        setOrders([]);
        setOrdersLoading(false);
      }
    );

    return () => unsub();
  }, [session?.mobile]);

  const handleLogout = () => {
    clearAllAuth();
    navigate("/", { replace: true });
  };

  const handleBuyNow = () => {
    if (!isConsumerAuthenticated()) {
      setPostLoginRedirect("/consumer/buy-now");
      navigate("/login/consumer", {
        state: { redirectTo: "/consumer/buy-now" },
      });
      return;
    }
    navigate("/consumer/buy-now");
  };

  const handleAddMoneyToWallet = (amount) => {
    setWalletBalance(walletBalance + amount);
    alert(`â‚¹${amount} added to wallet successfully!`);
  };

  const handleSubmitTicket = () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const ticket = {
      id: `TKT${String(supportTickets.length + 1).padStart(3, "0")}`,
      subject: newTicket.subject,
      status: "Open",
      date: new Date().toISOString().split("T")[0],
    };

    setSupportTickets([ticket, ...supportTickets]);
    setNewTicket({
      subject: "",
      category: "general",
      message: "",
    });
    setShowNewTicket(false);
    alert("Support ticket created successfully!");
  };

  if (!session) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="profile-back-btn" onClick={() => navigate("/consumer")}>
          â† Back to Dashboard
        </button>
        <h1>My Profile</h1>
        <button className="profile-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-quick-actions">
          <button
            className="profile-btn-primary"
            onClick={() => navigate("/consumer/dashboard")}
          >
            Go To Market
          </button>
          <button
            className="profile-btn-primary"
            onClick={() => navigate("/consumer/orders")}
          >
            My Orders
          </button>
        </div>
        {/* Profile Card */}
        <div className="profile-card-main">
          <div className="profile-avatar">
            {session.name ? session.name.charAt(0).toUpperCase() : "C"}
          </div>
          <div className="profile-info">
            <h2>{session.name || "Consumer"}</h2>
            <p>{session.email || "email@example.com"}</p>
            <p>{session.mobile || "+91 XXXX XXXX"}</p>
          </div>
          <button
            className="profile-edit-btn"
            onClick={() => alert("Edit profile feature coming soon!")}
          >
            Edit Profile
          </button>
        </div>

        {/* Section Navigation */}
        <div className="profile-nav-tabs">
          <button
            className={`profile-nav-tab ${activeSection === "wallet" ? "active" : ""}`}
            onClick={() => setActiveSection("wallet")}
          >
            ðŸ’° My Wallet
          </button>
          <button
            className={`profile-nav-tab ${activeSection === "orders" ? "active" : ""}`}
            onClick={() => setActiveSection("orders")}
          >
            ðŸ“¦ Orders
          </button>
          <button
            className={`profile-nav-tab ${activeSection === "support" ? "active" : ""}`}
            onClick={() => setActiveSection("support")}
          >
            ðŸ†˜ Help & Support
          </button>
        </div>

        {/* My Wallet Section */}
        {activeSection === "wallet" && (
          <div className="profile-section wallet-section">
            <h2>ðŸ’° My Wallet</h2>
            <div className="wallet-card">
              <div className="wallet-balance">
                <p>Total Balance</p>
                <h3>â‚¹{walletBalance}</h3>
              </div>
              <div className="wallet-info">
                <p>ðŸ’¡ Use wallet balance for faster checkout</p>
                <p>âœ¨ Earn cashback on every purchase</p>
              </div>
            </div>

            <div className="wallet-actions">
              <h3>Add Money</h3>
              <div className="wallet-add-buttons">
                <button className="add-money-btn" onClick={() => handleAddMoneyToWallet(500)}>
                  + â‚¹500
                </button>
                <button className="add-money-btn" onClick={() => handleAddMoneyToWallet(1000)}>
                  + â‚¹1000
                </button>
                <button className="add-money-btn" onClick={() => handleAddMoneyToWallet(2000)}>
                  + â‚¹2000
                </button>
                <button className="add-money-btn custom" onClick={() => alert("Custom amount dialog")}>
                  Custom Amount
                </button>
              </div>
            </div>

            <div className="wallet-history">
              <h3>Recent Transactions</h3>
              <div className="transaction-list">
                <div className="transaction-item">
                  <div className="transaction-info">
                    <p className="transaction-type">Order Payment</p>
                    <p className="transaction-date">2025-02-07</p>
                  </div>
                  <span className="transaction-amount debit">-â‚¹120</span>
                </div>
                <div className="transaction-item">
                  <div className="transaction-info">
                    <p className="transaction-type">Cashback Received</p>
                    <p className="transaction-date">2025-02-06</p>
                  </div>
                  <span className="transaction-amount credit">+â‚¹20</span>
                </div>
                <div className="transaction-item">
                  <div className="transaction-info">
                    <p className="transaction-type">Wallet Top-up</p>
                    <p className="transaction-date">2025-02-05</p>
                  </div>
                  <span className="transaction-amount credit">+â‚¹1000</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Section */}
        {activeSection === "orders" && (
          <div className="profile-section orders-section">
            <h2>ðŸ“¦ My Orders</h2>

            {ordersLoading ? (
              <div className="empty-state">
                <p>Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <p>No orders yet</p>
                <button 
                  className="profile-btn-primary"
                  onClick={handleBuyNow}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <p className="order-id">Order #{order.id}</p>
                        <p className="order-date">{order.date}</p>
                      </div>
                      <span className={`order-status status-${order.statusColor}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="order-items">
                      <p>{order.items}</p>
                    </div>

                    <div className="order-footer">
                      <p className="order-total">â‚¹{order.total}</p>
                      <div className="order-actions">
                        <button 
                          className="order-btn secondary"
                          onClick={() => alert(`Tracking details for ${order.id}`)}
                        >
                          Track
                        </button>
                        <button 
                          className="order-btn secondary"
                          onClick={handleBuyNow}
                        >
                          Reorder
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Help & Support Section */}
        {activeSection === "support" && (
          <div className="profile-section support-section">
            <h2>ðŸ†˜ Help & Support</h2>

            <div className="support-grid">
              <div className="support-card">
                <div className="support-icon">ðŸ“±</div>
                <h3>Call Us</h3>
                <p>+91 XXXX-XXXX-XX</p>
                <p className="support-time">Available 9 AM - 6 PM</p>
              </div>

              <div className="support-card">
                <div className="support-icon">âœ‰ï¸</div>
                <h3>Email Us</h3>
                <p>support@agriconnect.com</p>
                <p className="support-time">Response within 24 hours</p>
              </div>

              <div className="support-card">
                <div className="support-icon">ðŸ’¬</div>
                <h3>Live Chat</h3>
                <p>Chat with our team</p>
                <p className="support-time">9 AM - 6 PM</p>
              </div>

              <div className="support-card">
                <div className="support-icon">â“</div>
                <h3>FAQ</h3>
                <p>Common questions answered</p>
                <p className="support-time">Available 24/7</p>
              </div>
            </div>

            <div className="support-tickets">
              <div className="support-tickets-header">
                <h3>Support Tickets</h3>
                <button 
                  className="profile-btn-primary"
                  onClick={() => setShowNewTicket(!showNewTicket)}
                >
                  {showNewTicket ? "Cancel" : "+ New Ticket"}
                </button>
              </div>

              {showNewTicket && (
                <div className="new-ticket-form">
                  <div className="form-group">
                    <label>Subject *</label>
                    <input
                      type="text"
                      value={newTicket.subject}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, subject: e.target.value })
                      }
                      placeholder="Enter ticket subject"
                    />
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={newTicket.category}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, category: e.target.value })
                      }
                    >
                      <option value="general">General Inquiry</option>
                      <option value="delivery">Delivery Issue</option>
                      <option value="quality">Product Quality</option>
                      <option value="payment">Payment Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Message *</label>
                    <textarea
                      value={newTicket.message}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, message: e.target.value })
                      }
                      placeholder="Describe your issue"
                      rows="4"
                    />
                  </div>

                  <button 
                    className="profile-btn-primary"
                    onClick={handleSubmitTicket}
                  >
                    Submit Ticket
                  </button>
                </div>
              )}

              <div className="tickets-list">
                {supportTickets.length === 0 ? (
                  <p className="empty-tickets">No support tickets</p>
                ) : (
                  supportTickets.map((ticket) => (
                    <div key={ticket.id} className="ticket-item">
                      <div className="ticket-info">
                        <p className="ticket-id">{ticket.id}</p>
                        <p className="ticket-subject">{ticket.subject}</p>
                        <p className="ticket-date">{ticket.date}</p>
                      </div>
                      <span className={`ticket-status ${ticket.status.toLowerCase()}`}>
                        {ticket.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="faq-section">
              <h3>Frequently Asked Questions</h3>
              <div className="faq-items">
                <details className="faq-item">
                  <summary>How do I place an order?</summary>
                  <p>
                    You can browse products in the Buy Now section, add items to your cart,
                    and proceed to checkout with your delivery address.
                  </p>
                </details>

                <details className="faq-item">
                  <summary>What is the delivery time?</summary>
                  <p>
                    Delivery typically takes 1-3 days depending on your location and the
                    farmer's availability. You can track your order in real-time.
                  </p>
                </details>

                <details className="faq-item">
                  <summary>Can I cancel my order?</summary>
                  <p>
                    Orders can be cancelled within 2 hours of placement. After that, the
                    order will be prepared for shipment.
                  </p>
                </details>

                <details className="faq-item">
                  <summary>How does the wallet work?</summary>
                  <p>
                    Add money to your wallet for faster checkout. You'll also receive
                    cashback on purchases which is credited to your wallet.
                  </p>
                </details>

                <details className="faq-item">
                  <summary>What if I receive damaged products?</summary>
                  <p>
                    Contact our support team within 24 hours with photos. We'll arrange
                    a replacement or refund immediately.
                  </p>
                </details>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerProfile;


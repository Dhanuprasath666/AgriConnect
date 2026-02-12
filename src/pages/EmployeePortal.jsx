import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFarmerRegistrations,
  markFarmerVerified,
} from "../lib/farmerVerification";
import "../style.css";

const EMPLOYEE_USER = "employee";
const EMPLOYEE_PASS = "agri@verify";
const EMPLOYEE_SESSION_KEY = "ac_employee_portal_session";

function hasEmployeeSession() {
  if (typeof window === "undefined" || !window.sessionStorage) return false;
  return window.sessionStorage.getItem(EMPLOYEE_SESSION_KEY) === "1";
}

function setEmployeeSession(active) {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  if (active) {
    window.sessionStorage.setItem(EMPLOYEE_SESSION_KEY, "1");
    return;
  }
  window.sessionStorage.removeItem(EMPLOYEE_SESSION_KEY);
}

const EmployeePortal = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(hasEmployeeSession);
  const [, setRefreshKey] = useState(0);

  const registrations = getFarmerRegistrations();
  const pendingCount = registrations.filter((item) => !item.isVerified).length;

  const handleLogin = () => {
    if (username.trim() === EMPLOYEE_USER && password === EMPLOYEE_PASS) {
      setEmployeeSession(true);
      setIsAuthenticated(true);
      setError("");
      return;
    }
    setError("Invalid employee credentials.");
  };

  const handleVerify = (farmerId) => {
    markFarmerVerified(farmerId, "AgriConnect Employee");
    setRefreshKey((v) => v + 1);
  };

  const logout = () => {
    setEmployeeSession(false);
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="ep-page">
        <div className="ep-card ep-login-card">
          <h1>AgriConnect Employee Portal</h1>
          <p>Employee access required for farmer verification.</p>
          <input
            className="ep-input"
            placeholder="Employee username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="ep-input"
            type="password"
            placeholder="Access key"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
          />
          {error && <p className="ep-error">{error}</p>}
          <button className="ep-btn ep-btn-primary" onClick={handleLogin}>
            Login
          </button>
          <button className="ep-btn ep-btn-ghost" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ep-page">
      <div className="ep-card">
        <div className="ep-head">
          <div>
            <h1>AgriConnect Employee Portal</h1>
            <p>
              New farmer registrations: <strong>{pendingCount}</strong> pending
            </p>
          </div>
          <div className="ep-head-actions">
            <button className="ep-btn ep-btn-ghost" onClick={() => setRefreshKey((v) => v + 1)}>
              Refresh
            </button>
            <button className="ep-btn ep-btn-ghost" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        {registrations.length === 0 ? (
          <p className="ep-empty">No farmer registrations found yet.</p>
        ) : (
          <div className="ep-table-wrap">
            <table className="ep-table">
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Registered</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((item) => (
                  <tr key={item.farmerId}>
                    <td>{item.name}</td>
                    <td>{item.phone || "--"}</td>
                    <td>
                      {[item.village, item.district, item.state]
                        .filter(Boolean)
                        .join(", ") || "--"}
                    </td>
                    <td>
                      {item.registeredAt
                        ? new Date(item.registeredAt).toLocaleString()
                        : "--"}
                    </td>
                    <td>
                      {item.isVerified ? (
                        <span className="ep-badge ep-badge-verified">Verified</span>
                      ) : (
                        <span className="ep-badge ep-badge-pending">Pending</span>
                      )}
                    </td>
                    <td>
                      {item.isVerified ? (
                        <span className="ep-muted">Done</span>
                      ) : (
                        <button
                          className="ep-btn ep-btn-primary ep-btn-sm"
                          onClick={() => handleVerify(item.farmerId)}
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePortal;

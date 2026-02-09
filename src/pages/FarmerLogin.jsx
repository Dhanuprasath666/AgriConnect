import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import "../style.css";
import { setCurrentFarmerId, setCurrentFarmerName } from "../lib/currentFarmer";

const FarmerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);

  const dynamicMessages = [
    "Check pending orders in one place",
    "Update produce pricing in seconds",
    "Publish new inventory without delays",
    "Track urgent sales with full clarity",
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveMessageIndex((previousIndex) =>
        (previousIndex + 1) % dynamicMessages.length
      );
    }, 2600);

    return () => clearInterval(intervalId);
  }, [dynamicMessages.length]);

  const isAllowedEntry = location.state?.farmerLoginAccess === "top-nav";

  if (!isAllowedEntry) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    if (!mobile.trim() || !password.trim()) {
      setError("Please enter both mobile number and password.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: mobile.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.role === "farmer") {
        const farmerId = mobile.replace(/\\D/g, "") || "demo-farmer";
        setCurrentFarmerId(farmerId);
        setCurrentFarmerName(data?.name || "Farmer");
        navigate("/farmer/dashboard");
        return;
      }

      setError("Invalid mobile number or password.");
    } catch (networkError) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterSubmit = (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="fl-page">
      <div className="fl-backdrop-grid" aria-hidden="true"></div>

      <header className="fl-topbar">
        <button className="fl-brand" onClick={() => navigate("/")}>
          <span className="ac-brand-text">AC</span>
        </button>
        <button className="fl-back-btn" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </header>

      <main className="fl-main">
        <section className="fl-story">
          <p className="fl-kicker">Farmer Command Center</p>
          <h1>Simple, focused sign-in for your daily farm operations.</h1>
          <p className="fl-intro-text">
            Access your dashboard to manage stock, orders, and farmer workflow
            with speed and confidence.
          </p>

          <div className="fl-dynamic-card">
            <p className="fl-dynamic-label">Now in focus</p>
            <h3 className="fl-dynamic-message" key={activeMessageIndex}>
              {dynamicMessages[activeMessageIndex]}
            </h3>
            <div className="fl-dynamic-dots" aria-hidden="true">
              {dynamicMessages.map((_, index) => (
                <span
                  key={index}
                  className={`fl-dynamic-dot ${
                    index === activeMessageIndex ? "is-active" : ""
                  }`}
                ></span>
              ))}
            </div>
          </div>
        </section>

        <section className="fl-auth-shell">
          <div className="fl-auth-head">
            <p className="fl-auth-kicker">Secure Access</p>
            <h2>Farmer Log In</h2>
            <p className="fl-form-subtitle">
              Enter your registered credentials to continue.
            </p>
          </div>

          <div className="fl-auth-card">
            <label className="fl-label" htmlFor="mobile">
              Mobile Number
            </label>
            <input
              id="mobile"
              type="text"
              placeholder="Enter mobile number"
              className="fl-input"
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              onKeyDown={handleEnterSubmit}
              autoComplete="tel"
            />

            <label className="fl-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              className="fl-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={handleEnterSubmit}
              autoComplete="current-password"
            />

            {error && <p className="fl-error">{error}</p>}

            <button
              className="fl-submit-btn"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>

            <p className="fl-help-text">
              Need access help? Contact your{" "}
              <span className="ac-brand-text ac-brand-text--inline">AC</span>{" "}
              administrator.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FarmerLogin;

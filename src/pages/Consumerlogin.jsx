import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../style.css";
import { persistConsumerSession } from "../utils/consumerSession";
import { clearCurrentFarmerSession } from "../lib/currentFarmer";
import { isConsumerAuthenticated } from "../utils/auth";
import {
  clearPostLoginRedirect,
  clearStoredBuyNowItem,
  getPostLoginRedirect,
  getStoredBuyNowItem,
} from "../utils/buyNowFlow";

const ConsumerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeSignalIndex, setActiveSignalIndex] = useState(0);

  const liveSignals = [
    "Fresh listings updated by nearby farms every morning",
    "Urgent discounts visible in one clean buyer view",
    "Track orders and delivery windows with clarity",
    "Reorder your frequent products in seconds",
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSignalIndex((previousIndex) =>
        (previousIndex + 1) % liveSignals.length
      );
    }, 2600);

    return () => clearInterval(intervalId);
  }, [liveSignals.length]);

  useEffect(() => {
    const prefillMobile = location.state?.prefillMobile;
    const prefillPassword = location.state?.prefillPassword;

    if (typeof prefillMobile === "string" && prefillMobile.trim()) {
      setMobile(prefillMobile.trim());
    }

    if (typeof prefillPassword === "string" && prefillPassword.trim()) {
      setPassword(prefillPassword);
    }
  }, [location.state]);

  useEffect(() => {
    if (isConsumerAuthenticated()) {
      navigate("/consumer/profile", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    const mobileDigits = mobile.trim().replace(/\D/g, "");

    if (!mobileDigits || !password.trim()) {
      setError("Please enter both mobile number and password.");
      return;
    }

    if (mobileDigits.length !== 10) {
      setError("Phone number must be 10 digits.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: mobileDigits,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : "Invalid mobile number or password.";
        setError(detail);
        return;
      }

      if (data.role !== "consumer") {
        setError("This account is not registered as a consumer.");
        return;
      }

      // Ensure consumer login does not keep any farmer session.
      clearCurrentFarmerSession();
      persistConsumerSession({
        name: typeof data.name === "string" ? data.name : "",
        mobile: mobileDigits,
        consumerId: mobileDigits,
      });

      const redirectTo =
        (typeof location.state?.redirectTo === "string" &&
          location.state.redirectTo.trim()) ||
        getPostLoginRedirect();
      const buyNowItem = location.state?.buyNowItem || getStoredBuyNowItem();

      if (redirectTo) {
        clearPostLoginRedirect();
        clearStoredBuyNowItem();
        navigate(redirectTo, {
          replace: true,
          state: buyNowItem ? { item: buyNowItem } : undefined,
        });
        return;
      }

      navigate("/consumer/profile");
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
    <div className="cl-page">
      <div className="cl-bg-grid" aria-hidden="true"></div>

      <header className="cl-topbar">
        <button className="cl-brand" onClick={() => navigate("/")}>
          <span className="ac-brand-text">AC</span>
        </button>
        <div className="cl-top-actions">
          <button
            className="cl-link-btn"
            onClick={() => navigate("/consumer/register")}
          >
            Create account
          </button>
          <button
            className="cl-back-btn"
            onClick={() => navigate("/consumer/market")}
          >
            Back to marketplace
          </button>
        </div>
      </header>

      <main className="cl-main">
        <section className="cl-story">
          <p className="cl-kicker">Consumer Access</p>
          <h1>Sign in to buy smarter from trusted local farms.</h1>
          <p className="cl-intro-text">
            Continue to compare fresh stock, check urgent offers, and manage
            purchases with a clean, buyer-first dashboard.
          </p>

          <ul className="cl-feature-list">
            <li>Verified farm listings and transparent pricing</li>
            <li>Fast checkout decisions with clear availability</li>
            <li>Single place to track recent and active orders</li>
          </ul>

          <article className="cl-live-card">
            <p className="cl-live-label">Live consumer pulse</p>
            <h3 className="cl-live-message" key={activeSignalIndex}>
              {liveSignals[activeSignalIndex]}
            </h3>
            <div className="cl-live-dots" aria-hidden="true">
              {liveSignals.map((_, index) => (
                <span
                  key={index}
                  className={`cl-live-dot ${
                    index === activeSignalIndex ? "is-active" : ""
                  }`}
                ></span>
              ))}
            </div>
          </article>
        </section>

        <section className="cl-auth-shell">
          <div className="cl-auth-head">
            <p className="cl-auth-kicker">Secure Sign In</p>
            <h2>Consumer Login</h2>
            <p className="cl-form-subtitle">
              Enter your registered mobile number and password to continue.
            </p>
          </div>

          <div className="cl-auth-card">
            <label className="cl-label" htmlFor="consumerLoginMobile">
              Mobile Number
            </label>
            <input
              id="consumerLoginMobile"
              type="text"
              className="cl-input"
              placeholder="Enter 10-digit phone number"
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              onKeyDown={handleEnterSubmit}
              autoComplete="tel"
            />

            <label className="cl-label" htmlFor="consumerLoginPassword">
              Password
            </label>
            <input
              id="consumerLoginPassword"
              type="password"
              className="cl-input"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={handleEnterSubmit}
              autoComplete="current-password"
            />

            {error && <p className="cl-error">{error}</p>}

            <div className="cl-meta-row">
              <p className="cl-support-text">
                Need help? Contact{" "}
                <span className="ac-brand-text ac-brand-text--inline">AC</span>{" "}
                support.
              </p>
              <button className="cl-forgot-btn" onClick={() => navigate("/consumer/register")}>
                New user? Register
              </button>
            </div>

            <button
              className="cl-submit-btn"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>

            <p className="cl-foot-note">
              Your session is used only to access consumer purchase features.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ConsumerLogin;

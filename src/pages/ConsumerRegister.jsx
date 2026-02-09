import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";
import { persistConsumerSession } from "../utils/consumerSession";

const ConsumerRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    alternatePhone: "",
    email: "",
    village: "",
    district: "",
    stateName: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    const trimmedName = form.name.trim();
    const mobileDigits = form.mobile.trim().replace(/\D/g, "");
    const alternateDigits = form.alternatePhone.trim().replace(/\D/g, "");
    const emailValue = form.email.trim();
    const villageValue = form.village.trim();
    const districtValue = form.district.trim();
    const stateValue = form.stateName.trim();

    if (
      !trimmedName ||
      !mobileDigits ||
      !alternateDigits ||
      !emailValue ||
      !villageValue ||
      !districtValue ||
      !stateValue ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (mobileDigits.length !== 10) {
      setError("Phone number must be 10 digits.");
      return;
    }

    if (alternateDigits.length !== 10) {
      setError("Alternate phone number must be 10 digits.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          mobile: mobileDigits,
          password: form.password,
          role: "consumer",
          alternate_phone: alternateDigits,
          village: villageValue,
          district: districtValue,
          state: stateValue,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : "Unable to complete registration.";
        setError(detail);
        return;
      }

      setSuccess("Consumer registration completed successfully. Signing you in...");

      const loginResponse = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: mobileDigits,
          password: form.password,
        }),
      });

      const loginData = await loginResponse.json().catch(() => ({}));
      if (loginResponse.ok && loginData.role === "consumer") {
        persistConsumerSession({
          name: trimmedName,
          mobile: mobileDigits,
        });
        navigate("/consumer/market");
        return;
      }

      navigate("/consumer/login", {
        state: {
          prefillMobile: mobileDigits,
          prefillPassword: form.password,
        },
      });
    } catch (requestError) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rg-page">
      <header className="rg-topbar">
        <button className="rg-brand" onClick={() => navigate("/")}>
          AgriConnect
        </button>
        <button className="rg-top-btn" onClick={() => navigate("/register")}>
          Back
        </button>
      </header>

      <main className="rg-main">
        <section className="rg-card">
          <p className="rg-kicker">Consumer Registration</p>
          <h1>Create your consumer account</h1>
          <p className="rg-subtext">
            Fill your consumer details once to register and continue.
          </p>

          <div className="rg-step-strip">
            <span className="rg-step-pill">Step 2 of 2</span>
            <p>Complete your buyer profile to start purchasing produce.</p>
          </div>

          <div className="rg-form-grid">
            <label className="rg-label" htmlFor="consumerName">
              Name
            </label>
            <input
              id="consumerName"
              className="rg-input"
              type="text"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Enter full name"
            />

            <div className="rg-grid-two">
              <div>
                <label className="rg-label" htmlFor="consumerMobile">
                  Phone Number
                </label>
                <input
                  id="consumerMobile"
                  className="rg-input"
                  type="text"
                  value={form.mobile}
                  onChange={(event) => updateField("mobile", event.target.value)}
                  placeholder="Enter 10-digit phone number"
                />
              </div>
              <div>
                <label className="rg-label" htmlFor="consumerAltPhone">
                  Alternate Phone Number
                </label>
                <input
                  id="consumerAltPhone"
                  className="rg-input"
                  type="text"
                  value={form.alternatePhone}
                  onChange={(event) =>
                    updateField("alternatePhone", event.target.value)
                  }
                  placeholder="Enter alternate number"
                />
              </div>
            </div>

            <div className="rg-grid-two">
              <div>
                <label className="rg-label" htmlFor="consumerEmail">
                  Email
                </label>
                <input
                  id="consumerEmail"
                  className="rg-input"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="rg-label" htmlFor="consumerState">
                  State
                </label>
                <input
                  id="consumerState"
                  className="rg-input"
                  type="text"
                  value={form.stateName}
                  onChange={(event) => updateField("stateName", event.target.value)}
                  placeholder="Enter state"
                />
              </div>
            </div>

            <div className="rg-grid-two">
              <div>
                <label className="rg-label" htmlFor="consumerVillage">
                  Village
                </label>
                <input
                  id="consumerVillage"
                  className="rg-input"
                  type="text"
                  value={form.village}
                  onChange={(event) => updateField("village", event.target.value)}
                  placeholder="Enter village"
                />
              </div>
              <div>
                <label className="rg-label" htmlFor="consumerDistrict">
                  District
                </label>
                <input
                  id="consumerDistrict"
                  className="rg-input"
                  type="text"
                  value={form.district}
                  onChange={(event) => updateField("district", event.target.value)}
                  placeholder="Enter district"
                />
              </div>
            </div>

            <div className="rg-grid-two">
              <div>
                <label className="rg-label" htmlFor="consumerPassword">
                  Password
                </label>
                <input
                  id="consumerPassword"
                  className="rg-input"
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Create password"
                />
              </div>
              <div>
                <label className="rg-label" htmlFor="consumerConfirmPassword">
                  Confirm Password
                </label>
                <input
                  id="consumerConfirmPassword"
                  className="rg-input"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    updateField("confirmPassword", event.target.value)
                  }
                  placeholder="Re-enter password"
                />
              </div>
            </div>
          </div>

          {error && <p className="rg-error">{error}</p>}
          {success && <p className="rg-success">{success}</p>}

          <div className="rg-actions">
            <button
              className="rg-secondary-btn"
              onClick={() => navigate("/register")}
            >
              Back
            </button>
            <button
              className="rg-primary-btn"
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ConsumerRegister;

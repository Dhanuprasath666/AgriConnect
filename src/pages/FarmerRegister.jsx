import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";

const FarmerRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    age: "",
    phone: "",
    alternatePhone: "",
    aadharNumber: "",
    password: "",
    confirmPassword: "",
    village: "",
    district: "",
    state: "",
    pincode: "",
    soilType: "",
    landArea: "",
    primaryCrops: "",
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

  const validateFarmerForm = () => {
    for (const [field, value] of Object.entries(form)) {
      if (!value.toString().trim()) {
        return `Please fill ${field.replace(/([A-Z])/g, " $1").toLowerCase()}.`;
      }
    }

    const phoneDigits = form.phone.replace(/\D/g, "");
    const altPhoneDigits = form.alternatePhone.replace(/\D/g, "");
    const aadharDigits = form.aadharNumber.replace(/\D/g, "");
    const pincodeDigits = form.pincode.replace(/\D/g, "");

    if (phoneDigits.length !== 10) {
      return "Phone number must be 10 digits.";
    }

    if (altPhoneDigits.length !== 10) {
      return "Alternate phone number must be 10 digits.";
    }

    if (aadharDigits.length !== 12) {
      return "Aadhar number must be 12 digits.";
    }

    if (pincodeDigits.length !== 6) {
      return "Pincode must be 6 digits.";
    }

    const age = Number(form.age);
    if (Number.isNaN(age) || age < 18 || age > 120) {
      return "Please enter a valid age between 18 and 120.";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (form.password !== form.confirmPassword) {
      return "Password and confirm password do not match.";
    }

    return "";
  };

  const handleRegister = async () => {
    const validationError = validateFarmerForm();
    if (validationError) {
      setError(validationError);
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
          role: "farmer",
          name: form.name.trim(),
          age: Number(form.age),
          mobile: form.phone.replace(/\D/g, ""),
          alternate_phone: form.alternatePhone.replace(/\D/g, ""),
          aadhar_number: form.aadharNumber.replace(/\D/g, ""),
          password: form.password,
          village: form.village.trim(),
          district: form.district.trim(),
          state: form.state.trim(),
          pincode: form.pincode.replace(/\D/g, ""),
          soil_type: form.soilType.trim(),
          land_area: form.landArea.trim(),
          primary_crops: form.primaryCrops.trim(),
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

      setSuccess("Farmer registration completed successfully.");
      setTimeout(() => {
        navigate("/farmer/login", {
          state: { farmerLoginAccess: "top-nav" },
        });
      }, 700);
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
        <section className="rg-card rg-card-wide">
          <p className="rg-kicker">Farmer Registration</p>
          <h1>Create your farmer account</h1>
          <p className="rg-subtext">
            Fill all required details to complete registration.
          </p>

          <div className="rg-step-strip">
            <span className="rg-step-pill">Step 2 of 2</span>
            <p>Complete your farmer profile and farm details.</p>
          </div>

          <div className="rg-form-grid">
            <label className="rg-label" htmlFor="farmerName">
              Name
            </label>
            <input
              id="farmerName"
              className="rg-input"
              type="text"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Enter full name"
            />

            <label className="rg-label" htmlFor="farmerAge">
              Age
            </label>
            <input
              id="farmerAge"
              className="rg-input"
              type="number"
              min="18"
              value={form.age}
              onChange={(event) => updateField("age", event.target.value)}
              placeholder="Enter age"
            />

            <div className="rg-grid-two">
              <div>
                <label className="rg-label" htmlFor="farmerPhone">
                  Phone Number
                </label>
                <input
                  id="farmerPhone"
                  className="rg-input"
                  type="text"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="10-digit phone number"
                />
              </div>
              <div>
                <label className="rg-label" htmlFor="farmerAltPhone">
                  Alternate Phone Number
                </label>
                <input
                  id="farmerAltPhone"
                  className="rg-input"
                  type="text"
                  value={form.alternatePhone}
                  onChange={(event) =>
                    updateField("alternatePhone", event.target.value)
                  }
                  placeholder="10-digit alternate number"
                />
              </div>
            </div>

            <label className="rg-label" htmlFor="farmerAadhar">
              Aadhar Number
            </label>
            <input
              id="farmerAadhar"
              className="rg-input"
              type="text"
              value={form.aadharNumber}
              onChange={(event) =>
                updateField("aadharNumber", event.target.value)
              }
              placeholder="12-digit aadhar number"
            />

            <div className="rg-grid-two">
              <div>
                <label className="rg-label" htmlFor="farmerPassword">
                  Password
                </label>
                <input
                  id="farmerPassword"
                  className="rg-input"
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Create password"
                />
              </div>
              <div>
                <label className="rg-label" htmlFor="farmerConfirmPassword">
                  Confirm Password
                </label>
                <input
                  id="farmerConfirmPassword"
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

            <p className="rg-inline-head">Location</p>
            <div className="rg-grid-two">
              <div>
                <label className="rg-label" htmlFor="farmerVillage">
                  Village
                </label>
                <input
                  id="farmerVillage"
                  className="rg-input"
                  type="text"
                  value={form.village}
                  onChange={(event) => updateField("village", event.target.value)}
                  placeholder="Enter village"
                />
              </div>
              <div>
                <label className="rg-label" htmlFor="farmerDistrict">
                  District
                </label>
                <input
                  id="farmerDistrict"
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
                <label className="rg-label" htmlFor="farmerState">
                  State
                </label>
                <input
                  id="farmerState"
                  className="rg-input"
                  type="text"
                  value={form.state}
                  onChange={(event) => updateField("state", event.target.value)}
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label className="rg-label" htmlFor="farmerPincode">
                  Pincode
                </label>
                <input
                  id="farmerPincode"
                  className="rg-input"
                  type="text"
                  value={form.pincode}
                  onChange={(event) => updateField("pincode", event.target.value)}
                  placeholder="Enter pincode"
                />
              </div>
            </div>

            <div className="rg-grid-two">
              <div>
                <label className="rg-label" htmlFor="farmerSoilType">
                  Type of Soil
                </label>
                <input
                  id="farmerSoilType"
                  className="rg-input"
                  type="text"
                  value={form.soilType}
                  onChange={(event) => updateField("soilType", event.target.value)}
                  placeholder="Example: Loamy"
                />
              </div>
              <div>
                <label className="rg-label" htmlFor="farmerLandArea">
                  Land Area
                </label>
                <input
                  id="farmerLandArea"
                  className="rg-input"
                  type="text"
                  value={form.landArea}
                  onChange={(event) => updateField("landArea", event.target.value)}
                  placeholder="Example: 3.5 acres"
                />
              </div>
            </div>

            <label className="rg-label" htmlFor="farmerPrimaryCrops">
              Primary Crops
            </label>
            <input
              id="farmerPrimaryCrops"
              className="rg-input"
              type="text"
              value={form.primaryCrops}
              onChange={(event) =>
                updateField("primaryCrops", event.target.value)
              }
              placeholder="Example: Paddy, Tomato, Groundnut"
            />
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

export default FarmerRegister;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";

const FarmerLogin = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mobile: mobile,
        password: password
      })
    });

    const data = await res.json();

    if (res.ok && data.role === "farmer") {
      navigate("/farmer/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>👨‍🌾 Farmer Login Portal</h2>

        <input
          type="text"
          placeholder="Enter Mobile Number"
          className="auth-input"
          onChange={(e) => setMobile(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          className="auth-input"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-button" onClick={handleLogin}>
          Continue
        </button>

      </div>
    </div>
  );
};

export default FarmerLogin;

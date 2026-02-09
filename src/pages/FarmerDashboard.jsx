
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import "../style.css";
import farmBg from "../assets/farm-bg.jpg";
import { db } from "../firebase";
import {
  clearCurrentFarmerSession,
  getCurrentFarmerAccessToken,
  getCurrentFarmerId,
  getCurrentFarmerName,
} from "../lib/currentFarmer";
import { fetchOpenMeteoWeather } from "../lib/weather";
import { generateRuleBasedAlerts } from "../lib/alerts";
import { simulateEarningsFromListings } from "../lib/earnings";
import { reverseGeocodeLatLng } from "../lib/location";

function formatCurrencyINR(value) {
  const number = Number(value ?? 0);
  const safe = Number.isFinite(number) ? number : 0;
  return `\u20B9${safe.toLocaleString("en-IN")}`;
}

function formatTimeLeft(expiry) {
  if (!expiry) return null;
  const expiryDate = expiry?.toDate?.() || new Date(expiry);
  const ms = expiryDate.getTime() - Date.now();
  if (!Number.isFinite(ms)) return null;
  if (ms <= 0) return "Expired";
  const totalMin = Math.floor(ms / (1000 * 60));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}m left`;
  return `${h}h ${m}m left`;
}

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const farmerId = useMemo(() => getCurrentFarmerId(), []);
  const farmerName = useMemo(() => getCurrentFarmerName(), []);
  const accessToken = useMemo(() => getCurrentFarmerAccessToken(), []);

  const [profile, setProfile] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");
  const [backendWeatherFailed, setBackendWeatherFailed] = useState(false);
  const [resolvedLocation, setResolvedLocation] = useState(null);
  const [resolvedLocationLoading, setResolvedLocationLoading] = useState(false);
  const [backendLocationLabel, setBackendLocationLabel] = useState("");
  const [backendLatLng, setBackendLatLng] = useState(null);

  const hasManualCoords =
    typeof profile?.location?.lat === "number" &&
    Number.isFinite(profile.location.lat) &&
    typeof profile?.location?.lng === "number" &&
    Number.isFinite(profile.location.lng);

  const [soilMoistureInput, setSoilMoistureInput] = useState("");
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [editRow, setEditRow] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [editQty, setEditQty] = useState("");

  const [isCropEditing, setIsCropEditing] = useState(false);
  const [cropForm, setCropForm] = useState({
    name: "",
    sowingDate: "",
    expectedHarvestDays: "",
  });
  const [cropError, setCropError] = useState("");
  const [locationForm, setLocationForm] = useState({
    locationText: "",
    lat: "",
    lng: "",
  });
  const [locationError, setLocationError] = useState("");
  const [locationSaving, setLocationSaving] = useState(false);

  const hardcodedRevenue = useMemo(
    () => ({
      total: 48000,
      monthly: 6500,
      today: 1200,
      expected: 12000,
    }),
    []
  );

  useEffect(() => {
    const ref = doc(db, "farmers", farmerId);

    const unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        const now = new Date();
        const sowing = new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000);

        await setDoc(ref, {
          farmerId,
          name: farmerName,
          locationText: "Village, District",
          location: null,
          crop: {
            name: "Tomato",
            sowingDate: sowing.toISOString(),
            expectedHarvestDays: 60,
          },
          soilMoisturePercent: 41,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return;
      }

      const data = { id: snap.id, ...snap.data() };
      setProfile(data);

      const moisture =
        typeof data?.soilMoisturePercent === "number"
          ? String(data.soilMoisturePercent)
          : "";
      setSoilMoistureInput(moisture);

      setLocationForm({
        locationText: data?.locationText || "",
        lat:
          typeof data?.location?.lat === "number"
            ? String(data.location.lat)
            : "",
        lng:
          typeof data?.location?.lng === "number"
            ? String(data.location.lng)
            : "",
      });
    });

    return () => unsub();
  }, [farmerId, farmerName]);

  useEffect(() => {
    const q = query(
      collection(db, "marketItems"),
      where("farmerId", "==", farmerId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(data);
    });

    return () => unsub();
  }, [farmerId]);

  useEffect(() => {
    const q = query(
      collection(db, "alerts"),
      where("farmerId", "==", farmerId),
      where("dismissed", "==", false),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAlerts(data);
    });

    return () => unsub();
  }, [farmerId]);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;

    async function run() {
      try {
        setWeatherError("");
        setBackendWeatherFailed(false);

        const res = await fetch("http://127.0.0.1:8000/weather/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const detail =
            typeof data?.detail === "string"
              ? data.detail
              : `Unable to load weather (${res.status}).`;
          throw new Error(detail);
        }

        if (cancelled) return;

        setWeather(data?.weather || null);
        setBackendLocationLabel(
          typeof data?.location?.label === "string" ? data.location.label : ""
        );
        if (
          typeof data?.location?.lat === "number" &&
          typeof data?.location?.lng === "number"
        ) {
          setBackendLatLng({ lat: data.location.lat, lng: data.location.lng });
        }
      } catch (e) {
        if (!cancelled) {
          setBackendWeatherFailed(true);
          setWeatherError(e?.message || "Unable to load weather.");
        }
      }
    }

    run();
    const intervalId = setInterval(run, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [accessToken]);

  useEffect(() => {
    const shouldUseManualWeather =
      hasManualCoords && (!accessToken || backendWeatherFailed);
    if (!shouldUseManualWeather) return;
    let cancelled = false;

    async function run() {
      try {
        setWeatherError("");
        const data = await fetchOpenMeteoWeather({
          lat: profile.location.lat,
          lng: profile.location.lng,
        });
        if (!cancelled) setWeather(data);
      } catch (e) {
        if (!cancelled) setWeatherError(e?.message || "Unable to load weather.");
      }
    }

    run();
    const intervalId = setInterval(run, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [
    accessToken,
    backendWeatherFailed,
    hasManualCoords,
    profile?.location?.lat,
    profile?.location?.lng,
  ]);

  useEffect(() => {
    const shouldUseManualLocation =
      hasManualCoords && (!accessToken || backendWeatherFailed);
    if (!shouldUseManualLocation) return;
    const controller = new AbortController();
    let mounted = true;

    async function run() {
      setResolvedLocationLoading(true);
      const data = await reverseGeocodeLatLng({
        lat: profile.location.lat,
        lng: profile.location.lng,
        signal: controller.signal,
      });
      if (!mounted) return;
      setResolvedLocation(data);
      setResolvedLocationLoading(false);
    }

    run().catch(() => {
      if (!mounted) return;
      setResolvedLocation({ city: "", country: "India", label: "India" });
      setResolvedLocationLoading(false);
    });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [
    accessToken,
    backendWeatherFailed,
    hasManualCoords,
    profile?.location?.lat,
    profile?.location?.lng,
  ]);

  useEffect(() => {
    const computed = simulateEarningsFromListings({
      items: products,
      now: new Date(),
    });
    setDoc(
      doc(db, "earnings", farmerId),
      {
        farmerId,
        ...computed,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }, [farmerId, products]);

  useEffect(() => {
    if (!weather || !profile) return;

    const soil =
      soilMoistureInput === ""
        ? profile?.soilMoisturePercent
        : Number(soilMoistureInput);
    const derived = generateRuleBasedAlerts({
      weather,
      crop: profile?.crop,
      soilMoisturePercent: Number.isFinite(soil) ? soil : null,
      now: new Date(),
    });

    derived.forEach(async (a) => {
      const alertId = `${farmerId}_${a.ruleId}`;
      await setDoc(
        doc(db, "alerts", alertId),
        {
          farmerId,
          ruleId: a.ruleId,
          severity: a.severity,
          message: a.message,
          dismissed: false,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    });
  }, [farmerId, profile, soilMoistureInput, weather]);

  useEffect(() => {
    if (!profile?.crop || isCropEditing) return;
    const crop = profile.crop || {};
    const sowing = crop.sowingDate
      ? new Date(crop.sowingDate).toISOString().slice(0, 10)
      : "";
    setCropForm({
      name: crop.name || "",
      sowingDate: sowing,
      expectedHarvestDays: String(crop.expectedHarvestDays ?? ""),
    });
  }, [profile?.crop, isCropEditing]);

  const dismissAlert = async (alertId) => {
    await updateDoc(doc(db, "alerts", alertId), {
      dismissed: true,
      dismissedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const saveSoilMoisture = async () => {
    const n = Number(soilMoistureInput);
    if (!Number.isFinite(n) || n < 0 || n > 100) return;
    await updateDoc(doc(db, "farmers", farmerId), {
      soilMoisturePercent: n,
      updatedAt: serverTimestamp(),
    });
  };

  const startEdit = (p) => {
    setEditRow(p.id);
    setEditPrice(String(p.pricePerKg ?? ""));
    setEditQty(String(p.quantityKg ?? ""));
  };

  const cancelEdit = () => {
    setEditRow(null);
    setEditPrice("");
    setEditQty("");
  };

  const saveEdit = async (productId) => {
    const price = Number(editPrice);
    const qty = Number(editQty);
    if (!Number.isFinite(price) || !Number.isFinite(qty) || price <= 0 || qty < 0)
      return;

    await updateDoc(doc(db, "marketItems", productId), {
      pricePerKg: price,
      quantityKg: qty,
      updatedAt: serverTimestamp(),
    });
    cancelEdit();
  };

  const removeProduct = async (productId) => {
    await deleteDoc(doc(db, "marketItems", productId));
    await setDoc(
      doc(db, "urgentDeals", productId),
      { active: false, updatedAt: serverTimestamp() },
      { merge: true }
    );
  };

  const setUrgentDeal = async (product, next) => {
    const updates = {
      isUrgentDeal: Boolean(next),
      updatedAt: serverTimestamp(),
    };

    if (!next) {
      updates.discountPercent = null;
      updates.dealExpiryTime = null;
    } else {
      updates.discountPercent =
        typeof product.discountPercent === "number" ? product.discountPercent : 10;
      updates.dealExpiryTime =
        product.dealExpiryTime || new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    await updateDoc(doc(db, "marketItems", product.id), updates);

    await setDoc(
      doc(db, "urgentDeals", product.id),
      {
        marketItemId: product.id,
        farmerId,
        active: Boolean(next),
        discountPercent: updates.discountPercent ?? null,
        dealExpiryTime: updates.dealExpiryTime ?? null,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const updateUrgentMeta = async (productId, fields) => {
    await updateDoc(doc(db, "marketItems", productId), {
      ...fields,
      updatedAt: serverTimestamp(),
    });
    await setDoc(
      doc(db, "urgentDeals", productId),
      {
        marketItemId: productId,
        farmerId,
        active: true,
        ...fields,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const openSection = (next) => {
    setActiveSection(next);
    const el = document.getElementById(next);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const cancelCropEdit = () => {
    setIsCropEditing(false);
    setCropError("");
    const crop = profile?.crop || {};
    const sowing = crop.sowingDate
      ? new Date(crop.sowingDate).toISOString().slice(0, 10)
      : "";
    setCropForm({
      name: crop.name || "",
      sowingDate: sowing,
      expectedHarvestDays: String(crop.expectedHarvestDays ?? ""),
    });
  };

  const saveCropEdit = async () => {
    const expectedDays = Number(cropForm.expectedHarvestDays);
    if (!cropForm.name.trim()) {
      setCropError("Enter crop name.");
      return;
    }
    if (!cropForm.sowingDate) {
      setCropError("Select sowing date.");
      return;
    }
    if (!Number.isFinite(expectedDays) || expectedDays <= 0) {
      setCropError("Enter valid harvest days.");
      return;
    }

    const sowingDate = new Date(cropForm.sowingDate).toISOString();
    await updateDoc(doc(db, "farmers", farmerId), {
      crop: {
        name: cropForm.name.trim(),
        sowingDate,
        expectedHarvestDays: expectedDays,
      },
      updatedAt: serverTimestamp(),
    });

    setIsCropEditing(false);
    setCropError("");
  };

  const saveLocation = async () => {
    const lat = Number(locationForm.lat);
    const lng = Number(locationForm.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setLocationError("Enter valid latitude and longitude.");
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setLocationError("Latitude must be -90 to 90, longitude -180 to 180.");
      return;
    }

    setLocationSaving(true);
    setLocationError("");

    await updateDoc(doc(db, "farmers", farmerId), {
      locationText: locationForm.locationText?.trim() || "Village, District",
      location: { lat, lng },
      updatedAt: serverTimestamp(),
    });

    setLocationSaving(false);
  };

  const cropDays = useMemo(() => {
    const sow = profile?.crop?.sowingDate;
    if (!sow) return null;
    const d = new Date(sow);
    if (Number.isNaN(d.getTime())) return null;
    return Math.max(
      0,
      Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
    );
  }, [profile?.crop?.sowingDate]);

  const expectedHarvestDays =
    typeof profile?.crop?.expectedHarvestDays === "number"
      ? profile.crop.expectedHarvestDays
      : 60;
  const cropProgress =
    typeof cropDays === "number"
      ? Math.min(100, Math.round((cropDays / expectedHarvestDays) * 100))
      : 30;

  const displayLocationLabel = useMemo(() => {
    if (backendLocationLabel) return backendLocationLabel;
    const manualCity = (profile?.locationText || "").trim();
    const resolvedCity = (resolvedLocation?.city || "").trim();
    const city = resolvedCity || manualCity;
    const country = (resolvedLocation?.country || "India").trim() || "India";
    if (city) return `${city}, ${country}`;
    return country;
  }, [
    backendLocationLabel,
    profile?.locationText,
    resolvedLocation?.city,
    resolvedLocation?.country,
  ]);

  return (
    <div className="fd-layout fd fdv3">
      <main className="fdv3-main">
        <header className="fdv3-topbar">
          <div>
            <h1 className="fdv3-title">Farmer Dashboard</h1>
            <p className="fdv3-subtitle">
              Fast decisions. Live data. Better harvest planning.
            </p>
          </div>

          <div className="fdv3-actions">
            <div className="fdv3-menu">
              <label className="fdv3-menuLabel" htmlFor="fd-section">
                Jump to
              </label>
              <select
                id="fd-section"
                className="fdv3-select"
                value={activeSection}
                onChange={(e) => openSection(e.target.value)}
              >
                <option value="overview">Overview</option>
                <option value="weather">Weather</option>
                <option value="alerts">Alerts</option>
                <option value="crop">Crop</option>
                <option value="farm-health">Farm Health</option>
                <option value="revenue">Revenue</option>
                <option value="products">Products</option>
              </select>
            </div>

            <button
              className="fdv3-btn fdv3-btn--ghost"
              onClick={() => navigate("/consumer/market")}
            >
              Open Consumer Market
            </button>
            <button
              className="fdv3-btn fdv3-btn--primary"
              onClick={() => navigate("/farmer/add-product")}
            >
              Add Product
            </button>

            <div className="fd-profile">
              <button
                className="fdv3-avatar"
                type="button"
                onClick={() => setShowProfile(!showProfile)}
              >
                {String((profile?.name || "F").trim()[0] || "F").toUpperCase()}
              </button>

              {showProfile && (
                <div className="fd-profile-menu">
                  <p className="name">{profile?.name || "Farmer"}</p>
                  <p className="location">
                    {resolvedLocationLoading
                      ? profile?.locationText || "Resolving..."
                      : displayLocationLabel || profile?.locationText || "India"}
                  </p>
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      clearCurrentFarmerSession();
                      navigate("/", { replace: true });
                    }}
                    className="logout"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section
          id="overview"
          className="fd-hero fdv3-hero"
          style={{ backgroundImage: `url(${farmBg})` }}
        >
          <div className="fd-hero__overlay" />
          <div className="fd-hero__content">
            <div>
              <p className="fd-hero__kicker">Welcome back</p>
              <h2 className="fd-hero__title">{profile?.name || farmerName}</h2>
              <p className="fd-hero__subtitle">
                Track urgent deals, manage inventory, and get rule-based alerts
                from live weather signals.
              </p>
              <div className="fd-hero__meta">
                <div className="fd-hero__miniCard">
                  <div className="fd-miniTitle">Total revenue</div>
                  <div className="fd-miniValue">
                    {formatCurrencyINR(hardcodedRevenue.total)}
                  </div>
                  <div className="fd-miniRow">
                    <span>Today</span>
                    <strong>{formatCurrencyINR(hardcodedRevenue.today)}</strong>
                  </div>
                </div>
                <div className="fd-hero__miniCard">
                  <div className="fd-miniTitle">Live weather</div>
                  <div className="fd-miniValue">
                    {typeof weather?.temperatureC === "number"
                      ? `${weather.temperatureC.toFixed(1)}°C`
                      : "--"}
                    <span className="fd-miniSub">
                      {typeof weather?.humidityPercent === "number"
                        ? `${Math.round(weather.humidityPercent)}% RH`
                        : ""}
                    </span>
                  </div>
                  <div className="fd-miniRow">
                    <span>Rain prob</span>
                    <strong>
                      {typeof weather?.rainProbabilityPercent === "number"
                        ? `${Math.round(weather.rainProbabilityPercent)}%`
                        : "--"}
                    </strong>
                  </div>
                </div>
                <div className="fd-hero__miniCard">
                  <div className="fd-miniTitle">Active alerts</div>
                  <div className="fd-miniValue">{alerts.length}</div>
                  <div className="fd-miniRow">
                    <span>Urgent deals</span>
                    <strong>{products.filter((p) => p.isUrgentDeal).length}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="fdv3-heroActions">
              <button
                className="fdv3-btn fdv3-btn--primary"
                onClick={() => navigate("/farmer/add-product")}
              >
                Create listing
              </button>
              <button
                className="fdv3-btn fdv3-btn--ghost"
                onClick={() => navigate("/consumer/market")}
              >
                Preview marketplace
              </button>
              <div className="fdv3-heroHint">
                Location:{" "}
                <strong>
                  {resolvedLocationLoading
                    ? "Resolving location..."
                    : displayLocationLabel || "India"}
                </strong>
                {!backendWeatherFailed &&
                backendLatLng?.lat != null &&
                backendLatLng?.lng != null ? (
                  <span>
                    {" "}
                    ({Number(backendLatLng.lat).toFixed(4)},{" "}
                    {Number(backendLatLng.lng).toFixed(4)})
                  </span>
                ) : hasManualCoords ? (
                  <span>
                    {" "}
                    ({profile.location.lat.toFixed(4)},{" "}
                    {profile.location.lng.toFixed(4)})
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className="fdv3-shell">

          <section id="weather" className="fd-card">
            <div className="fd-card__header">
              <div className="fd-card__title">
                <span className="fd-card__icon">☁</span>
                <h3>Live Weather</h3>
              </div>
              <div className="fd-card__meta">
                <span className="fd-muted">
                  {resolvedLocationLoading
                    ? "Resolving location..."
                    : displayLocationLabel || "India"}
                </span>
                <span className="fd-muted">
                  {weather?.time ? `Updated ${weather.time}` : "Loading..."}
                </span>
              </div>
            </div>
            <div className="fd-card__body">
              {weatherError ? (
                <div className="fd-callout fd-callout--danger">
                  <div className="fd-callout__title">Weather unavailable</div>
                  <div className="fd-callout__text">{weatherError}</div>
                </div>
              ) : (
                <div className="fd-row fd-row--tight">
                  <div className="fd-stat">
                    <div className="fd-stat__label">Temperature</div>
                    <div className="fd-stat__value">
                      {typeof weather?.temperatureC === "number"
                        ? `${weather.temperatureC.toFixed(1)}°C`
                        : "--"}
                    </div>
                    <div className="fd-stat__sub">
                      Rain prob{" "}
                      {typeof weather?.rainProbabilityPercent === "number"
                        ? `${Math.round(weather.rainProbabilityPercent)}%`
                        : "--"}
                    </div>
                  </div>
                  <div className="fd-stat">
                    <div className="fd-stat__label">Humidity</div>
                    <div className="fd-stat__value">
                      {typeof weather?.humidityPercent === "number"
                        ? `${Math.round(weather.humidityPercent)}%`
                        : "--"}
                    </div>
                    <div className="fd-stat__sub">
                      Wind{" "}
                      {typeof weather?.windSpeedKmh === "number"
                        ? `${Math.round(weather.windSpeedKmh)} km/h`
                        : "--"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section id="alerts" className="fd-card">
            <div className="fd-card__header">
              <div className="fd-card__title">
                <span className="fd-card__icon">!</span>
                <h3>Alerts</h3>
              </div>
              <span
                className={`fd-badge ${
                  alerts.length > 0 ? "fd-badge--warning" : "fd-badge--soft"
                }`}
              >
                {alerts.length > 0 ? `${alerts.length} active` : "All clear"}
              </span>
            </div>
            <div className="fd-card__body">
              {alerts.length === 0 ? (
                <p className="fd-muted">No active alerts right now.</p>
              ) : (
                <div className="fd-list">
                  {alerts.slice(0, 4).map((a) => (
                    <div
                      key={a.id}
                      className={`fd-listItem fdv3-alert fdv3-alert--${
                        a.severity || "info"
                      }`}
                    >
                      <div className="fd-listItem__head">
                        <div className="fd-listItem__title">{a.message}</div>
                        <button
                          className="fdv3-btn fdv3-btn--chip"
                          onClick={() => dismissAlert(a.id)}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section id="crop" className="fd-card">
            <div className="fd-card__header">
              <div className="fd-card__title">
                <span className="fd-card__icon">⟲</span>
                <h3>Crop Status</h3>
              </div>
              <span className="fd-badge fd-badge--success">Healthy</span>
            </div>
            <div className="fd-card__body">
              <div className="fd-progressWrap">
                <div className="fd-progressTop">
                  <div>
                    <div className="fd-progressTitle">
                      {profile?.crop?.name || "Tomato"}
                    </div>
                    <div className="fd-muted">
                      Day {typeof cropDays === "number" ? cropDays : "--"} /{" "}
                      {expectedHarvestDays}
                    </div>
                  </div>
                  <div className="fd-badge fd-badge--primary">{cropProgress}%</div>
                </div>
                <div className="fd-progressBar">
                  <div
                    className="fd-progressBar__fill"
                    style={{ width: `${cropProgress}%` }}
                  />
                </div>
              </div>

              {!isCropEditing ? (
                <div className="fdv3-cropSummary">
                  <div className="fdv3-cropRow">
                    <span>Crop</span>
                    <strong>{profile?.crop?.name || "Tomato"}</strong>
                  </div>
                  <div className="fdv3-cropRow">
                    <span>Sowing date</span>
                    <strong>
                      {profile?.crop?.sowingDate
                        ? new Date(profile.crop.sowingDate).toLocaleDateString()
                        : "--"}
                    </strong>
                  </div>
                  <div className="fdv3-cropRow">
                    <span>Harvest days</span>
                    <strong>{expectedHarvestDays}</strong>
                  </div>
                  <button
                    className="fdv3-btn fdv3-btn--ghost"
                    onClick={() => setIsCropEditing(true)}
                  >
                    Edit crop
                  </button>
                </div>
              ) : (
                <div className="fdv3-cropEditor">
                  <div className="fdv3-field">
                    <label className="fd-label" htmlFor="cropName">
                      Crop name
                    </label>
                    <input
                      id="cropName"
                      className="fd-input"
                      value={cropForm.name}
                      onChange={(e) =>
                        setCropForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="fdv3-field">
                    <label className="fd-label" htmlFor="cropSowing">
                      Sowing date
                    </label>
                    <input
                      id="cropSowing"
                      type="date"
                      className="fd-input"
                      value={cropForm.sowingDate}
                      onChange={(e) =>
                        setCropForm((prev) => ({
                          ...prev,
                          sowingDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="fdv3-field">
                    <label className="fd-label" htmlFor="cropHarvest">
                      Expected harvest days
                    </label>
                    <input
                      id="cropHarvest"
                      type="number"
                      className="fd-input"
                      value={cropForm.expectedHarvestDays}
                      min="1"
                      onChange={(e) =>
                        setCropForm((prev) => ({
                          ...prev,
                          expectedHarvestDays: e.target.value,
                        }))
                      }
                    />
                  </div>
                  {cropError && <p className="fdv3-error">{cropError}</p>}
                  <div className="fdv3-inlineForm">
                    <button className="fdv3-btn fdv3-btn--primary" onClick={saveCropEdit}>
                      Save crop
                    </button>
                    <button className="fdv3-btn fdv3-btn--ghost" onClick={cancelCropEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section id="farm-health" className="fd-card">
            <div className="fd-card__header">
              <div className="fd-card__title">
                <span className="fd-card__icon">⛆</span>
                <h3>Farm Health</h3>
              </div>
              <span className="fd-muted">Manual input</span>
            </div>
            <div className="fd-card__body">
              <div className="fd-row fd-row--compact">
                <div className="fd-formStat">
                  <div className="fd-formStat__label">Soil moisture</div>
                  <div className="fd-formStat__value">
                    {profile?.soilMoisturePercent ?? "--"}%
                  </div>
                </div>
                <div className="fd-formGrid">
                  <label className="fd-label" htmlFor="soilMoistureInput">
                    Update soil moisture (%)
                  </label>
                  <div className="fdv3-inlineForm">
                    <input
                      id="soilMoistureInput"
                      className="fd-input"
                      type="number"
                      value={soilMoistureInput}
                      onChange={(e) => setSoilMoistureInput(e.target.value)}
                      placeholder="0 - 100"
                      min="0"
                      max="100"
                    />
                    <button
                      className="fdv3-btn fdv3-btn--primary"
                      onClick={saveSoilMoisture}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
              <div className="fd-formGrid" style={{ marginTop: 14 }}>
                <div className="fdv3-field">
                  <label className="fd-label" htmlFor="locationText">
                    Location name (shown on profile)
                  </label>
                  <input
                    id="locationText"
                    className="fd-input"
                    value={locationForm.locationText}
                    onChange={(e) =>
                      setLocationForm((prev) => ({
                        ...prev,
                        locationText: e.target.value,
                      }))
                    }
                    placeholder="Village, District"
                  />
                </div>
                <div className="fdv3-field">
                  <label className="fd-label" htmlFor="locationLat">
                    Latitude
                  </label>
                  <input
                    id="locationLat"
                    className="fd-input"
                    type="number"
                    step="0.0001"
                    value={locationForm.lat}
                    onChange={(e) =>
                      setLocationForm((prev) => ({
                        ...prev,
                        lat: e.target.value,
                      }))
                    }
                    placeholder="13.0827"
                  />
                </div>
                <div className="fdv3-field">
                  <label className="fd-label" htmlFor="locationLng">
                    Longitude
                  </label>
                  <input
                    id="locationLng"
                    className="fd-input"
                    type="number"
                    step="0.0001"
                    value={locationForm.lng}
                    onChange={(e) =>
                      setLocationForm((prev) => ({
                        ...prev,
                        lng: e.target.value,
                      }))
                    }
                    placeholder="80.2707"
                  />
                </div>
                <div className="fdv3-inlineForm">
                  <button
                    className="fdv3-btn fdv3-btn--primary"
                    onClick={saveLocation}
                    disabled={locationSaving}
                  >
                    {locationSaving ? "Saving..." : "Save location"}
                  </button>
                  {locationError && <span className="fdv3-error">{locationError}</span>}
                </div>
              </div>
            </div>
          </section>

          <section id="revenue" className="fd-card fdv3-span2">
            <div className="fd-card__header">
              <div className="fd-card__title">
                <span className="fd-card__icon">₹</span>
                <h3>Revenue Snapshot</h3>
              </div>
              <span className="fd-muted">Hardcoded demo values</span>
            </div>
            <div className="fd-card__body">
              <div className="fd-row fd-row--compact">
                <div className="fd-stat">
                  <div className="fd-stat__label">Total</div>
                  <div className="fd-stat__value">
                    {formatCurrencyINR(hardcodedRevenue.total)}
                  </div>
                  <div className="fd-stat__sub">All time</div>
                </div>
                <div className="fd-stat">
                  <div className="fd-stat__label">This month</div>
                  <div className="fd-stat__value">
                    {formatCurrencyINR(hardcodedRevenue.monthly)}
                  </div>
                  <div className="fd-stat__sub">Current month</div>
                </div>
                <div className="fd-stat">
                  <div className="fd-stat__label">Today</div>
                  <div className="fd-stat__value">
                    {formatCurrencyINR(hardcodedRevenue.today)}
                  </div>
                  <div className="fd-stat__sub">Since 00:00</div>
                </div>
                <div className="fd-stat">
                  <div className="fd-stat__label">Expected</div>
                  <div className="fd-stat__value">
                    {formatCurrencyINR(hardcodedRevenue.expected)}
                  </div>
                  <div className="fd-stat__sub">Next payout</div>
                </div>
              </div>
            </div>
          </section>

          <section id="products" className="fd-card fdv3-span2">
            <div className="fd-card__header">
              <div className="fd-card__title">
                <span className="fd-card__icon">☐</span>
                <h3>Your Products</h3>
              </div>
              <button
                className="fdv3-btn fdv3-btn--ghost"
                onClick={() => navigate("/farmer/add-product")}
              >
                Add another
              </button>
            </div>
            <div className="fd-card__body">
              {products.length === 0 ? (
                <p className="fd-muted">No products added yet.</p>
              ) : (
                <div className="fdv3-productList">
                  {products.map((p) => {
                    const isEditing = editRow === p.id;
                    const timeLeft = p.isUrgentDeal
                      ? formatTimeLeft(p.dealExpiryTime)
                      : null;

                    return (
                      <div key={p.id} className="fdv3-productRow">
                        <div className="fdv3-productMain">
                          <div className="fdv3-productTitle">
                            <strong>{p.productName || "Unnamed product"}</strong>
                            {p.isUrgentDeal && (
                              <span className="fd-badge fd-badge--danger">
                                Urgent deal{timeLeft ? ` • ${timeLeft}` : ""}
                              </span>
                            )}
                          </div>
                          <div className="fd-muted">
                            {p.category || "Category"} • {p.location || "Location"}
                          </div>
                          <div className="fdv3-productMeta">
                            <span>
                              Price: <strong>INR {p.pricePerKg ?? "--"}</strong> /{" "}
                              {p.unit || "kg"}
                            </span>
                            <span>
                              Qty: <strong>{p.quantityKg ?? "--"}</strong> {p.unit || "kg"}
                            </span>
                          </div>

                          {p.isUrgentDeal && (
                            <div className="fdv3-dealMeta">
                              <input
                                className="fd-input fd-input--sm"
                                type="number"
                                min="0"
                                max="80"
                                value={
                                  typeof p.discountPercent === "number"
                                    ? p.discountPercent
                                    : ""
                                }
                                onChange={(e) =>
                                  updateUrgentMeta(p.id, {
                                    discountPercent:
                                      e.target.value === ""
                                        ? null
                                        : Number(e.target.value),
                                  })
                                }
                                placeholder="Discount %"
                              />
                              <input
                                className="fd-input fd-input--sm"
                                type="datetime-local"
                                value={
                                  p.dealExpiryTime
                                    ? new Date(
                                        p.dealExpiryTime?.toDate?.() ||
                                          p.dealExpiryTime
                                      )
                                        .toISOString()
                                        .slice(0, 16)
                                    : ""
                                }
                                onChange={(e) => {
                                  const v = e.target.value;
                                  updateUrgentMeta(p.id, {
                                    dealExpiryTime: v ? new Date(v) : null,
                                  });
                                }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="fdv3-productActions">
                          {!isEditing ? (
                            <button
                              className="fdv3-btn fdv3-btn--primary"
                              onClick={() => startEdit(p)}
                            >
                              Edit
                            </button>
                          ) : (
                            <>
                              <input
                                className="fd-input fd-input--sm"
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                placeholder="Price"
                              />
                              <input
                                className="fd-input fd-input--sm"
                                type="number"
                                value={editQty}
                                onChange={(e) => setEditQty(e.target.value)}
                                placeholder="Qty"
                              />
                              <button
                                className="fdv3-btn fdv3-btn--primary"
                                onClick={() => saveEdit(p.id)}
                              >
                                Save
                              </button>
                              <button className="fdv3-btn fdv3-btn--ghost" onClick={cancelEdit}>
                                Cancel
                              </button>
                            </>
                          )}

                          <button
                            className="fdv3-btn fdv3-btn--ghost"
                            onClick={() => setUrgentDeal(p, !p.isUrgentDeal)}
                          >
                            {p.isUrgentDeal ? "Disable deal" : "Enable deal"}
                          </button>
                          <button
                            className="fdv3-btn fdv3-btn--danger"
                            onClick={() => removeProduct(p.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FarmerDashboard;

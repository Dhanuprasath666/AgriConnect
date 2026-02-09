export function getCurrentFarmerId() {
  return (
    (typeof window !== "undefined" &&
      window.localStorage &&
      window.localStorage.getItem("ac_farmer_id")) ||
    "demo-farmer"
  );
}

export function setCurrentFarmerId(farmerId) {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem("ac_farmer_id", farmerId);
}

export function getCurrentFarmerName() {
  return (
    (typeof window !== "undefined" &&
      window.localStorage &&
      window.localStorage.getItem("ac_farmer_name")) ||
    "Demo Farmer"
  );
}

export function setCurrentFarmerName(name) {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem("ac_farmer_name", name);
}

export function getCurrentFarmerAccessToken() {
  return (
    (typeof window !== "undefined" &&
      window.localStorage &&
      window.localStorage.getItem("ac_farmer_access_token")) ||
    ""
  );
}

export function setCurrentFarmerAccessToken(token) {
  if (typeof window === "undefined" || !window.localStorage) return;
  if (!token) {
    window.localStorage.removeItem("ac_farmer_access_token");
    return;
  }
  window.localStorage.setItem("ac_farmer_access_token", token);
}

export function clearCurrentFarmerSession() {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.removeItem("ac_farmer_id");
  window.localStorage.removeItem("ac_farmer_name");
  window.localStorage.removeItem("ac_farmer_access_token");
  window.localStorage.removeItem("ac_farmer_details");   // 👈 add this
}


// ===============================
// Farmer Details Storage
// ===============================

export function setCurrentFarmerDetails(details) {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem(
    "ac_farmer_details",
    JSON.stringify(details)
  );
}

export function getCurrentFarmerDetails() {
  if (typeof window === "undefined" || !window.localStorage) return null;

  const raw = window.localStorage.getItem("ac_farmer_details");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}


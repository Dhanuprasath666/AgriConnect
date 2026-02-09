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

export function getCurrentFarmerDetails() {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  const details = window.localStorage.getItem("ac_farmer_details");
  return details ? JSON.parse(details) : null;
}

export function setCurrentFarmerDetails(details) {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem("ac_farmer_details", JSON.stringify(details));
}

export function clearCurrentFarmerDetails() {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.removeItem("ac_farmer_id");
  window.localStorage.removeItem("ac_farmer_name");
  window.localStorage.removeItem("ac_farmer_details");
}


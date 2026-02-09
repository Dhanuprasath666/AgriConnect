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


const FARMER_REGISTRATIONS_KEY = "ac_farmer_registrations";

function readRegistrations() {
  if (typeof window === "undefined" || !window.localStorage) return [];
  const raw = window.localStorage.getItem(FARMER_REGISTRATIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRegistrations(items) {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem(FARMER_REGISTRATIONS_KEY, JSON.stringify(items));
}

export function getFarmerRegistrations() {
  return readRegistrations().sort((a, b) => {
    const aTime = new Date(a?.registeredAt || 0).getTime() || 0;
    const bTime = new Date(b?.registeredAt || 0).getTime() || 0;
    return bTime - aTime;
  });
}

export function addOrUpdateFarmerRegistration(registration) {
  const farmerId = String(registration?.farmerId || "").trim();
  if (!farmerId) return;

  const current = readRegistrations();
  const nextItem = {
    farmerId,
    name: String(registration?.name || "Farmer").trim() || "Farmer",
    phone: String(registration?.phone || "").trim(),
    village: String(registration?.village || "").trim(),
    district: String(registration?.district || "").trim(),
    state: String(registration?.state || "").trim(),
    registeredAt: registration?.registeredAt || new Date().toISOString(),
    isVerified: Boolean(registration?.isVerified),
    verifiedAt: registration?.verifiedAt || null,
    verifiedBy: registration?.verifiedBy || "",
  };

  const existingIndex = current.findIndex((item) => item.farmerId === farmerId);
  if (existingIndex >= 0) {
    const existing = current[existingIndex];
    current[existingIndex] = {
      ...existing,
      ...nextItem,
      isVerified: Boolean(existing?.isVerified || nextItem.isVerified),
      verifiedAt: existing?.verifiedAt || nextItem.verifiedAt || null,
      verifiedBy: existing?.verifiedBy || nextItem.verifiedBy || "",
    };
    writeRegistrations(current);
    return;
  }

  current.push(nextItem);
  writeRegistrations(current);
}

export function markFarmerVerified(farmerId, verifiedBy = "AgriConnect Employee") {
  const normalizedId = String(farmerId || "").trim();
  if (!normalizedId) return;

  const current = readRegistrations();
  const next = current.map((item) => {
    if (item.farmerId !== normalizedId) return item;
    return {
      ...item,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      verifiedBy,
    };
  });

  writeRegistrations(next);
}

export function isFarmerVerified(farmerId) {
  const normalizedId = String(farmerId || "").trim();
  if (!normalizedId) return false;
  return readRegistrations().some(
    (item) => item.farmerId === normalizedId && item.isVerified
  );
}

export function getFarmerRegistration(farmerId) {
  const normalizedId = String(farmerId || "").trim();
  if (!normalizedId) return null;
  return (
    readRegistrations().find((item) => item.farmerId === normalizedId) || null
  );
}

export function isFarmerPendingVerification(farmerId) {
  const registration = getFarmerRegistration(farmerId);
  if (!registration) return false;
  return !Boolean(registration.isVerified);
}

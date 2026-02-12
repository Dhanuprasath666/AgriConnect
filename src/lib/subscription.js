import { getCurrentFarmerId } from "./currentFarmer";

const SUBSCRIPTION_KEY_PREFIX = "ac_farmer_subscription_";
const NEW_REGISTRATION_KEY_PREFIX = "ac_farmer_new_registration_";
const DEFAULT_PLAN_ID = "standard";
const SUBSCRIPTION_DURATION_DAYS = 365;

function getNormalizedFarmerId() {
  return String(getCurrentFarmerId() || "").trim() || "demo-farmer";
}

function getSubscriptionKey() {
  return `${SUBSCRIPTION_KEY_PREFIX}${getNormalizedFarmerId()}`;
}

function getNewRegistrationKey() {
  return `${NEW_REGISTRATION_KEY_PREFIX}${getNormalizedFarmerId()}`;
}

export function getCurrentFarmerSubscription() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  const raw = window.localStorage.getItem(getSubscriptionKey());
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasActiveCurrentFarmerSubscription() {
  const subscription = getCurrentFarmerSubscription();
  if (!subscription?.planId || !subscription?.expiresAt) return false;

  const expiryMs = new Date(subscription.expiresAt).getTime();
  if (!Number.isFinite(expiryMs)) return false;

  return expiryMs > Date.now();
}

export function setCurrentFarmerSubscription(planId = DEFAULT_PLAN_ID) {
  if (typeof window === "undefined" || !window.localStorage) return;

  const normalizedPlanId = String(planId || "").trim() || DEFAULT_PLAN_ID;
  const startsAt = new Date();
  const expiresAt = new Date(startsAt);
  expiresAt.setDate(expiresAt.getDate() + SUBSCRIPTION_DURATION_DAYS);

  const payload = {
    planId: normalizedPlanId,
    startsAt: startsAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  window.localStorage.setItem(getSubscriptionKey(), JSON.stringify(payload));
}

export function markCurrentFarmerAsNewlyRegistered() {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem(getNewRegistrationKey(), "1");
}

export function isCurrentFarmerNewlyRegistered() {
  if (typeof window === "undefined" || !window.localStorage) return false;
  return window.localStorage.getItem(getNewRegistrationKey()) === "1";
}

export function clearCurrentFarmerNewRegistrationFlag() {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.removeItem(getNewRegistrationKey());
}

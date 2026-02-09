import {
  clearConsumerSession,
  getConsumerSession,
} from "./consumerSession";
import {
  clearCurrentFarmerSession,
  getCurrentFarmerAccessToken,
  getCurrentFarmerId,
  getCurrentFarmerName,
} from "../lib/currentFarmer";
import {
  clearPostLoginRedirect,
  clearStoredBuyNowItem,
} from "./buyNowFlow";

export const getAuthState = () => {
  const consumer = getConsumerSession();
  const farmerToken = getCurrentFarmerAccessToken();
  const farmerId = getCurrentFarmerId();
  const farmerName = getCurrentFarmerName();

  return {
    consumer,
    farmer: farmerToken
      ? { id: farmerId, name: farmerName, token: farmerToken }
      : null,
  };
};

export const isConsumerAuthenticated = () => Boolean(getConsumerSession());

export const isFarmerAuthenticated = () => Boolean(getCurrentFarmerAccessToken());

export const getConsumerIdentity = () => {
  const consumer = getConsumerSession();
  if (!consumer) return null;
  const consumerId = consumer.consumerId || consumer.mobile || "";
  return {
    consumerId,
    name: consumer.name || "Consumer",
    mobile: consumer.mobile || "",
  };
};

export const clearAllAuth = () => {
  clearConsumerSession();
  clearCurrentFarmerSession();
  clearPostLoginRedirect();
  clearStoredBuyNowItem();
};

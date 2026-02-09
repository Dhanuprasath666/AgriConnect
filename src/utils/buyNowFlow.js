const POST_LOGIN_REDIRECT_KEY = "ac_post_login_redirect";
const BUY_NOW_ITEM_KEY = "ac_buy_now_item";

export const storeBuyNowItem = (item) => {
  if (typeof window === "undefined" || !window.localStorage || !item) return;
  window.localStorage.setItem(BUY_NOW_ITEM_KEY, JSON.stringify(item));
};

export const getStoredBuyNowItem = () => {
  if (typeof window === "undefined" || !window.localStorage) return null;
  const raw = window.localStorage.getItem(BUY_NOW_ITEM_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearStoredBuyNowItem = () => {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.removeItem(BUY_NOW_ITEM_KEY);
};

export const setPostLoginRedirect = (path, item) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  if (path) {
    window.localStorage.setItem(POST_LOGIN_REDIRECT_KEY, path);
  }
  if (item) {
    storeBuyNowItem(item);
  }
};

export const getPostLoginRedirect = () => {
  if (typeof window === "undefined" || !window.localStorage) return "";
  return window.localStorage.getItem(POST_LOGIN_REDIRECT_KEY) || "";
};

export const clearPostLoginRedirect = () => {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
};

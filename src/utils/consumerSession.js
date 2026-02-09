const CONSUMER_SESSION_KEY = "agri_connect_consumer_session";

export const persistConsumerSession = (session = {}) => {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    role: "consumer",
    ...session,
    authenticatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(
    CONSUMER_SESSION_KEY,
    JSON.stringify(payload)
  );
};

export const getConsumerSession = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(CONSUMER_SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession);

    if (parsedSession?.role !== "consumer") {
      return null;
    }

    return parsedSession;
  } catch (error) {
    return null;
  }
};

export const isConsumerLoggedIn = () => Boolean(getConsumerSession());

export const clearConsumerSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CONSUMER_SESSION_KEY);
};

/**
 * Token Management Utility
 * Handles access token storage and expiration
 */

const TOKEN_KEY = "auth_token";
const TOKEN_EXPIRY_KEY = "auth_token_expiry";
const TOKEN_DURATION = 40 * 60 * 1000; // 40 minutes in milliseconds

/**
 * Store access token with expiration timestamp
 */
export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;

  const expiryTime = Date.now() + TOKEN_DURATION;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
};

/**
 * Get access token from storage
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(TOKEN_KEY);
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);

  // Check if token exists and is not expired
  if (token && expiryTime) {
    const expiry = parseInt(expiryTime, 10);
    if (Date.now() < expiry) {
      return token;
    } else {
      // Token expired, remove it
      removeToken();
      return null;
    }
  }

  return null;
};

/**
 * Check if token is valid (exists and not expired)
 */
export const isTokenValid = (): boolean => {
  return getToken() !== null;
};

/**
 * Remove token from storage
 */
export const removeToken = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

/**
 * Get token expiry time
 */
export const getTokenExpiry = (): number | null => {
  if (typeof window === "undefined") return null;

  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
  return expiryTime ? parseInt(expiryTime, 10) : null;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (): boolean => {
  const expiryTime = getTokenExpiry();
  if (!expiryTime) return true;
  return Date.now() >= expiryTime;
};


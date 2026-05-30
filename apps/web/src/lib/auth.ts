export const AUTH_TOKEN_KEY = "minestoresync.token";
export const AUTH_COOKIE_NAME = AUTH_TOKEN_KEY;

const LEGACY_TOKEN_KEYS = [AUTH_TOKEN_KEY, "minestoresync.auth.token", "auth_token", "token"];

function getCookieAttributes() {
  return "Path=/; SameSite=Lax";
}

function readCookieToken() {
  if (typeof document === "undefined") {
    return null;
  }

  const tokenCookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!tokenCookie) {
    return null;
  }

  const [, token] = tokenCookie.split("=");
  return token ? decodeURIComponent(token) : null;
}

export function getStoredAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  for (const key of LEGACY_TOKEN_KEYS) {
    const value = window.localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return readCookieToken();
}

export function persistAuthToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; ${getCookieAttributes()}; Max-Age=604800`;
}

export function clearStoredAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of LEGACY_TOKEN_KEYS) {
    window.localStorage.removeItem(key);
  }

  document.cookie = `${AUTH_COOKIE_NAME}=; ${getCookieAttributes()}; Max-Age=0`;
}

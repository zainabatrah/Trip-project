const AUTH_STORAGE_KEYS = [
  "token",
  "authToken",
  "currentUser",
  "user",
  "tripUser",
  "tripUserName",
  "tripUserEmail",
  "userRole",
];

function hasWindow() {
  return typeof window !== "undefined";
}

function isStoredValue(value) {
  return Boolean(
    value &&
      value !== "null" &&
      value !== "undefined"
  );
}

export function migrateLegacyAuthToSession() {
  if (!hasWindow()) {
    return;
  }

  for (const key of AUTH_STORAGE_KEYS) {
    const sessionValue =
      window.sessionStorage.getItem(key);

    if (isStoredValue(sessionValue)) {
      window.localStorage.removeItem(key);
      continue;
    }

    const legacyValue =
      window.localStorage.getItem(key);

    if (!isStoredValue(legacyValue)) {
      window.localStorage.removeItem(key);
      continue;
    }

    window.sessionStorage.setItem(
      key,
      legacyValue
    );
    window.localStorage.removeItem(key);
  }
}

export function getAuthStorageValue(key) {
  if (!hasWindow()) {
    return "";
  }

  migrateLegacyAuthToSession();

  const value =
    window.sessionStorage.getItem(key);

  return isStoredValue(value)
    ? value
    : "";
}

export function setAuthStorageValue(
  key,
  value
) {
  if (!hasWindow()) {
    return;
  }

  window.sessionStorage.setItem(
    key,
    String(value)
  );
  window.localStorage.removeItem(key);
}

export function removeAuthStorageValue(
  key
) {
  if (!hasWindow()) {
    return;
  }

  window.sessionStorage.removeItem(key);
  window.localStorage.removeItem(key);
}

export function clearAuthStorage() {
  for (const key of AUTH_STORAGE_KEYS) {
    removeAuthStorageValue(key);
  }
}

migrateLegacyAuthToSession();

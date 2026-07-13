import { apiRequest } from "./http.js";
import {
  clearAuthStorage,
  getAuthStorageValue,
  setAuthStorageValue,
} from "./authStorage.js";

let authenticatedUserPromise =
  null;
const AUTH_CHANGE_EVENT =
  "trip-auth-changed";
const ORGANIZER_EMAIL =
  "mazayaorganiz@gmail.com";
const ORGANIZER_EMAIL_ALIASES =
  new Set([
    ORGANIZER_EMAIL,
    "mazayaorganiz.gmail.com",
  ]);

export function normalizeAuthEmail(email) {
  const normalized = String(
    email || ""
  )
    .trim()
    .toLowerCase();

  if (
    ORGANIZER_EMAIL_ALIASES.has(
      normalized
    )
  ) {
    return ORGANIZER_EMAIL;
  }

  return normalized;
}

function normalizeRole(role) {
  const normalized = String(
    role || "client"
  )
    .trim()
    .toLowerCase();

  if (normalized === "user") {
    return "client";
  }

  return normalized || "client";
}

function normalizeUser(userData) {
  return {
    ...(userData || {}),
    id:
      userData?.id ||
      userData?._id ||
      "",
    _id:
      userData?._id ||
      userData?.id ||
      "",
    fullName:
      userData?.fullName ||
      userData?.name ||
      "",
    name:
      userData?.name ||
      userData?.fullName ||
      "",
    email: normalizeAuthEmail(
      userData?.email
    ),
    role: normalizeRole(
      userData?.role
    ),
  };
}

function storeCurrentUser(userData) {
  const user = normalizeUser(userData);

  setAuthStorageValue(
    "currentUser",
    JSON.stringify(user)
  );

  setAuthStorageValue(
    "tripUser",
    JSON.stringify(user)
  );

  setAuthStorageValue(
    "tripUserName",
    user.fullName
  );

  setAuthStorageValue(
    "tripUserEmail",
    user.email
  );

  setAuthStorageValue(
    "userRole",
    user.role
  );

  notifyAuthChange(user);

  return user;
}

export function syncStoredCurrentUser(
  userData
) {
  return storeCurrentUser(
    userData
  );
}

function notifyAuthChange(user) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      AUTH_CHANGE_EVENT,
      {
        detail: user,
      }
    )
  );
}

export async function registerUser(formData) {
  if (
    typeof FormData !== "undefined" &&
    formData instanceof FormData
  ) {
    formData.set(
      "email",
      normalizeAuthEmail(
        formData.get("email")
      )
    );
  }

  const data = await apiRequest(
    "/auth/register",
    {
      method: "POST",
      body: formData,
    }
  );

  saveAuth(data);

  return data;
}

export async function loginUser(credentials) {
  const data = await apiRequest(
    "/auth/login",
    {
      method: "POST",
      body: {
        ...credentials,
        email: normalizeAuthEmail(
          credentials?.email
        ),
      },
    }
  );

  saveAuth(data);

  return data;
}

export function saveAuth(data) {
  if (!data?.token || !data?.user) {
    throw new Error(
      "Invalid authentication response."
    );
  }

  setAuthStorageValue(
    "token",
    data.token
  );
  setAuthStorageValue(
    "authToken",
    data.token
  );

  storeCurrentUser(data.user);
}

export async function getAuthenticatedUser() {
  if (!authenticatedUserPromise) {
    authenticatedUserPromise =
      apiRequest("/auth/me")
        .then((data) => ({
          ...data,
          user: storeCurrentUser(
            data.user
          ),
        }))
        .finally(() => {
          authenticatedUserPromise =
            null;
        });
  }

  return authenticatedUserPromise;
}

export function subscribeToAuthChanges(
  listener
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const authChangeHandler = (
    event
  ) => {
    listener(
      event.detail
        ? normalizeUser(
            event.detail
          )
        : null
    );
  };

  const storageHandler = (
    event
  ) => {
    if (
      event.key &&
      ![
        "token",
        "authToken",
        "currentUser",
        "tripUser",
        "tripUserName",
        "tripUserEmail",
        "userRole",
      ].includes(event.key)
    ) {
      return;
    }

    listener(getCurrentUser());
  };

  window.addEventListener(
    AUTH_CHANGE_EVENT,
    authChangeHandler
  );
  window.addEventListener(
    "storage",
    storageHandler
  );

  return () => {
    window.removeEventListener(
      AUTH_CHANGE_EVENT,
      authChangeHandler
    );
    window.removeEventListener(
      "storage",
      storageHandler
    );
  };
}

export function isOrganizerRole(role) {
  return [
    "organizer",
    "admin",
  ].includes(normalizeRole(role));
}

export function getCurrentUser() {
  const keys = [
    "currentUser",
    "tripUser",
    "user",
  ];

  for (const key of keys) {
    const value =
      getAuthStorageValue(key);

    if (
      !value ||
      value === "null" ||
      value === "undefined"
    ) {
      continue;
    }

    try {
      const user = JSON.parse(value);

      if (user && typeof user === "object") {
        return normalizeUser(user);
      }
    } catch {
      // Continue checking the other keys.
    }
  }

  return null;
}

export function getAuthToken() {
  return (
    getAuthStorageValue("token") ||
    getAuthStorageValue("authToken") ||
    ""
  );
}

export function isLoggedIn() {
  return Boolean(getAuthToken());
}

export function logoutUser() {
  authenticatedUserPromise =
    null;

  clearAuthStorage();

  notifyAuthChange(null);
}

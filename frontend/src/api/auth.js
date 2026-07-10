import { apiRequest } from "./http.js";

let authenticatedUserPromise =
  null;
const AUTH_CHANGE_EVENT =
  "trip-auth-changed";

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
    email: String(
      userData?.email || ""
    )
      .trim()
      .toLowerCase(),
    role: normalizeRole(
      userData?.role
    ),
  };
}

function storeCurrentUser(userData) {
  const user = normalizeUser(userData);

  localStorage.setItem(
    "currentUser",
    JSON.stringify(user)
  );

  localStorage.setItem(
    "tripUser",
    JSON.stringify(user)
  );

  localStorage.setItem(
    "tripUserName",
    user.fullName
  );

  localStorage.setItem(
    "tripUserEmail",
    user.email
  );

  localStorage.setItem(
    "userRole",
    user.role
  );

  notifyAuthChange(user);

  return user;
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
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
  });

  saveAuth(data);

  return data;
}

export function saveAuth(data) {
  if (!data?.token || !data?.user) {
    throw new Error(
      "Invalid authentication response."
    );
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem(
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
    const value = localStorage.getItem(key);

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
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

export function isLoggedIn() {
  return Boolean(getAuthToken());
}

export function logoutUser() {
  authenticatedUserPromise =
    null;

  [
    "token",
    "authToken",
    "currentUser",
    "user",
    "tripUser",
    "tripUserName",
    "tripUserEmail",
    "userRole",
  ].forEach((key) =>
    localStorage.removeItem(key)
  );

  notifyAuthChange(null);
}

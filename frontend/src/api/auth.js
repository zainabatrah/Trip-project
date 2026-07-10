import { apiRequest } from "./http";

export async function registerUser(formData) {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: formData,
  });

  saveAuth(data);
  return data;
}

export async function loginUser(credentials) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  saveAuth(data);
  return data;
}

export function saveAuth(data) {
  if (!data || !data.token || !data.user) {
    throw new Error("Invalid auth response. Token or user is missing.");
  }

  const user = {
    ...data.user,
    id: data.user.id || data.user._id,
    _id: data.user._id || data.user.id,
    fullName: data.user.fullName || data.user.name || "",
    name: data.user.name || data.user.fullName || "",
    email: data.user.email || "",
    role: data.user.role || "client",
  };

  localStorage.setItem("token", data.token);
  localStorage.setItem("authToken", data.token);

  localStorage.setItem("currentUser", JSON.stringify(user));
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("tripUser", JSON.stringify(user));

  localStorage.setItem("tripUserName", user.fullName || user.name || "");
  localStorage.setItem("tripUserEmail", user.email || "");
  localStorage.setItem("userRole", user.role || "client");
}

export function getCurrentUser() {
  const keys = ["currentUser", "tripUser", "user"];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (!value || value === "null" || value === "undefined") {
      continue;
    }

    try {
      return JSON.parse(value);
    } catch {
      continue;
    }
  }

  return null;
}

export function getAuthToken() {
  return localStorage.getItem("token") || localStorage.getItem("authToken") || "";
}

export function isLoggedIn() {
  return Boolean(getAuthToken());
}

export function logoutUser() {
  [
    "token",
    "authToken",
    "currentUser",
    "user",
    "tripUser",
    "tripUserName",
    "tripUserEmail",
    "userRole",
  ].forEach((key) => localStorage.removeItem(key));
}
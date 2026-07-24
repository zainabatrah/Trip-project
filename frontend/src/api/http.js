import { API_URL } from "./apiBase.js";
import { getAuthStorageValue } from "./authStorage.js";

export async function apiRequest(
  path,
  options = {}
) {
  const token =
    getAuthStorageValue("token") ||
    getAuthStorageValue("authToken") ||
    "";

  const originalBody = options.body;

  const isFormData =
    typeof FormData !== "undefined" &&
    originalBody instanceof FormData;

  let body = originalBody;

  if (
    body !== undefined &&
    body !== null &&
    !isFormData &&
    typeof body !== "string"
  ) {
    body = JSON.stringify(body);
  }

  const headers = {
    Accept: "application/json",
    ...(isFormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      body,
      headers,
    }
  );

  if (response.status === 204) {
    return null;
  }

  const contentType =
    response.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    data = {
      message:
        text ||
        `Request failed with status ${response.status}.`,
    };
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        `Request failed with status ${response.status}.`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

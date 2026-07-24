const configuredApiUrl = String(
  import.meta.env.VITE_API_URL || ""
).trim();

export const API_URL = (
  configuredApiUrl || "/api"
).replace(/\/+$/, "");

export const API_ROOT =
  API_URL.replace(/\/api\/?$/, "");

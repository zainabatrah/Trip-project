import axios from "axios";
import { getAuthStorageValue } from "../api/authStorage.js";
import { logoutUser } from "../api/auth.js";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_URL,

  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token =
    getAuthStorageValue("token") ||
    getAuthStorageValue("authToken");

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      logoutUser();
    }

    return Promise.reject(error);
  }
);

export default api;

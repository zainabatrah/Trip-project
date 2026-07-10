const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type");

  let data;

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    data = {
      message:
        text || `Request failed with status ${response.status}`,
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}
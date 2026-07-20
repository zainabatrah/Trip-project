import { apiRequest } from "./http.js";

export function getNotifications(
  limit = 10
) {
  return apiRequest(
    `/notifications?limit=${encodeURIComponent(
      limit
    )}`
  );
}

export function markNotificationRead(
  id
) {
  return apiRequest(
    `/notifications/${id}/read`,
    {
      method: "PATCH",
    }
  );
}

export function markAllNotificationsRead() {
  return apiRequest(
    "/notifications/read-all",
    {
      method: "PATCH",
    }
  );
}

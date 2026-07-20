import { apiRequest } from "./http.js";

export function getManagedBookings() {
  return apiRequest("/bookings/manage");
}

export function getMyBookings(
  userId
) {
  return apiRequest(
    `/bookings/my-trips/${userId}`
  );
}

export function cancelBookingById(id) {
  return apiRequest(
    `/bookings/cancel/${id}`,
    {
      method: "PUT",
    }
  );
}

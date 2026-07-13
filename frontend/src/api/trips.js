import { apiRequest } from "./http.js";

export function getTrips() {
  return apiRequest("/trips");
}

export function getTripById(id) {
  return apiRequest(`/trips/${id}`);
}

export function bookTrip(id) {
  return apiRequest(`/trips/${id}/book`, {
    method: "POST",
  });
}

export function createTrip(tripData) {
  return apiRequest("/trips", {
    method: "POST",
    body: tripData,
  });
}

export function updateTrip(id, tripData) {
  return apiRequest(`/trips/${id}`, {
    method: "PUT",
    body: tripData,
  });
}

export function deleteTrip(id) {
  return apiRequest(`/trips/${id}`, {
    method: "DELETE",
  });
}

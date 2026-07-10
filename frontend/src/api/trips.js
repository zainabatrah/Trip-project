import { apiRequest } from "./http";

export async function getTrips() {
  return apiRequest("/trips");
}

export async function getTripById(id) {
  return apiRequest(`/trips/${id}`);
}

export async function createTrip(tripData) {
  return apiRequest("/trips", {
    method: "POST",
    body: JSON.stringify(tripData),
  });
}

export async function updateTrip(id, tripData) {
  return apiRequest(`/trips/${id}`, {
    method: "PUT",
    body: JSON.stringify(tripData),
  });
}

export async function deleteTrip(id) {
  return apiRequest(`/trips/${id}`, {
    method: "DELETE",
  });
}
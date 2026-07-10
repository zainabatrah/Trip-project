import { apiRequest } from "./http.js";

let privateTripRequestsPromise =
  null;

export function createPrivateTripRequest(
  requestData
) {
  return apiRequest(
    "/private-trip-requests",
    {
      method: "POST",
      body: requestData,
    }
  );
}

export function getPrivateTripRequests() {
  if (!privateTripRequestsPromise) {
    privateTripRequestsPromise =
      apiRequest(
        "/private-trip-requests"
      ).finally(() => {
        privateTripRequestsPromise =
          null;
      });
  }

  return privateTripRequestsPromise;
}

export function getMyPrivateTripRequests() {
  return apiRequest(
    "/private-trip-requests/mine"
  );
}

export function getPrivateTripRequest(id) {
  return apiRequest(
    `/private-trip-requests/${id}`
  );
}

export function updatePrivateTripRequest(
  id,
  requestData
) {
  return apiRequest(
    `/private-trip-requests/${id}`,
    {
      method: "PATCH",
      body: requestData,
    }
  );
}

export function updatePrivateTripRequestStatus(
  id,
  statusData
) {
  return apiRequest(
    `/private-trip-requests/${id}/status`,
    {
      method: "PATCH",
      body: statusData,
    }
  );
}

export function getPrivateTripMessages(id) {
  return apiRequest(
    `/private-trip-requests/${id}/messages`
  );
}

export function sendPrivateTripMessage(
  id,
  messageData
) {
  return apiRequest(
    `/private-trip-requests/${id}/messages`,
    {
      method: "POST",
      body: messageData,
    }
  );
}

export function sendOrganizerTripMessage(
  id,
  messageData
) {
  return apiRequest(
    `/private-trip-requests/${id}/organizer-messages`,
    {
      method: "POST",
      body: messageData,
    }
  );
}

export function deletePrivateTripRequest(id) {
  return apiRequest(
    `/private-trip-requests/${id}`,
    {
      method: "DELETE",
    }
  );
}

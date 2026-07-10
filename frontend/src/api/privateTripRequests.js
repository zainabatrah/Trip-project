import { apiRequest } from "./http.js";

export function getPrivateTripRequests() {
  return apiRequest("/private-trip-requests");
}

export function getPrivateTripRequestById(id) {
  return apiRequest(`/private-trip-requests/${id}`);
}

export function createPrivateTripRequest(requestData) {
  return apiRequest("/private-trip-requests", {
    method: "POST",
    body: JSON.stringify(requestData),
  });
}

export function updatePrivateTripRequest(id, requestData) {
  return apiRequest(`/private-trip-requests/${id}`, {
    method: "PUT",
    body: JSON.stringify(requestData),
  });
}

export function deletePrivateTripRequest(id) {
  return apiRequest(`/private-trip-requests/${id}`, {
    method: "DELETE",
  });
}

/*
Supports both:

updatePrivateTripRequestStatus(id, "APPROVED", "Enjoy");

and:

updatePrivateTripRequestStatus(id, {
  status: "APPROVED",
  organizerReply: "Enjoy"
});
*/
export function updatePrivateTripRequestStatus(
  id,
  statusOrData,
  organizerReply = ""
) {
  let payload;

  if (
    statusOrData &&
    typeof statusOrData === "object" &&
    !Array.isArray(statusOrData)
  ) {
    payload = {
      status: String(statusOrData.status || "").toUpperCase(),

      organizerReply:
        statusOrData.organizerReply ||
        statusOrData.organizerMessage ||
        "",
    };
  } else {
    payload = {
      status: String(statusOrData || "").toUpperCase(),
      organizerReply,
    };
  }

  return apiRequest(`/private-trip-requests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getPrivateTripMessages(requestId) {
  return apiRequest(
    `/private-trip-requests/${requestId}/messages`
  );
}

export function sendPrivateTripMessage(
  requestId,
  messageData
) {
  return apiRequest(
    `/private-trip-requests/${requestId}/messages`,
    {
      method: "POST",
      body: JSON.stringify(messageData),
    }
  );
}

export function sendOrganizerTripMessage(
  requestId,
  messageData
) {
  return apiRequest(
    `/private-trip-requests/${requestId}/organizer-messages`,
    {
      method: "POST",
      body: JSON.stringify(messageData),
    }
  );
}
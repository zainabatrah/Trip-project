import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import TopNavbar from "../components/TopNavbar";
import welcomeStyles from "../Styles/welcome.module.css";

import {
  getPrivateTripRequests,
  updatePrivateTripRequestStatus,
  getPrivateTripMessages,
  sendOrganizerTripMessage,
} from "../api/privateTripRequests.js";

export default function Approve() {
  const user = getUserData();

  const isOrganizer =
    String(user?.role || "").toLowerCase() === "organizer" ||
    String(user?.role || "").toLowerCase() === "admin" ||
    String(localStorage.getItem("userRole") || "").toLowerCase() ===
      "organizer" ||
    String(localStorage.getItem("userRole") || "").toLowerCase() ===
      "admin";

  const [requests, setRequests] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [updatingId, setUpdatingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const stats = useMemo(() => {
    return {
      total: requests.length,

      pending: requests.filter(
        (request) => getStatus(request) === "PENDING"
      ).length,

      approved: requests.filter(
        (request) => getStatus(request) === "APPROVED"
      ).length,

      rejected: requests.filter(
        (request) => getStatus(request) === "REJECTED"
      ).length,
    };
  }, [requests]);

  useEffect(() => {
    if (!isOrganizer) {
      return;
    }

    let cancelled = false;

    async function loadRequests() {
      try {
        setLoading(true);
        setError("");

        const data = await getPrivateTripRequests();

        const receivedRequests = Array.isArray(data)
          ? data
          : Array.isArray(data?.requests)
            ? data.requests
            : [];

        if (!cancelled) {
          setRequests(receivedRequests);
        }
      } catch (requestError) {
        console.error("Loading requests failed:", requestError);

        if (!cancelled) {
          setRequests([]);

          setError(
            requestError?.message ||
              "Could not load private trip requests."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, [isOrganizer]);

  if (!isOrganizer) {
    return <Navigate to="/" replace />;
  }

  async function approveRequest(id) {
    const message =
      replyText[id]?.trim() ||
      "Your private trip request has been approved. The organizer will contact you soon.";

    await updateStatus(id, "APPROVED", message);
  }

  async function rejectRequest(id) {
    const message =
      replyText[id]?.trim() ||
      "Sorry, this private trip request cannot be accepted right now.";

    await updateStatus(id, "REJECTED", message);
  }

  async function resetRequest(id) {
    await updateStatus(id, "PENDING", "");
  }

  async function updateStatus(id, status, organizerReply) {
    if (updatingId) {
      return;
    }

    try {
      setUpdatingId(id);
      setError("");
      setSuccess("");

      const response = await updatePrivateTripRequestStatus(id, {
        status,
        organizerReply,
      });

      const updatedRequest = response?.request || response;

      setRequests((oldRequests) =>
        oldRequests.map((request) => {
          const requestId = request._id || request.id;

          return requestId === id
            ? updatedRequest
            : request;
        })
      );

      setReplyText((oldReplyText) => ({
        ...oldReplyText,
        [id]: "",
      }));

      setSuccess(
        response?.message ||
          `Request changed to ${formatStatus(status)}.`
      );
    } catch (updateError) {
      console.error("Status update failed:", updateError);

      setError(
        updateError?.message ||
          "Could not update the request status."
      );
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <div
      className={welcomeStyles.body}
      style={styles.page}
    >
      <TopNavbar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Trip Approval</h1>

            <p style={styles.subtitle}>
              Review private trip requests, approve or reject
              them, and send messages to clients.
            </p>
          </div>

          <div style={styles.headerBadge}>
            Organizer Panel
          </div>
        </div>

        <div style={styles.statsGrid}>
          <StatCard
            label="Total"
            value={stats.total}
          />

          <StatCard
            label="Pending"
            value={stats.pending}
          />

          <StatCard
            label="Approved"
            value={stats.approved}
          />

          <StatCard
            label="Rejected"
            value={stats.rejected}
          />
        </div>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.successBox}>
            {success}
          </div>
        )}

        {loading ? (
          <div style={styles.emptyBox}>
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div style={styles.emptyBox}>
            <h2 style={styles.emptyTitle}>
              No private trip requests
            </h2>

            <p style={styles.emptyText}>
              Submitted private trip requests will appear here.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {requests.map((request) => {
              const id = request._id || request.id;
              const status = getStatus(request);
              const isUpdating = updatingId === id;

              return (
                <article
                  key={id}
                  style={styles.card}
                >
                  <div style={styles.cardTop}>
                    <div>
                      <h2 style={styles.clientName}>
                        {request.clientName ||
                          request.fullName ||
                          request.name ||
                          "Client"}
                      </h2>

                      <p style={styles.email}>
                        {request.email ||
                          "No email provided"}
                      </p>
                    </div>

                    <StatusBadge status={status} />
                  </div>

                  <div style={styles.infoGrid}>
                    <Info
                      label="Trip title"
                      value={
                        request.title ||
                        "Private Trip"
                      }
                    />

                    <Info
                      label="Destination"
                      value={
                        request.destination ||
                        request.to ||
                        "Not specified"
                      }
                    />

                    <Info
                      label="Start date"
                      value={
                        request.startDate ||
                        request.date ||
                        "Not selected"
                      }
                    />

                    <Info
                      label="End date"
                      value={
                        request.endDate ||
                        "Not selected"
                      }
                    />

                    <Info
                      label="Travelers"
                      value={
                        request.travelers ??
                        request.passengers ??
                        "Not specified"
                      }
                    />

                    <Info
                      label="Transportation"
                      value={
                        request.transportation ||
                        request.vehicle ||
                        "Not specified"
                      }
                    />

                    <Info
                      label="Budget"
                      value={
                        request.budget !== undefined &&
                        request.budget !== null
                          ? `$${Number(
                              request.budget
                            ).toFixed(2)}`
                          : "Not specified"
                      }
                    />

                    <Info
                      label="Status"
                      value={formatStatus(status)}
                    />
                  </div>

                  <div style={styles.notesBox}>
                    <strong style={styles.boxTitle}>
                      Client Notes
                    </strong>

                    <p style={styles.boxText}>
                      {request.notes ||
                        "No notes were added by the client."}
                    </p>
                  </div>

                  <div style={styles.replyBox}>
                    <label
                      htmlFor={`reply-${id}`}
                      style={styles.boxTitle}
                    >
                      Organizer Reply
                    </label>

                    <textarea
                      id={`reply-${id}`}
                      value={replyText[id] || ""}
                      onChange={(event) =>
                        setReplyText(
                          (oldReplyText) => ({
                            ...oldReplyText,
                            [id]: event.target.value,
                          })
                        )
                      }
                      placeholder="Write a message that the client will see..."
                      maxLength={1000}
                      disabled={isUpdating}
                      style={styles.textarea}
                    />

                    <div style={styles.replyFooter}>
                      <span style={styles.replyHint}>
                        This message is saved when you
                        approve or reject the request.
                      </span>

                      <span style={styles.replyCount}>
                        {(replyText[id] || "").length}
                        /1000
                      </span>
                    </div>

                    {(request.organizerReply ||
                      request.organizerMessage) && (
                      <p style={styles.currentReply}>
                        <strong>
                          Current reply:
                        </strong>{" "}
                        {request.organizerReply ||
                          request.organizerMessage}
                      </p>
                    )}
                  </div>

                  <RequestChat requestId={id} />

                  <div style={styles.actions}>
                    <button
                      type="button"
                      style={{
                        ...styles.approveBtn,
                        ...(isUpdating
                          ? styles.disabledButton
                          : {}),
                      }}
                      disabled={isUpdating}
                      onClick={() =>
                        approveRequest(id)
                      }
                    >
                      {isUpdating
                        ? "Updating..."
                        : "Approve"}
                    </button>

                    <button
                      type="button"
                      style={{
                        ...styles.rejectBtn,
                        ...(isUpdating
                          ? styles.disabledButton
                          : {}),
                      }}
                      disabled={isUpdating}
                      onClick={() =>
                        rejectRequest(id)
                      }
                    >
                      Reject
                    </button>

                    {status !== "PENDING" && (
                      <button
                        type="button"
                        style={{
                          ...styles.resetBtn,
                          ...(isUpdating
                            ? styles.disabledButton
                            : {}),
                        }}
                        disabled={isUpdating}
                        onClick={() =>
                          resetRequest(id)
                        }
                      >
                        Reset to Pending
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function RequestChat({ requestId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] =
    useState(true);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      try {
        setLoadingMessages(true);
        setChatError("");

        const data =
          await getPrivateTripMessages(requestId);

        const receivedMessages = Array.isArray(data)
          ? data
          : Array.isArray(data?.messages)
            ? data.messages
            : [];

        if (!cancelled) {
          setMessages(receivedMessages);
        }
      } catch (messageError) {
        console.error(
          "Loading messages failed:",
          messageError
        );

        if (!cancelled) {
          setMessages([]);

          setChatError(
            messageError?.message ||
              "Could not load messages."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  async function sendMessage(event) {
    event.preventDefault();

    const cleanText = text.trim();

    if (!cleanText || sending) {
      return;
    }

    try {
      setSending(true);
      setChatError("");

      const data =
        await sendOrganizerTripMessage(
          requestId,
          {
            text: cleanText,
          }
        );

      const newMessage = data?.message || data;

      setMessages((oldMessages) => [
        ...oldMessages,
        newMessage,
      ]);

      setText("");
    } catch (messageError) {
      console.error(
        "Organizer message failed:",
        messageError
      );

      setChatError(
        messageError?.message ||
          "Could not send the message."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={styles.chatBox}>
      <h3 style={styles.chatTitle}>
        Client Chat
      </h3>

      <div style={styles.messages}>
        {loadingMessages ? (
          <div style={styles.emptyChat}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={styles.emptyChat}>
            No messages yet.
          </div>
        ) : (
          messages.map((message) => {
            const isOrganizer =
              message.sender === "organizer";

            return (
              <div
                key={
                  message._id ||
                  message.id ||
                  `${message.createdAt}-${message.text}`
                }
                style={{
                  ...styles.messageRow,
                  justifyContent: isOrganizer
                    ? "flex-end"
                    : "flex-start",
                }}
              >
                <div
                  style={{
                    ...styles.bubble,
                    ...(isOrganizer
                      ? styles.organizerBubble
                      : styles.clientBubble),
                  }}
                >
                  <strong>
                    {isOrganizer
                      ? "Organizer"
                      : "Client"}
                  </strong>

                  <p style={styles.messageText}>
                    {message.text}
                  </p>

                  <small style={styles.messageTime}>
                    {formatDateTime(
                      message.createdAt
                    )}
                  </small>
                </div>
              </div>
            );
          })
        )}
      </div>

      {chatError && (
        <div style={styles.chatError}>
          {chatError}
        </div>
      )}

      <form
        onSubmit={sendMessage}
        style={styles.chatForm}
      >
        <input
          type="text"
          value={text}
          onChange={(event) =>
            setText(event.target.value)
          }
          placeholder="Reply to the client..."
          maxLength={1000}
          disabled={sending}
          style={styles.chatInput}
        />

        <button
          type="submit"
          disabled={sending || !text.trim()}
          style={{
            ...styles.sendBtn,
            ...(sending || !text.trim()
              ? styles.disabledButton
              : {}),
          }}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <strong style={styles.statValue}>
        {value}
      </strong>

      <span style={styles.statLabel}>
        {label}
      </span>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={styles.infoBox}>
      <span style={styles.infoLabel}>
        {label}
      </span>

      <strong style={styles.infoValue}>
        {value}
      </strong>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      style={{
        ...styles.status,
        ...(status === "APPROVED"
          ? styles.approved
          : status === "REJECTED"
            ? styles.rejected
            : styles.pending),
      }}
    >
      {formatStatus(status)}
    </span>
  );
}

function getStatus(request) {
  return String(
    request?.status || "PENDING"
  )
    .trim()
    .toUpperCase();
}

function formatStatus(status) {
  const normalizedStatus = String(
    status || "PENDING"
  )
    .trim()
    .toUpperCase();

  return (
    normalizedStatus.charAt(0) +
    normalizedStatus.slice(1).toLowerCase()
  );
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString([], {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getUserData() {
  const possibleKeys = [
    "currentUser",
    "tripUser",
    "user",
  ];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (!value || value === "null") {
      continue;
    }

    try {
      const parsedValue = JSON.parse(value);

      if (
        parsedValue &&
        typeof parsedValue === "object"
      ) {
        return parsedValue;
      }
    } catch {
      // Continue checking other stored values.
    }
  }

  return {
    name:
      localStorage.getItem("tripUserName") ||
      localStorage.getItem("userName") ||
      "User",

    email:
      localStorage.getItem("tripUserEmail") ||
      localStorage.getItem("userEmail") ||
      "",

    role:
      localStorage.getItem("userRole") ||
      "client",
  };
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    color: "#1e293b",
    fontFamily: "Inter, Arial, sans-serif",
  },

  main: {
    width: "100%",
    maxWidth: 1180,
    margin: "0 auto",
    padding: "34px 26px 70px",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
    marginBottom: 26,
  },

  title: {
    margin: 0,
    fontSize: 36,
    fontWeight: 900,
    color: "#1e3a8a",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#475569",
    fontSize: 15,
    lineHeight: 1.7,
    maxWidth: 700,
  },

  headerBadge: {
    padding: "14px 18px",
    borderRadius: 20,
    background:
      "linear-gradient(135deg, #93c5fd, #a78bfa)",
    color: "#0f172a",
    fontWeight: 900,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 16,
    marginBottom: 26,
  },

  statCard: {
    padding: 20,
    borderRadius: 22,
    background: "rgba(255,255,255,0.78)",
    border:
      "1px solid rgba(147,197,253,0.45)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },

  statValue: {
    color: "#1e3a8a",
    fontSize: 32,
    fontWeight: 900,
  },

  statLabel: {
    color: "#475569",
    fontSize: 14,
    fontWeight: 900,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(350px, 1fr))",
    gap: 24,
  },

  card: {
    padding: 22,
    borderRadius: 24,
    background: "rgba(255,255,255,0.78)",
    border:
      "1px solid rgba(147,197,253,0.45)",
    boxSizing: "border-box",
    boxShadow:
      "0 18px 45px rgba(59,130,246,0.14)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 18,
  },

  clientName: {
    margin: 0,
    color: "#1e3a8a",
    fontSize: 23,
    fontWeight: 900,
  },

  email: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
  },

  status: {
    padding: "7px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  pending: {
    background: "rgba(250,204,21,0.25)",
    color: "#a16207",
  },

  approved: {
    background: "rgba(34,197,94,0.18)",
    color: "#15803d",
  },

  rejected: {
    background: "rgba(239,68,68,0.15)",
    color: "#dc2626",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 12,
  },

  infoBox: {
    padding: 13,
    borderRadius: 15,
    background: "rgba(255,255,255,0.82)",
    border: "1px solid #bfdbfe",
  },

  infoLabel: {
    display: "block",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 5,
  },

  infoValue: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: 900,
    wordBreak: "break-word",
  },

  notesBox: {
    marginTop: 14,
    padding: 15,
    borderRadius: 17,
    background: "rgba(239,246,255,0.8)",
    border: "1px solid #bfdbfe",
  },

  replyBox: {
    marginTop: 14,
    padding: 15,
    borderRadius: 17,
    background: "rgba(250,250,255,0.85)",
    border: "1px solid #ddd6fe",
  },

  boxTitle: {
    display: "block",
    color: "#1e3a8a",
    marginBottom: 8,
    fontWeight: 900,
  },

  boxText: {
    margin: 0,
    color: "#334155",
    lineHeight: 1.6,
  },

  textarea: {
    width: "100%",
    minHeight: 90,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #bfdbfe",
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
  },

  replyFooter: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 7,
  },

  replyHint: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
  },

  replyCount: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 800,
  },

  currentReply: {
    margin: "10px 0 0",
    color: "#475569",
    fontSize: 13,
    fontWeight: 700,
  },

  actions: {
    marginTop: 16,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  approveBtn: {
    padding: "11px 14px",
    border: "none",
    borderRadius: 13,
    background: "#22c55e",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },

  rejectBtn: {
    padding: "11px 14px",
    border: "none",
    borderRadius: 13,
    background: "#ef4444",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },

  resetBtn: {
    padding: "11px 14px",
    border: "none",
    borderRadius: 13,
    background: "#64748b",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },

  disabledButton: {
    opacity: 0.55,
    cursor: "not-allowed",
  },

  emptyBox: {
    padding: 34,
    borderRadius: 24,
    background: "rgba(255,255,255,0.78)",
    border:
      "1px solid rgba(147,197,253,0.45)",
    textAlign: "center",
  },

  emptyTitle: {
    margin: 0,
    color: "#1e3a8a",
    fontSize: 24,
    fontWeight: 900,
  },

  emptyText: {
    margin: "10px auto 0",
    color: "#64748b",
    fontWeight: 600,
    maxWidth: 560,
    lineHeight: 1.7,
  },

  errorBox: {
    marginBottom: 18,
    padding: 13,
    borderRadius: 14,
    background: "rgba(239,68,68,0.15)",
    color: "#dc2626",
    fontWeight: 900,
  },

  successBox: {
    marginBottom: 18,
    padding: 13,
    borderRadius: 14,
    background: "rgba(34,197,94,0.15)",
    color: "#15803d",
    fontWeight: 900,
  },

  chatBox: {
    marginTop: 14,
    padding: 15,
    borderRadius: 17,
    background: "rgba(255,255,255,0.86)",
    border: "1px solid #bfdbfe",
  },

  chatTitle: {
    margin: "0 0 12px",
    color: "#1e3a8a",
    fontSize: 16,
    fontWeight: 900,
  },

  messages: {
    maxHeight: 220,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  emptyChat: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
  },

  messageRow: {
    display: "flex",
  },

  bubble: {
    maxWidth: "80%",
    padding: 11,
    borderRadius: 14,
  },

  organizerBubble: {
    background: "#dbeafe",
    color: "#1e3a8a",
  },

  clientBubble: {
    background: "#f1f5f9",
    color: "#0f172a",
  },

  messageText: {
    margin: "6px 0",
    lineHeight: 1.5,
  },

  messageTime: {
    color: "#64748b",
    fontSize: 11,
  },

  chatError: {
    marginTop: 8,
    color: "#dc2626",
    fontSize: 12,
    fontWeight: 800,
  },

  chatForm: {
    marginTop: 12,
    display: "flex",
    gap: 8,
  },

  chatInput: {
    flex: 1,
    padding: "11px 12px",
    borderRadius: 13,
    border: "1px solid #bfdbfe",
    outline: "none",
  },

  sendBtn: {
    padding: "11px 14px",
    border: "none",
    borderRadius: 13,
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },
};
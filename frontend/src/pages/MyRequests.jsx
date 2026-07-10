import { useEffect, useState } from "react";

import TopNavbar from "../components/TopNavbar";
import welcomeStyles from "../Styles/welcome.module.css";

import {
  getPrivateTripRequests,
  getPrivateTripMessages,
  sendPrivateTripMessage,
} from "../api/privateTripRequests.js";

export default function MyRequests() {
  const user = getUserData();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      try {
        setLoading(true);
        setError("");

        if (!user?.email) {
          if (!cancelled) {
            setRequests([]);
            setError("No user email found. Please login again.");
          }

          return;
        }

        const data = await getPrivateTripRequests();

        const allRequests = Array.isArray(data)
          ? data
          : Array.isArray(data.requests)
            ? data.requests
            : [];

        const userRequests = allRequests.filter(
          (request) =>
            String(request.email || "").toLowerCase() ===
            String(user.email).toLowerCase()
        );

        if (!cancelled) {
          setRequests(userRequests);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error.message || "Could not load your requests.");
          setRequests([]);
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
  }, [user?.email]);

  return (
    <div className={welcomeStyles.body} style={styles.page}>
      <TopNavbar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Requests</h1>

            <p style={styles.subtitle}>
              Track your private trip requests, check the organizer
              decision, and send messages.
            </p>
          </div>

          <div style={styles.summaryBox}>
            <strong>{requests.length}</strong>
            <span>Total Requests</span>
          </div>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {loading ? (
          <div style={styles.emptyBox}>Loading your requests...</div>
        ) : requests.length === 0 ? (
          <div style={styles.emptyBox}>
            <h2 style={styles.emptyTitle}>No requests yet</h2>

            <p style={styles.emptyText}>
              You have not sent a private trip request using this
              account.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {requests.map((request) => (
              <RequestCard
                key={request._id || request.id}
                request={request}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function RequestCard({ request }) {
  const id = request._id || request.id;
  const status = String(request.status || "PENDING").toUpperCase();

  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <div>
          <h2 style={styles.destination}>
            {request.from || "Unknown"} → {request.to || "Unknown"}
          </h2>

          <p style={styles.date}>{request.date || "No date selected"}</p>
        </div>

        <StatusBadge status={status} />
      </div>

      <div style={styles.infoGrid}>
        <Info
          label="Client"
          value={request.fullName || "Unknown client"}
        />

        <Info label="Email" value={request.email || "No email"} />

        <Info
          label="Passengers"
          value={request.passengers ?? "Not specified"}
        />

        <Info
          label="Vehicle"
          value={request.vehicle || "Not specified"}
        />

        <Info
          label="Budget"
          value={
            request.budget !== undefined
              ? `$${Number(request.budget).toFixed(2)}`
              : "Not specified"
          }
        />

        <Info label="Status" value={formatStatus(status)} />
      </div>

      <div style={styles.notesBox}>
        <strong style={styles.boxTitle}>My Notes</strong>

        <p style={styles.boxText}>
          {request.notes || "No notes were added."}
        </p>
      </div>

      <div style={styles.resultBox}>
        <strong style={styles.boxTitle}>Organizer Result</strong>

        <p style={styles.boxText}>
          {request.organizerMessage ||
            getDefaultOrganizerMessage(status)}
        </p>
      </div>

      <RequestChat requestId={id} />
    </div>
  );
}

function RequestChat({ requestId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      try {
        setLoadingMessages(true);
        setChatError("");

        const data = await getPrivateTripMessages(requestId);

        const receivedMessages = Array.isArray(data)
          ? data
          : Array.isArray(data.messages)
            ? data.messages
            : [];

        if (!cancelled) {
          setMessages(receivedMessages);
        }
      } catch (error) {
        if (!cancelled) {
          setChatError(error.message || "Could not load messages.");
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

      const data = await sendPrivateTripMessage(requestId, {
        text: cleanText,
      });

      const newMessage = data.message || data;

      setMessages((oldMessages) => [
        ...oldMessages,
        newMessage,
      ]);

      setText("");
    } catch (error) {
      setChatError(error.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={styles.chatBox}>
      <h3 style={styles.chatTitle}>Message Organizer</h3>

      <div style={styles.messages}>
        {loadingMessages ? (
          <div style={styles.emptyChat}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={styles.emptyChat}>
            No messages yet. Ask the organizer a question.
          </div>
        ) : (
          messages.map((message) => {
            const isClient = message.sender === "client";

            return (
              <div
                key={
                  message._id ||
                  message.id ||
                  `${message.createdAt}-${message.text}`
                }
                style={{
                  ...styles.messageRow,
                  justifyContent: isClient
                    ? "flex-end"
                    : "flex-start",
                }}
              >
                <div
                  style={{
                    ...styles.bubble,
                    ...(isClient
                      ? styles.clientBubble
                      : styles.organizerBubble),
                  }}
                >
                  <strong>
                    {isClient ? "You" : "Organizer"}
                  </strong>

                  <p style={styles.messageText}>{message.text}</p>

                  <small style={styles.messageTime}>
                    {formatDateTime(message.createdAt)}
                  </small>
                </div>
              </div>
            );
          })
        )}
      </div>

      {chatError && (
        <div style={styles.chatError}>{chatError}</div>
      )}

      <form onSubmit={sendMessage} style={styles.chatForm}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write a message to the organizer..."
          maxLength={1000}
          style={styles.chatInput}
        />

        <button
          type="submit"
          disabled={sending || !text.trim()}
          style={{
            ...styles.sendBtn,
            opacity: sending || !text.trim() ? 0.6 : 1,
          }}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={styles.infoBox}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value}</strong>
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

function formatStatus(status) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function getDefaultOrganizerMessage(status) {
  if (status === "APPROVED") {
    return "Your request has been approved. The organizer will contact you soon.";
  }

  if (status === "REJECTED") {
    return "Your request was rejected. Contact the organizer for more details.";
  }

  return "Your request is still being reviewed.";
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString([], {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getUserData() {
  const possibleKeys = ["currentUser", "tripUser", "user"];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (!value || value === "null") {
      continue;
    }

    try {
      return JSON.parse(value);
    } catch {
      // Continue checking other stored values.
    }
  }

  return {
    name:
      localStorage.getItem("tripUserName") ||
      localStorage.getItem("userName") ||
      "Client",

    email:
      localStorage.getItem("tripUserEmail") ||
      localStorage.getItem("userEmail") ||
      "",
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
    padding: "34px 26px",
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
    maxWidth: 680,
  },

  summaryBox: {
    minWidth: 150,
    padding: "18px 22px",
    borderRadius: 22,
    background: "linear-gradient(135deg, #93c5fd, #a78bfa)",
    color: "#0f172a",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontWeight: 900,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
    gap: 24,
  },

  card: {
    padding: 22,
    borderRadius: 24,
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(147,197,253,0.45)",
    boxSizing: "border-box",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 18,
  },

  destination: {
    margin: 0,
    color: "#1e3a8a",
    fontSize: 23,
    fontWeight: 900,
  },

  date: {
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
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
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

  resultBox: {
    marginTop: 14,
    padding: 15,
    borderRadius: 17,
    background: "rgba(240,253,244,0.85)",
    border: "1px solid #bbf7d0",
  },

  boxTitle: {
    display: "block",
    color: "#1e3a8a",
    marginBottom: 8,
  },

  boxText: {
    margin: 0,
    color: "#334155",
    lineHeight: 1.6,
  },

  emptyBox: {
    padding: 34,
    borderRadius: 24,
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(147,197,253,0.45)",
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
    maxWidth: 520,
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

  clientBubble: {
    background: "#dbeafe",
    color: "#1e3a8a",
  },

  organizerBubble: {
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
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import PublicPageLayout from "../components/PublicPageLayout.jsx";
import {
  getStatusBadgeStyle,
  pageTheme,
} from "../components/publicPageTheme.js";
import {
  getPrivateTripRequests,
  getMyPrivateTripRequests,
  getPrivateTripMessages,
  sendPrivateTripMessage,
} from "../api/privateTripRequests.js";

function formatDate(value) {
  if (!value) {
    return "Not selected";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString();
}

function getApprovedTripId(request) {
  return (
    request?.approvedTripId?._id ||
    request?.approvedTripId ||
    ""
  );
}

export default function MyRequests() {
  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const statistics = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter(
        (request) =>
          String(
            request.status || ""
          ).toUpperCase() ===
          "PENDING"
      ).length,
      approved: requests.filter(
        (request) =>
          String(
            request.status || ""
          ).toUpperCase() ===
          "APPROVED"
      ).length,
      rejected: requests.filter(
        (request) =>
          String(
            request.status || ""
          ).toUpperCase() ===
          "REJECTED"
      ).length,
      postponed: requests.filter(
        (request) =>
          String(
            request.status || ""
          ).toUpperCase() ===
          "POSTPONED"
      ).length,
      openChats: requests.filter(
        (request) =>
          Array.isArray(
            request.messages
          ) &&
          request.messages.length > 0
      ).length,
    }),
    [requests]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getMyPrivateTripRequests().catch(
            () =>
              getPrivateTripRequests()
          );

        if (!cancelled) {
          setRequests(
            Array.isArray(data?.requests)
              ? data.requests
              : []
          );
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.message ||
              "Could not load your requests."
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
  }, []);

  return (
    <PublicPageLayout
      eyebrow="Client Dashboard"
      title="My Requests"
      subtitle="Track your private trip requests and communicate with the organizer."
      maxWidth={1040}
      headerAction={
        <div style={styles.headerCard}>
          <strong style={styles.headerValue}>
            {statistics.total}
          </strong>
          <span style={styles.headerText}>
            requests in your account
          </span>
        </div>
      }
    >
      <div style={styles.statistics}>
        <Stat label="Total" value={statistics.total} />
        <Stat label="Pending" value={statistics.pending} />
        <Stat label="Approved" value={statistics.approved} />
        <Stat label="Rejected" value={statistics.rejected} />
        <Stat label="Postponed" value={statistics.postponed} />
        <Stat label="Chats" value={statistics.openChats} />
      </div>

      {error && (
        <div style={pageTheme.errorBox}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={pageTheme.emptyBox}>
          Loading requests...
        </div>
      ) : requests.length === 0 ? (
        <div style={pageTheme.emptyBox}>
          You have not submitted any private
          trip requests.
        </div>
      ) : (
        <div style={styles.grid}>
          {requests.map((request) => (
            <RequestCard
              key={
                request._id ||
                request.id
              }
              request={request}
            />
          ))}
        </div>
      )}
    </PublicPageLayout>
  );
}

function RequestCard({ request }) {
  const id = request._id || request.id;
  const submittedAt = formatDate(
    request.createdAt
  );
  const approvedTripId =
    getApprovedTripId(request);

  return (
    <article style={pageTheme.surface}>
      <div style={styles.cardTop}>
        <div>
          <h2 style={styles.cardTitle}>
            {request.title}
          </h2>

          <p style={styles.cardText}>
            End trip:{" "}
            <strong>
              {request.destination}
            </strong>
          </p>

          <div style={styles.metaRow}>
            <span style={pageTheme.pill}>
              {request.transportation}
            </span>
            <span style={styles.metaText}>
              Submitted {submittedAt}
            </span>
          </div>
        </div>

        <StatusBadge
          status={request.status}
        />
      </div>

      <div style={styles.infoGrid}>
        <Info
          label="Start trip"
          value={
            request.pickupCity ||
            "Not set"
          }
        />

        <Info
          label="Start date"
          value={formatDate(
            request.startDate
          )}
        />

        <Info
          label="End date"
          value={formatDate(request.endDate)}
        />

        <Info
          label="Travelers"
          value={request.travelers}
        />

        <Info
          label="Transportation"
          value={request.transportation}
        />

        <Info
          label="Budget"
          value={`$${Number(
            request.budget || 0
          ).toFixed(2)}`}
        />

        <Info
          label="Client"
          value={request.clientName}
        />

        <Info
          label="Reviewed"
          value={formatDate(
            request.reviewedAt
          )}
        />
      </div>

      <section
        style={{
          ...pageTheme.softSurface,
          marginTop: 14,
        }}
      >
        <strong style={styles.boxLabel}>
          My notes
        </strong>

        <p style={styles.boxText}>
          {request.notes ||
            "No notes were added."}
        </p>
      </section>

      <section
        style={{
          ...pageTheme.softSurface,
          marginTop: 14,
        }}
      >
        <strong style={styles.boxLabel}>
          Organizer result
        </strong>

        <p style={styles.boxText}>
          {request.organizerReply ||
            defaultOrganizerMessage(
              request.status
            )}
        </p>
      </section>

      {approvedTripId ? (
        <section
          style={{
            ...pageTheme.softSurface,
            marginTop: 14,
          }}
        >
          <div style={styles.tripSyncRow}>
            <div>
              <strong style={styles.boxLabel}>
                Approved trip
              </strong>
              <p style={styles.boxText}>
                Your approved private trip was added to the trips list and saved in the database.
              </p>
            </div>

            <Link
              to={`/trips/${approvedTripId}`}
              style={pageTheme.buttonSecondary}
            >
              Open Trip
            </Link>
          </div>
        </section>
      ) : null}

      <RequestChat
        requestId={id}
        refreshToken={
          request.updatedAt ||
          request.reviewedAt ||
          request.status
        }
      />
    </article>
  );
}

function RequestChat({
  requestId,
  refreshToken,
}) {
  const [messages, setMessages] =
    useState([]);

  const [text, setText] = useState("");
  const [loading, setLoading] =
    useState(true);
  const [sending, setSending] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    async function loadMessages(
      silently = false
    ) {
      try {
        if (
          !cancelled &&
          !silently
        ) {
          setLoading(true);
        }

        const data =
          await getPrivateTripMessages(
            requestId
          );

        if (!cancelled) {
          setMessages(
            Array.isArray(data?.messages)
              ? data.messages
              : []
          );
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
        }
      } finally {
        if (
          !cancelled &&
          !silently
        ) {
          setLoading(false);
        }
      }
    }

    loadMessages();
    intervalId = window.setInterval(() => {
      loadMessages(true);
    }, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [requestId, refreshToken]);

  async function submitMessage(event) {
    event.preventDefault();

    const cleanText = text.trim();

    if (!cleanText || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const data =
        await sendPrivateTripMessage(
          requestId,
          {
            text: cleanText,
          }
        );

      setMessages((current) => [
        ...current,
        data.message,
      ]);

      setText("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      style={{
        ...pageTheme.softSurface,
        marginTop: 18,
      }}
    >
      <h3 style={pageTheme.smallTitle}>
        Chat With Organizer
      </h3>

      {error && (
        <div style={pageTheme.errorBox}>
          {error}
        </div>
      )}

      <div style={styles.messages}>
        {loading ? (
          <div style={styles.chatEmpty}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={styles.chatEmpty}>
            No messages yet.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={
                message._id ||
                `${message.createdAt}-${message.text}`
              }
              style={{
                ...styles.message,
                marginLeft:
                  message.sender === "client"
                    ? "auto"
                    : 0,
                background:
                  message.sender === "client"
                    ? "rgba(191, 219, 254, 0.72)"
                    : "rgba(255, 255, 255, 0.88)",
              }}
            >
              <strong>
                {message.sender === "client"
                  ? "You"
                  : "Organizer"}
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
          ))
        )}
      </div>

      <form
        onSubmit={submitMessage}
        style={styles.chatForm}
      >
        <input
          value={text}
          onChange={(event) =>
            setText(event.target.value)
          }
          placeholder="Write a message..."
          maxLength={1000}
          disabled={sending}
          style={pageTheme.control}
        />

        <button
          type="submit"
          disabled={sending}
          style={{
            ...pageTheme.buttonPrimary,
            opacity: sending ? 0.7 : 1,
            cursor: sending
              ? "not-allowed"
              : "pointer",
          }}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div style={styles.info}>
      <span style={styles.infoLabel}>
        {label}
      </span>
      <strong>
        {value ?? "Not specified"}
      </strong>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(
    status || "PENDING"
  ).toUpperCase();

  return (
    <span
      style={getStatusBadgeStyle(
        normalized
      )}
    >
      {normalized}
    </span>
  );
}

function defaultOrganizerMessage(status) {
  const normalized = String(
    status || "PENDING"
  ).toUpperCase();

  if (normalized === "APPROVED") {
    return "Your request has been approved.";
  }

  if (normalized === "REJECTED") {
    return "Your request has been rejected.";
  }

  if (normalized === "POSTPONED") {
    return "Your request has been postponed.";
  }

  return "Your request is still being reviewed.";
}

const styles = {
  headerCard: {
    minWidth: 150,
    padding: "18px 20px",
    borderRadius: 18,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow:
      "0 12px 30px rgba(96, 165, 250, 0.18)",
    display: "grid",
    gap: 4,
    textAlign: "center",
  },

  headerValue: {
    fontSize: 28,
    color: "#1e3a8a",
  },

  headerText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  statistics: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 12,
    marginBottom: 18,
  },

  stat: {
    display: "grid",
    gap: 5,
    padding: 18,
    borderRadius: 14,
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow:
      "0 12px 30px rgba(96, 165, 250, 0.18)",
  },

  statValue: {
    fontSize: 28,
    color: "#1e3a8a",
  },

  grid: {
    display: "grid",
    gap: 22,
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
  },

  cardTitle: {
    margin: "0 0 8px",
    fontSize: 24,
    fontWeight: 900,
    color: "#1e3a8a",
  },

  cardText: {
    margin: 0,
    color: "#475569",
  },

  metaRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 12,
  },

  metaText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
  },

  tripSyncRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "center",
    flexWrap: "wrap",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 12,
    margin: "20px 0",
  },

  info: {
    display: "grid",
    gap: 5,
    padding: 16,
    borderRadius: 16,
    background: "rgba(255, 255, 255, 0.78)",
    border: "1px solid rgba(147, 197, 253, 0.4)",
  },

  infoLabel: {
    color: "#64748b",
    fontSize: 13,
  },

  boxLabel: {
    display: "block",
    marginBottom: 8,
    color: "#1e3a8a",
  },

  boxText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.7,
  },

  messages: {
    display: "grid",
    gap: 10,
    maxHeight: 260,
    overflowY: "auto",
  },

  message: {
    width: "fit-content",
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(147, 197, 253, 0.32)",
  },

  messageText: {
    margin: "8px 0 6px",
    color: "#334155",
  },

  messageTime: {
    display: "block",
    color: "#64748b",
    fontSize: 11,
  },

  chatEmpty: {
    padding: 12,
    borderRadius: 12,
    color: "#64748b",
    background: "rgba(255, 255, 255, 0.68)",
  },

  chatForm: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
};

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <strong style={styles.statValue}>
        {value}
      </strong>
      <span style={styles.infoLabel}>
        {label}
      </span>
    </div>
  );
}
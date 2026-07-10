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
  updatePrivateTripRequest,
  updatePrivateTripRequestStatus,
  getPrivateTripMessages,
  sendOrganizerTripMessage,
} from "../api/privateTripRequests.js";

function formatDate(value) {
  if (!value) {
    return "Not selected";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Invalid date"
    : date.toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString();
}

function getApprovedTripId(request) {
  return (
    request?.approvedTripId?._id ||
    request?.approvedTripId ||
    ""
  );
}

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function buildEditForm(request) {
  return {
    title: request.title || "",
    destination:
      request.destination || "",
    startDate: toDateInputValue(
      request.startDate
    ),
    endDate: toDateInputValue(
      request.endDate
    ),
    transportation:
      request.transportation || "Car",
    travelers: String(
      request.travelers ?? 1
    ),
    budget: String(
      request.budget ?? 0
    ),
    notes: request.notes || "",
  };
}

export default function Approve() {
  const [requests, setRequests] =
    useState([]);

  const [replyText, setReplyText] =
    useState({});
  const [editForms, setEditForms] =
    useState({});

  const [updatingId, setUpdatingId] =
    useState("");
  const [savingEditId, setSavingEditId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const statistics = useMemo(
    () => ({
      total: requests.length,

      pending: requests.filter(
        (request) =>
          request.status === "PENDING"
      ).length,

      approved: requests.filter(
        (request) =>
          request.status === "APPROVED"
      ).length,

      rejected: requests.filter(
        (request) =>
          request.status === "REJECTED"
      ).length,
    }),
    [requests]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      try {
        const data =
          await getPrivateTripRequests();

        if (!cancelled) {
          const nextRequests = Array.isArray(
            data?.requests
          )
            ? data.requests
            : [];

          setRequests(
            nextRequests
          );
          setEditForms(
            Object.fromEntries(
              nextRequests.map((request) => [
                request._id || request.id,
                buildEditForm(request),
              ])
            )
          );
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
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

  function handleEditChange(
    id,
    field,
    value
  ) {
    setEditForms((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  }

  async function saveRequestEdits(id) {
    if (savingEditId || updatingId) {
      return;
    }

    const form = editForms[id];

    if (!form) {
      return;
    }

    try {
      setSavingEditId(id);
      setError("");
      setSuccess("");

      const data =
        await updatePrivateTripRequest(
          id,
          {
            title: form.title.trim(),
            destination:
              form.destination.trim(),
            startDate: form.startDate,
            endDate: form.endDate,
            transportation:
              form.transportation,
            travelers: Number(
              form.travelers
            ),
            budget: Number(form.budget),
            notes: form.notes.trim(),
          }
        );

      setRequests((current) =>
        current.map((request) =>
          (request._id || request.id) === id
            ? data.request
            : request
        )
      );

      setEditForms((current) => ({
        ...current,
        [id]: buildEditForm(data.request),
      }));

      setSuccess(data.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingEditId("");
    }
  }

  async function updateStatus(
    id,
    status
  ) {
    if (updatingId) {
      return;
    }

    try {
      setUpdatingId(id);
      setError("");
      setSuccess("");

      const data =
        await updatePrivateTripRequestStatus(
          id,
          {
            status,
            organizerReply:
              replyText[id]?.trim() || "",
          }
        );

      setRequests((current) =>
        current.map((request) =>
          (request._id || request.id) === id
            ? data.request
            : request
        )
      );
      setEditForms((current) => ({
        ...current,
        [id]: buildEditForm(data.request),
      }));

      setReplyText((current) => ({
        ...current,
        [id]: "",
      }));

      setSuccess(data.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <PublicPageLayout
      eyebrow="Organizer Panel"
      title="Trip Approval"
      subtitle="Review private trip requests and communicate with clients."
      maxWidth={1100}
      headerAction={
        <div style={styles.headerCard}>
          <strong style={styles.headerValue}>
            {statistics.pending}
          </strong>
          <span style={styles.headerText}>
            requests waiting for a decision
          </span>
        </div>
      }
    >
      <div style={styles.statistics}>
        <Stat
          label="Total"
          value={statistics.total}
        />
        <Stat
          label="Pending"
          value={statistics.pending}
        />
        <Stat
          label="Approved"
          value={statistics.approved}
        />
        <Stat
          label="Rejected"
          value={statistics.rejected}
        />
      </div>

      {error && (
        <div style={pageTheme.errorBox}>
          {error}
        </div>
      )}

      {success && (
        <div style={pageTheme.successBox}>
          {success}
        </div>
      )}

      {loading ? (
        <div style={pageTheme.emptyBox}>
          Loading requests...
        </div>
      ) : requests.length === 0 ? (
        <div style={pageTheme.emptyBox}>
          No private trip requests.
        </div>
      ) : (
        <div style={styles.grid}>
          {requests.map((request) => {
            const id =
              request._id || request.id;
            const approvedTripId =
              getApprovedTripId(request);

            const updating =
              updatingId === id;
            const savingEdit =
              savingEditId === id;
            const busy =
              updating || savingEdit;
            const form =
              editForms[id] ||
              buildEditForm(request);

            return (
              <article
                key={id}
                style={pageTheme.surface}
              >
                <div style={styles.cardTop}>
                  <div>
                    <h2 style={styles.cardTitle}>
                      {request.title}
                    </h2>

                    <p style={styles.cardText}>
                      {request.clientName} —{" "}
                      {request.email}
                    </p>

                    <div style={styles.metaRow}>
                      <span style={pageTheme.pill}>
                        {request.transportation}
                      </span>
                      <span style={styles.metaText}>
                        Submitted{" "}
                        {formatDate(
                          request.createdAt
                        )}
                      </span>
                    </div>
                  </div>

                  <strong
                    style={getStatusBadgeStyle(
                      request.status
                    )}
                  >
                    {request.status}
                  </strong>
                </div>

                <div style={styles.infoGrid}>
                  <Info
                    label="Destination"
                    value={
                      request.destination
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
                    value={formatDate(
                      request.endDate
                    )}
                  />

                  <Info
                    label="Travelers"
                    value={
                      request.travelers
                    }
                  />

                  <Info
                    label="Transportation"
                    value={
                      request.transportation
                    }
                  />

                  <Info
                    label="Budget"
                    value={`$${Number(
                      request.budget || 0
                    ).toFixed(2)}`}
                  />
                </div>

                <section
                  style={{
                    ...pageTheme.softSurface,
                    marginTop: 14,
                  }}
                >
                  <div style={styles.replyHeader}>
                    <strong style={styles.boxLabel}>
                      Edit request
                    </strong>
                    <span style={styles.replyCount}>
                      Organizer can update trip details before or after approval.
                    </span>
                  </div>

                  <div style={styles.editorGrid}>
                    <label style={pageTheme.field}>
                      <span>Title</span>
                      <input
                        value={form.title}
                        onChange={(event) =>
                          handleEditChange(
                            id,
                            "title",
                            event.target.value
                          )
                        }
                        disabled={busy}
                        style={pageTheme.control}
                      />
                    </label>

                    <label style={pageTheme.field}>
                      <span>Destination</span>
                      <input
                        value={
                          form.destination
                        }
                        onChange={(event) =>
                          handleEditChange(
                            id,
                            "destination",
                            event.target.value
                          )
                        }
                        disabled={busy}
                        style={pageTheme.control}
                      />
                    </label>

                    <label style={pageTheme.field}>
                      <span>Start date</span>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(event) =>
                          handleEditChange(
                            id,
                            "startDate",
                            event.target.value
                          )
                        }
                        disabled={busy}
                        style={pageTheme.control}
                      />
                    </label>

                    <label style={pageTheme.field}>
                      <span>End date</span>
                      <input
                        type="date"
                        min={form.startDate}
                        value={form.endDate}
                        onChange={(event) =>
                          handleEditChange(
                            id,
                            "endDate",
                            event.target.value
                          )
                        }
                        disabled={busy}
                        style={pageTheme.control}
                      />
                    </label>

                    <label style={pageTheme.field}>
                      <span>Transportation</span>
                      <select
                        value={
                          form.transportation
                        }
                        onChange={(event) =>
                          handleEditChange(
                            id,
                            "transportation",
                            event.target.value
                          )
                        }
                        disabled={busy}
                        style={pageTheme.control}
                      >
                        <option value="Car">
                          Car
                        </option>
                        <option value="Van">
                          Van
                        </option>
                        <option value="Minibus">
                          Minibus
                        </option>
                        <option value="Bus">
                          Bus
                        </option>
                      </select>
                    </label>

                    <label style={pageTheme.field}>
                      <span>Travelers</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={form.travelers}
                        onChange={(event) =>
                          handleEditChange(
                            id,
                            "travelers",
                            event.target.value
                          )
                        }
                        disabled={busy}
                        style={pageTheme.control}
                      />
                    </label>

                    <label style={pageTheme.field}>
                      <span>Budget</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.budget}
                        onChange={(event) =>
                          handleEditChange(
                            id,
                            "budget",
                            event.target.value
                          )
                        }
                        disabled={busy}
                        style={pageTheme.control}
                      />
                    </label>
                  </div>

                  <label style={pageTheme.field}>
                    <span>Notes</span>
                    <textarea
                      value={form.notes}
                      onChange={(event) =>
                        handleEditChange(
                          id,
                          "notes",
                          event.target.value
                        )
                      }
                      disabled={busy}
                      maxLength={800}
                      style={{
                        ...pageTheme.control,
                        ...pageTheme.textarea,
                      }}
                    />
                  </label>

                  <div style={styles.editorActions}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        saveRequestEdits(id)
                      }
                      style={{
                        ...pageTheme.buttonSecondary,
                        opacity: busy ? 0.7 : 1,
                        cursor: busy
                          ? "not-allowed"
                          : "pointer",
                      }}
                    >
                      {savingEdit
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                </section>

                <section
                  style={{
                    ...pageTheme.softSurface,
                    marginTop: 14,
                  }}
                >
                  <strong style={styles.boxLabel}>
                    Client notes
                  </strong>

                  <p style={styles.boxText}>
                    {request.notes ||
                      "No notes supplied."}
                  </p>
                </section>

                {request.organizerReply && (
                  <section
                    style={{
                      ...pageTheme.softSurface,
                      marginTop: 14,
                    }}
                  >
                    <strong
                      style={styles.boxLabel}
                    >
                      Current organizer reply
                    </strong>

                    <p style={styles.boxText}>
                      {
                        request.organizerReply
                      }
                    </p>
                  </section>
                )}

                {approvedTripId ? (
                  <section
                    style={{
                      ...pageTheme.softSurface,
                      marginTop: 14,
                    }}
                  >
                    <div style={styles.tripSyncRow}>
                      <div>
                        <strong
                          style={styles.boxLabel}
                        >
                          Trip created
                        </strong>
                        <p style={styles.boxText}>
                          This approved request is now stored in the trips collection and appears in the trips list.
                        </p>
                      </div>

                      <Link
                        to={`/trips/${approvedTripId}`}
                        style={
                          pageTheme.buttonSecondary
                        }
                      >
                        View Trip
                      </Link>
                    </div>
                  </section>
                ) : null}

                <section
                  style={{
                    ...pageTheme.softSurface,
                    marginTop: 14,
                  }}
                >
                  <div style={styles.replyHeader}>
                    <strong style={styles.boxLabel}>
                      Result message
                    </strong>
                    <span style={styles.replyCount}>
                      {(replyText[id] || "").length}
                      /1000
                    </span>
                  </div>

                  <textarea
                    value={
                      replyText[id] || ""
                    }
                    onChange={(event) =>
                      setReplyText(
                        (current) => ({
                          ...current,
                          [id]:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="Write the result message..."
                    maxLength={1000}
                    disabled={busy}
                    style={{
                      ...pageTheme.control,
                      ...styles.textarea,
                    }}
                  />

                  <p style={styles.replyHint}>
                    The organizer reply is saved when you approve, reject, or reset the request.
                  </p>
                </section>

                <div style={styles.actions}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      updateStatus(
                        id,
                        "APPROVED"
                      )
                    }
                    style={{
                      ...pageTheme.buttonSuccess,
                      opacity: busy ? 0.7 : 1,
                      cursor: busy
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      updateStatus(
                        id,
                        "REJECTED"
                      )
                    }
                    style={{
                      ...pageTheme.buttonDanger,
                      opacity: busy ? 0.7 : 1,
                      cursor: busy
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      updateStatus(
                        id,
                        "PENDING"
                      )
                    }
                    style={{
                      ...pageTheme.buttonWarning,
                      opacity: busy ? 0.7 : 1,
                      cursor: busy
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    Reset to Pending
                  </button>
                </div>

                <OrganizerChat
                  requestId={id}
                  refreshToken={
                    request.updatedAt ||
                    request.reviewedAt ||
                    request.status
                  }
                />
              </article>
            );
          })}
        </div>
      )}
    </PublicPageLayout>
  );
}

function OrganizerChat({
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

  async function sendMessage(event) {
    event.preventDefault();

    const cleanText = text.trim();

    if (!cleanText || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const data =
        await sendOrganizerTripMessage(
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
        Conversation
      </h3>

      {error && (
        <div style={pageTheme.errorBox}>
          {error}
        </div>
      )}

      <div style={styles.messages}>
        {loading ? (
          <div style={styles.chatEmpty}>
            Loading conversation...
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
                  message.sender ===
                  "organizer"
                    ? "auto"
                    : 0,
                background:
                  message.sender ===
                  "organizer"
                    ? "rgba(191, 219, 254, 0.72)"
                    : "rgba(255, 255, 255, 0.88)",
              }}
            >
              <strong>
                {message.sender ===
                "organizer"
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
          ))
        )}
      </div>

      <form
        onSubmit={sendMessage}
        style={styles.chatForm}
      >
        <input
          value={text}
          onChange={(event) =>
            setText(event.target.value)
          }
          placeholder="Message the client..."
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
          Send
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

const styles = {
  headerCard: {
    minWidth: 170,
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
    lineHeight: 1.5,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  statistics: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 12,
    margin: "24px 0",
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
    gap: 24,
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

  editorGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 12,
    marginBottom: 10,
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

  textarea: {
    width: "100%",
    minHeight: 100,
    boxSizing: "border-box",
    resize: "vertical",
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },

  editorActions: {
    display: "flex",
    justifyContent: "flex-end",
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

  replyHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  replyCount: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 800,
  },

  replyHint: {
    margin: "10px 0 0",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.6,
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
    margin: "8px 0 0",
    color: "#334155",
  },

  messageTime: {
    display: "block",
    marginTop: 8,
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
    marginTop: 12,
  },
};

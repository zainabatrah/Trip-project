import {
  useEffect,
  useState,
} from "react";
import {
  getPrivateTripMessages,
  sendOrganizerTripMessage,
} from "../api/privateTripRequests.js";

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

const styles = {
  chatBox: {
    display: "grid",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    background: "rgba(255, 255, 255, 0.78)",
    border: "1px solid rgba(147, 197, 253, 0.4)",
  },

  chatTitle: {
    margin: 0,
    color: "#1e3a8a",
    fontSize: 18,
    fontWeight: 900,
  },

  messages: {
    display: "grid",
    gap: 10,
    maxHeight: 260,
    overflowY: "auto",
  },

  emptyChat: {
    padding: 12,
    borderRadius: 12,
    color: "#64748b",
    background: "rgba(255, 255, 255, 0.68)",
  },

  messageRow: {
    display: "flex",
  },

  bubble: {
    width: "fit-content",
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(147, 197, 253, 0.32)",
  },

  organizerBubble: {
    background: "rgba(191, 219, 254, 0.72)",
  },

  clientBubble: {
    background: "rgba(255, 255, 255, 0.88)",
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

  chatError: {
    padding: "11px 12px",
    borderRadius: 12,
    background: "rgba(248, 113, 113, 0.14)",
    border: "1px solid rgba(248, 113, 113, 0.35)",
    color: "#dc2626",
    fontSize: 14,
    fontWeight: 700,
  },

  chatForm: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },

  chatInput: {
    flex: "1 1 280px",
    minWidth: 0,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #bfdbfe",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#0f172a",
    outline: "none",
    font: "inherit",
    boxSizing: "border-box",
  },

  sendBtn: {
    padding: "12px 16px",
    borderRadius: 14,
    border: "none",
    background:
      "linear-gradient(135deg, #93c5fd, #a78bfa)",
    color: "#0f172a",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow:
      "0 12px 28px rgba(96, 165, 250, 0.35)",
  },
};

export default function RequestChat({
  requestId,
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] =
    useState(true);
  const [sending, setSending] =
    useState(false);
  const [chatError, setChatError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      try {
        setLoadingMessages(true);
        setChatError("");

        const data =
          await getPrivateTripMessages(
            requestId
          );

        const receivedMessages = Array.isArray(
          data
        )
          ? data
          : Array.isArray(data?.messages)
            ? data.messages
            : [];

        if (!cancelled) {
          setMessages(receivedMessages);
        }
      } catch (error) {
        if (!cancelled) {
          setChatError(
            error.message ||
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

      const newMessage =
        data?.message || data;

      setMessages((oldMessages) => [
        ...oldMessages,
        newMessage,
      ]);

      setText("");
    } catch (error) {
      setChatError(
        error.message ||
          "Could not send message."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={styles.chatBox}>
      <h3 style={styles.chatTitle}>Client Chat</h3>

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
              message.sender ===
              "organizer";

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

                  <small
                    style={styles.messageTime}
                  >
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
            opacity:
              sending || !text.trim()
                ? 0.6
                : 1,
          }}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

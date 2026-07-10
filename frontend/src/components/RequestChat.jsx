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
      } catch (error) {
        if (!cancelled) {
          setChatError(
            error.message || "Could not load messages."
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

      const data = await sendOrganizerTripMessage(
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
    } catch (error) {
      console.error(
        "Organizer message failed:",
        error
      );

      setChatError(
        error.message || "Could not send message."
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
              sending || !text.trim() ? 0.6 : 1,
          }}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
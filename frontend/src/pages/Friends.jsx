import {
  useEffect,
  useState,
} from "react";
import {
  FaCheck,
  FaPaperPlane,
  FaSearch,
  FaTimes,
  FaUserFriends,
  FaUserPlus,
} from "react-icons/fa";

import ProfileAreaLayout from "../components/ProfileAreaLayout.jsx";
import {
  pageTheme,
} from "../components/publicPageTheme.js";
import {
  getUserAvatarUrl,
} from "../components/social/socialHelpers.js";
import {
  getFriendsHub,
  removeFriendship,
  respondToFriendRequest,
  sendFriendRequest,
} from "../api/social.js";

export default function Friends() {
  const [hub, setHub] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");
  const [search, setSearch] =
    useState("");
  const [busyId, setBusyId] =
    useState("");

  async function loadHub(
    searchValue = search
  ) {
    try {
      setLoading(true);
      setError("");

      const data =
        await getFriendsHub(
          searchValue
        );

      setHub(data);
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not load the friends page."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHub("");
  }, []);

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timeoutId =
      window.setTimeout(() => {
        setSuccess("");
      }, 3000);

    return () => {
      window.clearTimeout(
        timeoutId
      );
    };
  }, [success]);

  const summary =
    hub?.summary || {};
  const directory =
    hub?.directory || [];
  const friends =
    hub?.friends || [];
  const incomingRequests =
    hub?.incomingRequests || [];
  const outgoingRequests =
    hub?.outgoingRequests || [];

  async function handleSendRequest(
    recipientId
  ) {
    try {
      setBusyId(recipientId);
      setError("");
      setSuccess("");

      const data =
        await sendFriendRequest(
          recipientId
        );

      setSuccess(
        data.message ||
          "Friend request sent."
      );
      await loadHub();
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not send the request."
      );
    } finally {
      setBusyId("");
    }
  }

  async function handleRespond(
    friendshipId,
    action
  ) {
    try {
      setBusyId(friendshipId);
      setError("");
      setSuccess("");

      const data =
        await respondToFriendRequest(
          friendshipId,
          action
        );

      setSuccess(
        data.message ||
          "Request updated."
      );
      await loadHub();
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not update the request."
      );
    } finally {
      setBusyId("");
    }
  }

  async function handleRemove(
    friendshipId
  ) {
    const confirmed =
      window.confirm(
        "Remove this connection?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setBusyId(friendshipId);
      setError("");
      setSuccess("");

      const data =
        await removeFriendship(
          friendshipId
        );

      setSuccess(
        data.message ||
          "Connection removed."
      );
      await loadHub();
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not update the connection."
      );
    } finally {
      setBusyId("");
    }
  }

  function handleSearchSubmit(
    event
  ) {
    event.preventDefault();
    loadHub(search);
  }

  return (
    <ProfileAreaLayout
      eyebrow="Community"
      title="Friends"
      subtitle="Add travel friends, review requests, and manage your private community with a clean Facebook-style workflow."
      headerAction={
        <div style={styles.headerCard}>
          <strong style={styles.headerValue}>
            {summary.friends || 0}
          </strong>
          <span style={styles.headerLabel}>
            total friends
          </span>
        </div>
      }
    >
      {error ? (
        <div style={pageTheme.errorBox}>
          {error}
        </div>
      ) : null}

      {success ? (
        <div style={pageTheme.successBox}>
          {success}
        </div>
      ) : null}

      <section style={styles.summaryGrid}>
        <SummaryCard
          icon={<FaUserFriends />}
          label="Friends"
          value={summary.friends || 0}
        />
        <SummaryCard
          icon={<FaCheck />}
          label="Incoming"
          value={
            summary.incomingRequests ||
            0
          }
        />
        <SummaryCard
          icon={<FaPaperPlane />}
          label="Sent"
          value={
            summary.outgoingRequests ||
            0
          }
        />
      </section>

      <section style={pageTheme.surface}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>
              Find People
            </h3>
            <p style={styles.sectionText}>
              Search users by name, email, or country and send friend requests directly.
            </p>
          </div>
        </div>

        <form
          onSubmit={
            handleSearchSubmit
          }
          style={styles.searchForm}
        >
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search travelers"
            style={pageTheme.control}
          />

          <button
            type="submit"
            style={pageTheme.buttonPrimary}
          >
            <FaSearch />
            {" "}
            Search
          </button>
        </form>

        {loading ? (
          <div style={pageTheme.emptyBox}>
            Loading people...
          </div>
        ) : directory.length === 0 ? (
          <div style={pageTheme.emptyBox}>
            No users match your search.
          </div>
        ) : (
          <div style={styles.directoryGrid}>
            {directory.map((entry) => (
              <article
                key={entry.user._id}
                style={styles.directoryCard}
              >
                <img
                  src={getUserAvatarUrl(
                    entry.user
                  )}
                  alt={
                    entry.user.fullName
                  }
                  style={styles.directoryAvatar}
                />

                <div style={styles.directoryText}>
                  <strong
                    style={
                      styles.directoryName
                    }
                  >
                    {entry.user.fullName}
                  </strong>
                  <span
                    style={
                      styles.directoryCountry
                    }
                  >
                    {entry.user.country ||
                      "Traveler"}
                  </span>
                  <p style={styles.directoryBio}>
                    {entry.user.bio ||
                      "No bio added yet."}
                  </p>
                </div>

                <div style={styles.directoryActions}>
                  {entry.relationshipStatus ===
                  "none" ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleSendRequest(
                          entry.user._id
                        )
                      }
                      disabled={
                        busyId ===
                        entry.user._id
                      }
                      style={pageTheme.buttonPrimary}
                    >
                      <FaUserPlus />
                      {" "}
                      Add Friend
                    </button>
                  ) : entry.relationshipStatus ===
                    "incoming" ? (
                    <div style={styles.inlineButtons}>
                      <button
                        type="button"
                        onClick={() =>
                          handleRespond(
                            entry.friendshipId,
                            "accept"
                          )
                        }
                        disabled={
                          busyId ===
                          entry.friendshipId
                        }
                        style={pageTheme.buttonSuccess}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleRespond(
                            entry.friendshipId,
                            "reject"
                          )
                        }
                        disabled={
                          busyId ===
                          entry.friendshipId
                        }
                        style={pageTheme.buttonDanger}
                      >
                        Reject
                      </button>
                    </div>
                  ) : entry.relationshipStatus ===
                    "outgoing" ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(
                          entry.friendshipId
                        )
                      }
                      disabled={
                        busyId ===
                        entry.friendshipId
                      }
                      style={pageTheme.buttonSecondary}
                    >
                      Requested
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(
                          entry.friendshipId
                        )
                      }
                      disabled={
                        busyId ===
                        entry.friendshipId
                      }
                      style={pageTheme.buttonSecondary}
                    >
                      Friends
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div style={styles.lowerGrid}>
        <section style={pageTheme.surface}>
          <div style={styles.sectionHeader}>
            <div>
              <h3 style={styles.sectionTitle}>
                Incoming Requests
              </h3>
              <p style={styles.sectionText}>
                Accept or reject requests from other users.
              </p>
            </div>
          </div>

          {incomingRequests.length === 0 ? (
            <div style={pageTheme.emptyBox}>
              No incoming requests right now.
            </div>
          ) : (
            <div style={styles.listStack}>
              {incomingRequests.map(
                (request) => (
                  <FriendshipRow
                    key={request._id}
                    item={request}
                    busy={
                      busyId ===
                      request._id
                    }
                    actions={
                      <div
                        style={
                          styles.inlineButtons
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleRespond(
                              request._id,
                              "accept"
                            )
                          }
                          disabled={
                            busyId ===
                            request._id
                          }
                          style={
                            pageTheme.buttonSuccess
                          }
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRespond(
                              request._id,
                              "reject"
                            )
                          }
                          disabled={
                            busyId ===
                            request._id
                          }
                          style={
                            pageTheme.buttonDanger
                          }
                        >
                          Reject
                        </button>
                      </div>
                    }
                  />
                )
              )}
            </div>
          )}
        </section>

        <section style={pageTheme.surface}>
          <div style={styles.sectionHeader}>
            <div>
              <h3 style={styles.sectionTitle}>
                Sent Requests
              </h3>
              <p style={styles.sectionText}>
                Requests you have already sent and can still cancel.
              </p>
            </div>
          </div>

          {outgoingRequests.length === 0 ? (
            <div style={pageTheme.emptyBox}>
              No pending sent requests.
            </div>
          ) : (
            <div style={styles.listStack}>
              {outgoingRequests.map(
                (request) => (
                  <FriendshipRow
                    key={request._id}
                    item={request}
                    busy={
                      busyId ===
                      request._id
                    }
                    actions={
                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(
                            request._id
                          )
                        }
                        disabled={
                          busyId ===
                          request._id
                        }
                        style={
                          pageTheme.buttonSecondary
                        }
                      >
                        Cancel
                      </button>
                    }
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>

      <section
        style={{
          ...pageTheme.surface,
          marginTop: 20,
        }}
      >
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>
              Your Friends
            </h3>
            <p style={styles.sectionText}>
              Accepted connections appear here with quick remove controls.
            </p>
          </div>
        </div>

        {friends.length === 0 ? (
          <div style={pageTheme.emptyBox}>
            You do not have friends yet.
          </div>
        ) : (
          <div style={styles.friendsGrid}>
            {friends.map((friend) => (
              <article
                key={friend._id}
                style={styles.friendCard}
              >
                <img
                  src={getUserAvatarUrl(
                    friend.user
                  )}
                  alt={
                    friend.user.fullName
                  }
                  style={styles.friendAvatar}
                />
                <strong
                  style={styles.friendName}
                >
                  {friend.user.fullName}
                </strong>
                <span
                  style={styles.friendCountry}
                >
                  {friend.user.country ||
                    "Traveler"}
                </span>
                <p style={styles.friendBio}>
                  {friend.user.bio ||
                    "No bio added yet."}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    handleRemove(
                      friend._id
                    )
                  }
                  disabled={
                    busyId === friend._id
                  }
                  style={pageTheme.buttonSecondary}
                >
                  <FaTimes />
                  {" "}
                  Remove
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </ProfileAreaLayout>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}) {
  return (
    <div style={styles.summaryCard}>
      <div style={styles.summaryIcon}>
        {icon}
      </div>
      <strong style={styles.summaryValue}>
        {value}
      </strong>
      <span style={styles.summaryLabel}>
        {label}
      </span>
    </div>
  );
}

function FriendshipRow({
  item,
  actions,
}) {
  return (
    <article style={styles.rowCard}>
      <div style={styles.rowUser}>
        <img
          src={getUserAvatarUrl(
            item.user
          )}
          alt={item.user.fullName}
          style={styles.rowAvatar}
        />
        <div>
          <strong style={styles.rowName}>
            {item.user.fullName}
          </strong>
          <div style={styles.rowCountry}>
            {item.user.country ||
              "Traveler"}
          </div>
          <p style={styles.rowBio}>
            {item.user.bio ||
              "No bio added yet."}
          </p>
        </div>
      </div>

      <div>{actions}</div>
    </article>
  );
}

const styles = {
  headerCard: {
    minWidth: 170,
    padding: "18px 20px",
    borderRadius: 18,
    background:
      "rgba(255, 255, 255, 0.78)",
    border:
      "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow:
      "0 16px 34px rgba(96, 165, 250, 0.16)",
    display: "grid",
    gap: 4,
    textAlign: "center",
  },

  headerValue: {
    fontSize: 30,
    color: "#1e3a8a",
  },

  headerLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    marginBottom: 20,
  },

  summaryCard: {
    padding: 18,
    borderRadius: 20,
    background:
      "rgba(255, 255, 255, 0.78)",
    border:
      "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow:
      "0 18px 32px rgba(96, 165, 250, 0.12)",
    display: "grid",
    gap: 6,
  },

  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background:
      "rgba(191, 219, 254, 0.72)",
    color: "#1d4ed8",
  },

  summaryValue: {
    fontSize: 28,
    color: "#0f172a",
  },

  summaryLabel: {
    color: "#64748b",
    fontWeight: 800,
  },

  sectionHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: 14,
  },

  sectionTitle: {
    margin: 0,
    color: "#1e3a8a",
    fontSize: 22,
    fontWeight: 900,
  },

  sectionText: {
    margin: "6px 0 0",
    color: "#475569",
    lineHeight: 1.7,
  },

  searchForm: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) auto",
    gap: 12,
    marginBottom: 18,
  },

  directoryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 14,
  },

  directoryCard: {
    padding: 18,
    borderRadius: 20,
    background:
      "rgba(255, 255, 255, 0.76)",
    border:
      "1px solid rgba(191, 219, 254, 0.78)",
    display: "grid",
    gap: 14,
  },

  directoryAvatar: {
    width: 78,
    height: 78,
    borderRadius: 24,
    objectFit: "cover",
  },

  directoryText: {
    minWidth: 0,
  },

  directoryName: {
    display: "block",
    color: "#1e3a8a",
    fontSize: 18,
  },

  directoryCountry: {
    display: "block",
    marginTop: 4,
    color: "#64748b",
    fontWeight: 700,
  },

  directoryBio: {
    margin: "10px 0 0",
    color: "#475569",
    lineHeight: 1.65,
  },

  directoryActions: {
    marginTop: "auto",
  },

  inlineButtons: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  lowerGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: 18,
    marginTop: 20,
  },

  listStack: {
    display: "grid",
    gap: 12,
  },

  rowCard: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 14,
    alignItems: "flex-start",
    flexWrap: "wrap",
    padding: 16,
    borderRadius: 18,
    background:
      "rgba(255, 255, 255, 0.78)",
    border:
      "1px solid rgba(191, 219, 254, 0.76)",
  },

  rowUser: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },

  rowAvatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    objectFit: "cover",
    flexShrink: 0,
  },

  rowName: {
    display: "block",
    color: "#1e3a8a",
  },

  rowCountry: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
  },

  rowBio: {
    margin: "8px 0 0",
    color: "#475569",
    lineHeight: 1.6,
  },

  friendsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },

  friendCard: {
    padding: 18,
    borderRadius: 20,
    background:
      "rgba(255, 255, 255, 0.76)",
    border:
      "1px solid rgba(191, 219, 254, 0.76)",
    display: "grid",
    justifyItems: "center",
    textAlign: "center",
    gap: 10,
  },

  friendAvatar: {
    width: 86,
    height: 86,
    borderRadius: 26,
    objectFit: "cover",
  },

  friendName: {
    color: "#1e3a8a",
    fontSize: 18,
  },

  friendCountry: {
    color: "#64748b",
    fontWeight: 700,
  },

  friendBio: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
  },
};

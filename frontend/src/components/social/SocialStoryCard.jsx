import { FaTrashAlt } from "react-icons/fa";

import {
  formatStoryTimeLeft,
  getContentImageUrl,
  getUserAvatarUrl,
  getUserInitial,
} from "./socialHelpers.js";

export default function SocialStoryCard({
  story,
  currentUserId = "",
  onDelete,
  compact = false,
  busyDelete = false,
}) {
  const image = getContentImageUrl(
    story?.image
  );
  const isOwnStory =
    String(
      story?.author?._id || ""
    ) === String(currentUserId);

  return (
    <article
      style={{
        ...styles.card,
        minHeight: compact ? 200 : 250,
        backgroundImage: image
          ? `linear-gradient(180deg, rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.72)), url("${image}")`
          : styles.card.backgroundImage,
      }}
    >
      <div style={styles.top}>
        <div style={styles.userRow}>
          <div style={styles.avatarWrap}>
            {story?.author?.profileImage ? (
              <img
                src={getUserAvatarUrl(
                  story.author
                )}
                alt={
                  story.author?.fullName ||
                  "User"
                }
                style={styles.avatar}
              />
            ) : (
              <span
                style={styles.initial}
              >
                {getUserInitial(
                  story?.author
                )}
              </span>
            )}
          </div>

          <div>
            <strong style={styles.author}>
              {story?.author?.fullName ||
                "Traveler"}
            </strong>
            <div style={styles.timeText}>
              {formatStoryTimeLeft(
                story?.expiresAt
              )}
            </div>
          </div>
        </div>

        {isOwnStory && onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(story)}
            disabled={busyDelete}
            style={styles.deleteButton}
          >
            <FaTrashAlt />
          </button>
        ) : null}
      </div>

      <div style={styles.bottom}>
        <p style={styles.content}>
          {story?.content ||
            "Shared a visual moment."}
        </p>
      </div>
    </article>
  );
}

const styles = {
  card: {
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 22,
    color: "#ffffff",
    backgroundImage:
      "linear-gradient(145deg, rgba(37, 99, 235, 0.82), rgba(139, 92, 246, 0.82), rgba(14, 165, 233, 0.75))",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow:
      "0 18px 40px rgba(59, 130, 246, 0.2)",
  },

  top: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },

  userRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    overflow: "hidden",
    background:
      "rgba(255, 255, 255, 0.16)",
    border:
      "1px solid rgba(255, 255, 255, 0.28)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  avatar: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  initial: {
    fontWeight: 900,
    fontSize: 16,
  },

  author: {
    display: "block",
  },

  timeText: {
    fontSize: 12,
    opacity: 0.86,
    marginTop: 2,
  },

  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    border:
      "1px solid rgba(255, 255, 255, 0.2)",
    background:
      "rgba(15, 23, 42, 0.22)",
    color: "#ffffff",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    flexShrink: 0,
  },

  bottom: {
    marginTop: 26,
  },

  content: {
    margin: 0,
    lineHeight: 1.7,
    fontWeight: 700,
  },
};

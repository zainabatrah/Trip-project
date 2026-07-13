import { FaHeart, FaRegHeart, FaTrashAlt } from "react-icons/fa";

import {
  formatRelativeTime,
  getContentImageUrl,
  getUserAvatarUrl,
  getUserInitial,
} from "./socialHelpers.js";

export default function SocialPostCard({
  post,
  currentUserId = "",
  onLike,
  onDelete,
  busyLike = false,
  busyDelete = false,
  compact = false,
}) {
  const isOwnPost =
    String(
      post?.author?._id || ""
    ) === String(currentUserId);

  const image = getContentImageUrl(
    post?.image
  );

  return (
    <article
      style={{
        ...styles.card,
        padding: compact ? 18 : 22,
      }}
    >
      <div style={styles.header}>
        <div style={styles.authorRow}>
          <div style={styles.avatarWrap}>
            {post?.author?.profileImage ? (
              <img
                src={getUserAvatarUrl(
                  post.author
                )}
                alt={
                  post.author?.fullName ||
                  "User"
                }
                style={styles.avatar}
              />
            ) : (
              <span
                style={styles.initial}
              >
                {getUserInitial(
                  post?.author
                )}
              </span>
            )}
          </div>

          <div>
            <strong
              style={styles.authorName}
            >
              {post?.author?.fullName ||
                "Traveler"}
            </strong>
            <div style={styles.meta}>
              {formatRelativeTime(
                post?.createdAt
              )}
            </div>
          </div>
        </div>

        {isOwnPost && onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(post)}
            disabled={busyDelete}
            style={styles.iconButton}
          >
            <FaTrashAlt />
          </button>
        ) : null}
      </div>

      {post?.content ? (
        <p style={styles.content}>
          {post.content}
        </p>
      ) : null}

      {image ? (
        <img
          src={image}
          alt="Post"
          style={styles.image}
        />
      ) : null}

      <div style={styles.footer}>
        <button
          type="button"
          onClick={() => onLike?.(post)}
          disabled={busyLike}
          style={{
            ...styles.likeButton,
            color: post?.likedByCurrentUser
              ? "#dc2626"
              : "#1e3a8a",
          }}
        >
          {post?.likedByCurrentUser ? (
            <FaHeart />
          ) : (
            <FaRegHeart />
          )}
          <span>
            {post?.likeCount || 0} likes
          </span>
        </button>

        <span style={styles.footerText}>
          Shared with friends
        </span>
      </div>
    </article>
  );
}

const styles = {
  card: {
    borderRadius: 22,
    background: "rgba(255, 255, 255, 0.78)",
    border: "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow: "0 20px 44px rgba(96, 165, 250, 0.14)",
    display: "grid",
    gap: 14,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },

  authorRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },

  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: "hidden",
    background: "rgba(191, 219, 254, 0.7)",
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
    color: "#1d4ed8",
    fontWeight: 900,
    fontSize: 18,
  },

  authorName: {
    display: "block",
    color: "#0f172a",
  },

  meta: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(248, 113, 113, 0.3)",
    background: "rgba(254, 226, 226, 0.7)",
    color: "#dc2626",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  content: {
    margin: 0,
    color: "#334155",
    lineHeight: 1.75,
  },

  image: {
    width: "100%",
    maxHeight: 380,
    borderRadius: 18,
    objectFit: "cover",
    border: "1px solid rgba(191, 219, 254, 0.62)",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
    paddingTop: 8,
    borderTop: "1px solid rgba(191, 219, 254, 0.5)",
  },

  likeButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: 800,
    padding: 0,
  },

  footerText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
  },
};

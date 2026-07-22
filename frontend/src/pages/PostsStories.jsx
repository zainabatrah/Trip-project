import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  FaImages,
  FaPaperPlane,
  FaPlus,
  FaUserFriends,
} from "react-icons/fa";

import ProfileAreaLayout from "../components/ProfileAreaLayout.jsx";
import {
  pageTheme,
} from "../components/publicPageTheme.js";
import {
  createAutoFitMinmax,
  useCompactLayout,
} from "../utils/responsive.js";
import SocialPostCard from "../components/social/SocialPostCard.jsx";
import SocialStoryCard from "../components/social/SocialStoryCard.jsx";
import {
  getUserAvatarUrl,
} from "../components/social/socialHelpers.js";
import {
  createSocialPost,
  createSocialStory,
  deleteSocialPost,
  deleteSocialStory,
  getSocialFeed,
  toggleSocialPostLike,
} from "../api/social.js";

export default function PostsStories() {
  const isCompact =
    useCompactLayout();
  const [feed, setFeed] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");
  const [postContent, setPostContent] =
    useState("");
  const [storyContent, setStoryContent] =
    useState("");
  const [postImageFile, setPostImageFile] =
    useState(null);
  const [storyImageFile, setStoryImageFile] =
    useState(null);
  const [postSaving, setPostSaving] =
    useState(false);
  const [storySaving, setStorySaving] =
    useState(false);
  const [busyLikeId, setBusyLikeId] =
    useState("");
  const [
    busyDeletePostId,
    setBusyDeletePostId,
  ] = useState("");
  const [
    busyDeleteStoryId,
    setBusyDeleteStoryId,
  ] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadInitialFeed() {
      try {
        const data =
          await getSocialFeed();

        if (!cancelled) {
          setFeed(data);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError?.message ||
              "Could not load posts and stories."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialFeed();

    return () => {
      cancelled = true;
    };
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

  const currentUser =
    feed?.currentUser || null;
  const stories =
    feed?.stories || [];
  const posts = feed?.posts || [];
  const statistics =
    feed?.statistics || {};

  async function handleCreatePost(
    event
  ) {
    event.preventDefault();

    if (postSaving) {
      return;
    }

    try {
      setPostSaving(true);
      setError("");
      setSuccess("");

      const data =
        await createSocialPost({
          content:
            postContent.trim(),
          imageFile:
            postImageFile,
        });

      setFeed((current) => ({
        ...current,
        posts: [
          data.post,
          ...(current?.posts || []),
        ],
        statistics: {
          ...(current?.statistics ||
            {}),
          postsInFeed:
            (current?.statistics
              ?.postsInFeed || 0) + 1,
        },
      }));
      setPostContent("");
      setPostImageFile(null);
      setSuccess(
        data.message ||
          "Post published."
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not create the post."
      );
    } finally {
      setPostSaving(false);
    }
  }

  async function handleCreateStory(
    event
  ) {
    event.preventDefault();

    if (storySaving) {
      return;
    }

    try {
      setStorySaving(true);
      setError("");
      setSuccess("");

      const data =
        await createSocialStory({
          content:
            storyContent.trim(),
          imageFile:
            storyImageFile,
        });

      setFeed((current) => ({
        ...current,
        stories: [
          data.story,
          ...(current?.stories || []),
        ],
        statistics: {
          ...(current?.statistics ||
            {}),
          activeStories:
            (current?.statistics
              ?.activeStories || 0) +
            1,
        },
      }));
      setStoryContent("");
      setStoryImageFile(null);
      setSuccess(
        data.message ||
          "Story shared."
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not create the story."
      );
    } finally {
      setStorySaving(false);
    }
  }

  async function handleToggleLike(
    post
  ) {
    if (
      busyLikeId ||
      !post?._id
    ) {
      return;
    }

    try {
      setBusyLikeId(post._id);

      const data =
        await toggleSocialPostLike(
          post._id
        );

      setFeed((current) => ({
        ...current,
        posts: (
          current?.posts || []
        ).map((item) =>
          item._id === post._id
            ? data.post
            : item
        ),
      }));
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not update the like."
      );
    } finally {
      setBusyLikeId("");
    }
  }

  async function handleDeletePost(
    post
  ) {
    if (!post?._id) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this post?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setBusyDeletePostId(
        post._id
      );

      const data =
        await deleteSocialPost(
          post._id
        );

      setFeed((current) => ({
        ...current,
        posts: (
          current?.posts || []
        ).filter(
          (item) =>
            item._id !== post._id
        ),
        statistics: {
          ...(current?.statistics ||
            {}),
          postsInFeed: Math.max(
            (
              current?.statistics
                ?.postsInFeed || 0
            ) - 1,
            0
          ),
        },
      }));
      setSuccess(
        data.message ||
          "Post deleted."
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not delete the post."
      );
    } finally {
      setBusyDeletePostId(
        ""
      );
    }
  }

  async function handleDeleteStory(
    story
  ) {
    if (!story?._id) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this story?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setBusyDeleteStoryId(
        story._id
      );

      const data =
        await deleteSocialStory(
          story._id
        );

      setFeed((current) => ({
        ...current,
        stories: (
          current?.stories || []
        ).filter(
          (item) =>
            item._id !== story._id
        ),
        statistics: {
          ...(current?.statistics ||
            {}),
          activeStories:
            Math.max(
              (
                current?.statistics
                  ?.activeStories ||
                0
              ) - 1,
              0
            ),
        },
      }));
      setSuccess(
        data.message ||
          "Story deleted."
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not delete the story."
      );
    } finally {
      setBusyDeleteStoryId(
        ""
      );
    }
  }

  return (
    <ProfileAreaLayout
      eyebrow="Friend Feed"
      title="Posts & Stories"
      subtitle="Create quick updates, publish visual stories, and follow travel moments shared by your accepted friends."
      headerAction={
        <div style={styles.headerCard}>
          <strong style={styles.headerValue}>
            {statistics.friends || 0}
          </strong>
          <span style={styles.headerLabel}>
            connected friends
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

      {loading ? (
        <div style={pageTheme.emptyBox}>
          Loading feed...
        </div>
      ) : (
        <>
          <section
            style={{
              ...styles.topGrid,
              ...(isCompact
                ? styles.topGridCompact
                : null),
            }}
          >
            <article style={styles.userCard}>
              <img
                src={getUserAvatarUrl(
                  currentUser
                )}
                alt={
                  currentUser?.fullName ||
                  "User"
                }
                style={styles.userAvatar}
              />
              <div>
                <span style={styles.userBadge}>
                  Your social feed
                </span>
                <h2 style={styles.userTitle}>
                  {currentUser?.fullName}
                </h2>
                <p style={styles.userText}>
                  Share posts like Facebook and drop visual moments like Instagram stories.
                </p>
              </div>
              <div style={styles.miniStats}>
                <MiniStat
                  icon={<FaImages />}
                  label="Posts"
                  value={
                    statistics.postsInFeed || 0
                  }
                />
                <MiniStat
                  icon={<FaPlus />}
                  label="Stories"
                  value={
                    statistics.activeStories || 0
                  }
                />
                <MiniStat
                  icon={<FaUserFriends />}
                  label="Friends"
                  value={
                    statistics.friends || 0
                  }
                />
              </div>
            </article>

            <article style={pageTheme.surface}>
              <div style={styles.composerHeader}>
                <div>
                  <h3 style={styles.sectionTitle}>
                    Create Post
                  </h3>
                  <p style={styles.sectionText}>
                    Publish a permanent update to your friend feed.
                  </p>
                </div>
              </div>

              <form
                onSubmit={
                  handleCreatePost
                }
                style={styles.formStack}
              >
                <textarea
                  value={postContent}
                  onChange={(event) =>
                    setPostContent(
                      event.target.value
                    )
                  }
                  placeholder="Share a travel update, memory, or plan..."
                  style={{
                    ...pageTheme.control,
                    ...pageTheme.textarea,
                    minHeight: 120,
                  }}
                />

                <label style={pageTheme.field}>
                  <span>Optional image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setPostImageFile(
                        event.target
                          .files?.[0] ||
                          null
                      )
                    }
                    style={pageTheme.control}
                  />
                </label>

                <button
                  type="submit"
                  disabled={postSaving}
                  style={pageTheme.buttonPrimary}
                >
                  <FaPaperPlane />
                  {" "}
                  {postSaving
                    ? "Publishing..."
                    : "Publish Post"}
                </button>
              </form>
            </article>

            <article style={pageTheme.surface}>
              <div style={styles.composerHeader}>
                <div>
                  <h3 style={styles.sectionTitle}>
                    Create Story
                  </h3>
                  <p style={styles.sectionText}>
                    Stories stay active for 24 hours and sit at the top of the feed.
                  </p>
                </div>
              </div>

              <form
                onSubmit={
                  handleCreateStory
                }
                style={styles.formStack}
              >
                <textarea
                  value={storyContent}
                  onChange={(event) =>
                    setStoryContent(
                      event.target.value
                    )
                  }
                  placeholder="A quick thought, view, or trip highlight..."
                  style={{
                    ...pageTheme.control,
                    ...pageTheme.textarea,
                    minHeight: 120,
                  }}
                />

                <label style={pageTheme.field}>
                  <span>Optional image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setStoryImageFile(
                        event.target
                          .files?.[0] ||
                          null
                      )
                    }
                    style={pageTheme.control}
                  />
                </label>

                <button
                  type="submit"
                  disabled={storySaving}
                  style={pageTheme.buttonSecondary}
                >
                  <FaPlus />
                  {" "}
                  {storySaving
                    ? "Sharing..."
                    : "Share Story"}
                </button>
              </form>
            </article>
          </section>

          <section
            style={{
              ...pageTheme.surface,
              marginTop: 20,
            }}
          >
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.sectionTitle}>
                  Stories
                </h3>
                <p style={styles.sectionText}>
                  Travel snapshots from your accepted friend circle.
                </p>
              </div>

              <Link
                to="/profile/friends"
                style={styles.inlineLink}
              >
                Grow your friend list
              </Link>
            </div>

            {stories.length === 0 ? (
              <div style={pageTheme.emptyBox}>
                No active stories yet. Add the first one.
              </div>
            ) : (
              <div style={styles.storyGrid}>
                {stories.map((story) => (
                  <SocialStoryCard
                    key={story._id}
                    story={story}
                    currentUserId={
                      currentUser?._id
                    }
                    onDelete={
                      handleDeleteStory
                    }
                    busyDelete={
                      busyDeleteStoryId ===
                      story._id
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <section
            style={{
              ...pageTheme.surface,
              marginTop: 20,
            }}
          >
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.sectionTitle}>
                  Friend Feed
                </h3>
                <p style={styles.sectionText}>
                  Posts from you and your accepted friends appear here in one clean stream.
                </p>
              </div>
            </div>

            {posts.length === 0 ? (
              <div style={pageTheme.emptyBox}>
                Your feed is empty. Publish a post or connect with friends.
              </div>
            ) : (
              <div style={styles.postList}>
                {posts.map((post) => (
                  <SocialPostCard
                    key={post._id}
                    post={post}
                    currentUserId={
                      currentUser?._id
                    }
                    onLike={
                      handleToggleLike
                    }
                    onDelete={
                      handleDeletePost
                    }
                    busyLike={
                      busyLikeId ===
                      post._id
                    }
                    busyDelete={
                      busyDeletePostId ===
                      post._id
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </ProfileAreaLayout>
  );
}

function MiniStat({
  icon,
  label,
  value,
}) {
  return (
    <div style={styles.miniStatCard}>
      <div style={styles.miniStatIcon}>
        {icon}
      </div>
      <strong>{value}</strong>
      <span style={styles.miniStatLabel}>
        {label}
      </span>
    </div>
  );
}

const styles = {
  headerCard: {
    minWidth: "min(100%, 170px)",
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

  topGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) repeat(2, minmax(290px, 0.7fr))",
    gap: 18,
    alignItems: "start",
  },

  topGridCompact: {
    gridTemplateColumns: "1fr",
  },

  userCard: {
    padding: 24,
    borderRadius: 26,
    background:
      "linear-gradient(145deg, rgba(255, 255, 255, 0.88), rgba(219, 234, 254, 0.74), rgba(191, 219, 254, 0.56))",
    border:
      "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow:
      "0 24px 60px rgba(59, 130, 246, 0.16)",
    display: "grid",
    gap: 18,
  },

  userAvatar: {
    width: 94,
    height: 94,
    borderRadius: 28,
    objectFit: "cover",
    border:
      "4px solid rgba(255, 255, 255, 0.82)",
    boxShadow:
      "0 12px 30px rgba(96, 165, 250, 0.2)",
  },

  userBadge: {
    display: "inline-flex",
    padding: "7px 12px",
    borderRadius: 999,
    background:
      "rgba(191, 219, 254, 0.6)",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  userTitle: {
    margin: "14px 0 6px",
    color: "#1e3a8a",
    fontSize: 30,
  },

  userText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.75,
    maxWidth: 520,
  },

  miniStats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },

  miniStatCard: {
    padding: 14,
    borderRadius: 18,
    background:
      "rgba(255, 255, 255, 0.74)",
    border:
      "1px solid rgba(191, 219, 254, 0.76)",
    display: "grid",
    gap: 6,
  },

  miniStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    background:
      "rgba(191, 219, 254, 0.72)",
    display: "grid",
    placeItems: "center",
    color: "#1d4ed8",
  },

  miniStatLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 800,
  },

  composerHeader: {
    marginBottom: 14,
  },

  formStack: {
    display: "grid",
    gap: 12,
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

  inlineLink: {
    color: "#1d4ed8",
    textDecoration: "none",
    fontWeight: 800,
  },

  storyGrid: {
    display: "grid",
    gridTemplateColumns:
      createAutoFitMinmax(210),
    gap: 14,
  },

  postList: {
    display: "grid",
    gap: 16,
  },
};

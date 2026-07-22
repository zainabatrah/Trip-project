import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  FaCamera,
  FaImages,
  FaLock,
  FaMapMarkerAlt,
  FaTrashAlt,
  FaUserFriends,
  FaUserShield,
} from "react-icons/fa";

import api from "../services/api.js";
import {
  logoutUser,
  syncStoredCurrentUser,
} from "../api/auth.js";
import {
  getSocialProfile,
} from "../api/social.js";
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

const emptyStatistics = {};

function createProfileForm(
  profile
) {
  return {
    fullName:
      profile?.fullName || "",
    country:
      profile?.country || "",
    bio: profile?.bio || "",
  };
}

export default function Profile() {
  const isCompact =
    useCompactLayout();
  const [dashboard, setDashboard] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");
  const [editOpen, setEditOpen] =
    useState(false);
  const [passwordOpen, setPasswordOpen] =
    useState(false);
  const [manageOpen, setManageOpen] =
    useState(false);
  const [profileSaving, setProfileSaving] =
    useState(false);
  const [passwordSaving, setPasswordSaving] =
    useState(false);
  const [preview, setPreview] =
    useState("");
  const [imageFile, setImageFile] =
    useState(null);
  const [formData, setFormData] =
    useState(
      createProfileForm(null)
    );
  const [passwordData, setPasswordData] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  const [message, setMessage] =
    useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getSocialProfile();

      setDashboard(data);
      setFormData(
        createProfileForm(
          data.profile
        )
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not load your profile."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialDashboard() {
      try {
        const data =
          await getSocialProfile();

        if (!cancelled) {
          setDashboard(data);
          setFormData(
            createProfileForm(
              data.profile
            )
          );
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError?.message ||
              "Could not load your profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId =
      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3500);

    return () => {
      window.clearTimeout(
        timeoutId
      );
    };
  }, [successMessage]);

  const profile =
    dashboard?.profile || null;
  const statistics =
    dashboard?.statistics ||
    emptyStatistics;
  const recentPosts =
    dashboard?.recentPosts || [];
  const activeStories =
    dashboard?.activeStories || [];
  const friendsPreview =
    dashboard?.friendsPreview || [];

  const heroStats = useMemo(
    () => [
      {
        label: "Posts",
        value:
          statistics.posts || 0,
      },
      {
        label: "Stories",
        value:
          statistics.activeStories || 0,
      },
      {
        label: "Friends",
        value:
          statistics.friends || 0,
      },
      {
        label: "Requests",
        value:
          statistics.pendingRequests ||
          0,
      },
    ],
    [statistics]
  );

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handlePasswordChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setPasswordData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleImageChange(
    event
  ) {
    const file =
      event.target.files?.[0] ||
      null;

    if (!file) {
      setImageFile(null);
      setPreview("");
      return;
    }

    setImageFile(file);
    setPreview(
      URL.createObjectURL(file)
    );
  }

  async function updateProfile() {
    if (
      !profile?._id ||
      profileSaving
    ) {
      return;
    }

    try {
      setProfileSaving(true);
      setMessage("");

      const data =
        new FormData();

      data.append(
        "fullName",
        formData.fullName
      );
      data.append(
        "country",
        formData.country
      );
      data.append(
        "bio",
        formData.bio
      );

      if (imageFile) {
        data.append(
          "profileImage",
          imageFile
        );
      }

      const response =
        await api.put(
          `/users/profile/${profile._id}`,
          data,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      const nextProfile =
        response.data;

      setDashboard((current) => ({
        ...current,
        profile: nextProfile,
      }));
      setFormData(
        createProfileForm(
          nextProfile
        )
      );
      syncStoredCurrentUser({
        ...profile,
        ...nextProfile,
      });
      setPreview("");
      setImageFile(null);
      setEditOpen(false);
      setSuccessMessage(
        "Profile updated successfully."
      );
    } catch (requestError) {
      setMessage(
        requestError?.response?.data
          ?.message ||
          requestError?.message ||
          "Could not update your profile."
      );
    } finally {
      setProfileSaving(false);
    }
  }

  async function changePassword() {
    if (
      !profile?._id ||
      passwordSaving
    ) {
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setMessage(
        "New passwords do not match."
      );
      return;
    }

    try {
      setPasswordSaving(true);
      setMessage("");

      const response =
        await api.put(
          `/users/change-password/${profile._id}`,
          {
            currentPassword:
              passwordData.currentPassword,
            newPassword:
              passwordData.newPassword,
          }
        );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordOpen(false);
      setSuccessMessage(
        response.data.message ||
          "Password changed successfully."
      );
    } catch (requestError) {
      setMessage(
        requestError?.response?.data
          ?.message ||
          requestError?.message ||
          "Password change failed."
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  async function deleteAccount() {
    if (!profile?._id) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete your account?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/users/${profile._id}`
      );

      logoutUser();
      window.location.href =
        "/login";
    } catch (requestError) {
      setMessage(
        requestError?.response?.data
          ?.message ||
          requestError?.message ||
          "Could not delete the account."
      );
    }
  }

  if (loading) {
    return (
      <ProfileAreaLayout
        eyebrow="Social Dashboard"
        title="Your Profile"
        subtitle="Loading your profile, stories, and travel community."
      >
        <div style={pageTheme.emptyBox}>
          Loading profile...
        </div>
      </ProfileAreaLayout>
    );
  }

  if (error) {
    return (
      <ProfileAreaLayout
        eyebrow="Social Dashboard"
        title="Your Profile"
        subtitle="We could not load your social profile right now."
      >
        <div style={pageTheme.errorBox}>
          {error}
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          style={pageTheme.buttonPrimary}
        >
          Try Again
        </button>
      </ProfileAreaLayout>
    );
  }

  return (
    <ProfileAreaLayout
      eyebrow="Social Dashboard"
      title="Your Profile"
      subtitle="A travel identity with stories, friend activity, and a personal feed that stays inside the project style."
      headerAction={
        <div style={styles.headerCard}>
          <strong style={styles.headerValue}>
            {statistics.friends || 0}
          </strong>
          <span style={styles.headerLabel}>
            friend connections
          </span>
        </div>
      }
    >
      {successMessage ? (
        <div style={pageTheme.successBox}>
          {successMessage}
        </div>
      ) : null}

      {message ? (
        <div style={pageTheme.errorBox}>
          {message}
        </div>
      ) : null}

      <section style={styles.heroCard}>
        <div
          style={{
            ...styles.heroMain,
            ...(isCompact
              ? styles.heroMainCompact
              : null),
          }}
        >
          <div style={styles.avatarShell}>
            <img
              src={
                preview ||
                getUserAvatarUrl(
                  profile
                )
              }
              alt={
                profile?.fullName ||
                "Profile"
              }
              style={styles.avatar}
            />

            <button
              type="button"
              onClick={() =>
                setEditOpen(true)
              }
              style={styles.cameraButton}
            >
              <FaCamera />
            </button>
          </div>

          <div style={styles.heroText}>
            <span style={styles.heroBadge}>
              Explorer Profile
            </span>

            <h2 style={styles.heroTitle}>
              {profile?.fullName}
            </h2>

            <p style={styles.heroEmail}>
              {profile?.email}
            </p>

            <div style={styles.metaRow}>
              <span style={styles.metaPill}>
                <FaMapMarkerAlt />
                {profile?.country ||
                  "Country not added"}
              </span>

              <span style={styles.metaPill}>
                Member since{" "}
                {new Date(
                  profile?.createdAt
                ).toLocaleDateString()}
              </span>
            </div>

            <p style={styles.heroBio}>
              {profile?.bio ||
                "Add a short bio so friends understand your travel style."}
            </p>
          </div>
        </div>

        <div style={styles.heroActions}>
          <button
            type="button"
            onClick={() =>
              setEditOpen(true)
            }
            style={pageTheme.buttonPrimary}
          >
            Edit Profile
          </button>

          <button
            type="button"
            onClick={() =>
              setPasswordOpen(true)
            }
            style={pageTheme.buttonSecondary}
          >
            <FaLock />
            {" "}
            Change Password
          </button>

          <button
            type="button"
            onClick={() =>
              setManageOpen(
                (current) =>
                  !current
              )
            }
            style={pageTheme.buttonSecondary}
          >
            <FaUserShield />
            {" "}
            Manage Account
          </button>
        </div>

        <div style={styles.statsGrid}>
          {heroStats.map((item) => (
            <div
              key={item.label}
              style={styles.statCard}
            >
              <strong
                style={styles.statValue}
              >
                {item.value}
              </strong>
              <span
                style={styles.statLabel}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.quickGrid}>
        <Link
          to="/profile/posts-stories"
          style={styles.quickCard}
        >
          <div style={styles.quickIcon}>
            <FaImages />
          </div>
          <div>
            <h3 style={styles.quickTitle}>
              Posts & Stories
            </h3>
            <p style={styles.quickText}>
              Share moments, publish quick updates, and see stories from accepted friends.
            </p>
          </div>
        </Link>

        <Link
          to="/profile/friends"
          style={styles.quickCard}
        >
          <div style={styles.quickIcon}>
            <FaUserFriends />
          </div>
          <div>
            <h3 style={styles.quickTitle}>
              Friends
            </h3>
            <p style={styles.quickText}>
              Send requests, respond to invitations, and grow your travel network.
            </p>
          </div>
        </Link>
      </section>

      <div
        style={{
          ...styles.contentGrid,
          ...(isCompact
            ? styles.contentGridCompact
            : null),
        }}
      >
        <section style={pageTheme.surface}>
          <div style={styles.sectionHeader}>
            <div>
              <h3 style={styles.sectionTitle}>
                Recent Posts
              </h3>
              <p style={styles.sectionText}>
                Your latest shared updates appear here inside the profile.
              </p>
            </div>

            <Link
              to="/profile/posts-stories"
              style={styles.inlineLink}
            >
              Open full feed
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div style={pageTheme.emptyBox}>
              You have not published a post yet.
            </div>
          ) : (
            <div style={styles.postList}>
              {recentPosts.map((post) => (
                <SocialPostCard
                  key={post._id}
                  post={post}
                  currentUserId={
                    profile?._id
                  }
                  compact
                />
              ))}
            </div>
          )}
        </section>

        <section
          style={{
            ...pageTheme.surface,
            display: "grid",
            gap: 18,
          }}
        >
          <div style={styles.sectionHeader}>
            <div>
              <h3 style={styles.sectionTitle}>
                Active Stories
              </h3>
              <p style={styles.sectionText}>
                The fast lane for visual moments that stay live for 24 hours.
              </p>
            </div>

            <Link
              to="/profile/posts-stories"
              style={styles.inlineLink}
            >
              Add story
            </Link>
          </div>

          {activeStories.length === 0 ? (
            <div style={pageTheme.emptyBox}>
              No active stories yet.
            </div>
          ) : (
            <div style={styles.storyGrid}>
              {activeStories.map((story) => (
                <SocialStoryCard
                  key={story._id}
                  story={story}
                  currentUserId={
                    profile?._id
                  }
                  compact
                />
              ))}
            </div>
          )}

          <div style={styles.sectionHeader}>
            <div>
              <h3 style={styles.sectionTitle}>
                Friend Preview
              </h3>
              <p style={styles.sectionText}>
                Your accepted connections are shown here with the same travel-first style.
              </p>
            </div>

            <Link
              to="/profile/friends"
              style={styles.inlineLink}
            >
              Manage friends
            </Link>
          </div>

          {friendsPreview.length === 0 ? (
            <div style={pageTheme.emptyBox}>
              No friends connected yet.
            </div>
          ) : (
            <div style={styles.friendGrid}>
              {friendsPreview.map(
                (friend) => (
                  <article
                    key={friend._id}
                    style={styles.friendCard}
                  >
                    <img
                      src={getUserAvatarUrl(
                        friend
                      )}
                      alt={
                        friend.fullName
                      }
                      style={
                        styles.friendAvatar
                      }
                    />
                    <strong>
                      {friend.fullName}
                    </strong>
                    <span
                      style={
                        styles.friendCountry
                      }
                    >
                      {friend.country ||
                        "Traveler"}
                    </span>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>

      {manageOpen ? (
        <section
          style={{
            ...pageTheme.surface,
            marginTop: 20,
          }}
        >
          <h3 style={styles.sectionTitle}>
            Manage Account
          </h3>
          <p style={styles.sectionText}>
            Delete the account only if you are sure you no longer want this profile, posts, stories, or friend history.
          </p>
          <button
            type="button"
            onClick={deleteAccount}
            style={pageTheme.buttonDanger}
          >
            <FaTrashAlt />
            {" "}
            Delete Account
          </button>
        </section>
      ) : null}

      {editOpen ? (
        <ModalCard
          title="Edit Profile"
          onClose={() => {
            setEditOpen(false);
            setPreview("");
            setImageFile(null);
          }}
        >
          <label style={pageTheme.field}>
            <span>Full name</span>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              style={pageTheme.control}
            />
          </label>

          <label style={pageTheme.field}>
            <span>Country</span>
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              style={pageTheme.control}
            />
          </label>

          <label style={pageTheme.field}>
            <span>Bio</span>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              style={{
                ...pageTheme.control,
                ...pageTheme.textarea,
              }}
            />
          </label>

          <label style={pageTheme.field}>
            <span>Profile image</span>
            <input
              type="file"
              accept="image/*"
              onChange={
                handleImageChange
              }
              style={pageTheme.control}
            />
          </label>

          {preview ? (
            <img
              src={preview}
              alt="Preview"
              style={styles.preview}
            />
          ) : null}

          <div style={styles.modalActions}>
            <button
              type="button"
              onClick={updateProfile}
              disabled={profileSaving}
              style={{
                ...pageTheme.buttonPrimary,
                opacity:
                  profileSaving
                    ? 0.7
                    : 1,
              }}
            >
              {profileSaving
                ? "Saving..."
                : "Save Profile"}
            </button>

            <button
              type="button"
              onClick={() =>
                setEditOpen(false)
              }
              style={pageTheme.buttonSecondary}
            >
              Cancel
            </button>
          </div>
        </ModalCard>
      ) : null}

      {passwordOpen ? (
        <ModalCard
          title="Change Password"
          onClose={() =>
            setPasswordOpen(false)
          }
        >
          <label style={pageTheme.field}>
            <span>Current password</span>
            <input
              type="password"
              name="currentPassword"
              value={
                passwordData.currentPassword
              }
              onChange={
                handlePasswordChange
              }
              style={pageTheme.control}
            />
          </label>

          <label style={pageTheme.field}>
            <span>New password</span>
            <input
              type="password"
              name="newPassword"
              value={
                passwordData.newPassword
              }
              onChange={
                handlePasswordChange
              }
              style={pageTheme.control}
            />
          </label>

          <label style={pageTheme.field}>
            <span>Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              value={
                passwordData.confirmPassword
              }
              onChange={
                handlePasswordChange
              }
              style={pageTheme.control}
            />
          </label>

          <div style={styles.modalActions}>
            <button
              type="button"
              onClick={changePassword}
              disabled={passwordSaving}
              style={{
                ...pageTheme.buttonPrimary,
                opacity:
                  passwordSaving
                    ? 0.7
                    : 1,
              }}
            >
              {passwordSaving
                ? "Updating..."
                : "Update Password"}
            </button>

            <button
              type="button"
              onClick={() =>
                setPasswordOpen(false)
              }
              style={pageTheme.buttonSecondary}
            >
              Cancel
            </button>
          </div>
        </ModalCard>
      ) : null}
    </ProfileAreaLayout>
  );
}

function ModalCard({
  title,
  children,
  onClose,
}) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={styles.sectionTitle}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const styles = {
  headerCard: {
    minWidth: "min(100%, 180px)",
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

  heroCard: {
    padding: "clamp(20px, 4vw, 28px)",
    borderRadius: 28,
    background:
      "linear-gradient(145deg, rgba(255, 255, 255, 0.86), rgba(219, 234, 254, 0.76), rgba(191, 219, 254, 0.62))",
    border:
      "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow:
      "0 28px 80px rgba(59, 130, 246, 0.18)",
  },

  heroMain: {
    display: "grid",
    gridTemplateColumns:
      "160px minmax(0, 1fr)",
    gap: 24,
    alignItems: "center",
  },

  heroMainCompact: {
    gridTemplateColumns: "1fr",
    gap: 18,
  },

  avatarShell: {
    position: "relative",
    width: "clamp(120px, 34vw, 160px)",
    height: "clamp(120px, 34vw, 160px)",
    margin: "0 auto",
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 34,
    objectFit: "cover",
    border:
      "5px solid rgba(255, 255, 255, 0.82)",
    boxShadow:
      "0 16px 34px rgba(96, 165, 250, 0.26)",
  },

  cameraButton: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 44,
    height: 44,
    borderRadius: 14,
    border: "none",
    background:
      "linear-gradient(135deg, #93c5fd, #a78bfa)",
    color: "#0f172a",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    boxShadow:
      "0 10px 24px rgba(96, 165, 250, 0.25)",
  },

  heroText: {
    minWidth: 0,
  },

  heroBadge: {
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

  heroTitle: {
    margin: "16px 0 8px",
    fontSize: "clamp(28px, 6vw, 34px)",
    color: "#1e3a8a",
    lineHeight: 1.05,
  },

  heroEmail: {
    margin: 0,
    color: "#475569",
    fontWeight: 700,
  },

  metaRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 14,
  },

  metaPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    background:
      "rgba(255, 255, 255, 0.8)",
    color: "#334155",
    border:
      "1px solid rgba(191, 219, 254, 0.72)",
    fontSize: 13,
    fontWeight: 700,
  },

  heroBio: {
    margin: "16px 0 0",
    maxWidth: 720,
    color: "#334155",
    lineHeight: 1.8,
  },

  heroActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 24,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      createAutoFitMinmax(150),
    gap: 14,
    marginTop: 24,
  },

  statCard: {
    padding: 16,
    borderRadius: 18,
    background:
      "rgba(255, 255, 255, 0.72)",
    border:
      "1px solid rgba(191, 219, 254, 0.78)",
    boxShadow:
      "0 14px 30px rgba(96, 165, 250, 0.12)",
    display: "grid",
    gap: 4,
  },

  statValue: {
    fontSize: 28,
    color: "#0f172a",
  },

  statLabel: {
    color: "#64748b",
    fontWeight: 800,
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns:
      createAutoFitMinmax(280),
    gap: 16,
    marginTop: 22,
  },

  quickCard: {
    display: "grid",
    gridTemplateColumns:
      "58px minmax(0, 1fr)",
    gap: 14,
    alignItems: "start",
    padding: 20,
    borderRadius: 22,
    background:
      "rgba(255, 255, 255, 0.76)",
    border:
      "1px solid rgba(147, 197, 253, 0.45)",
    boxShadow:
      "0 18px 40px rgba(96, 165, 250, 0.14)",
    textDecoration: "none",
  },

  quickIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    background:
      "linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(167, 139, 250, 0.85))",
    color: "#ffffff",
    display: "grid",
    placeItems: "center",
    fontSize: 22,
    boxShadow:
      "0 12px 26px rgba(96, 165, 250, 0.24)",
  },

  quickTitle: {
    margin: "2px 0 6px",
    color: "#1e3a8a",
  },

  quickText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.7,
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
    gap: 18,
    alignItems: "start",
    marginTop: 22,
  },

  contentGridCompact: {
    gridTemplateColumns: "1fr",
  },

  sectionHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 14,
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
    fontWeight: 800,
    textDecoration: "none",
  },

  postList: {
    display: "grid",
    gap: 14,
  },

  storyGrid: {
    display: "grid",
    gridTemplateColumns:
      createAutoFitMinmax(180),
    gap: 14,
  },

  friendGrid: {
    display: "grid",
    gridTemplateColumns:
      createAutoFitMinmax(140),
    gap: 12,
  },

  friendCard: {
    padding: 16,
    borderRadius: 18,
    background:
      "rgba(255, 255, 255, 0.82)",
    border:
      "1px solid rgba(191, 219, 254, 0.78)",
    display: "grid",
    gap: 8,
    justifyItems: "center",
    textAlign: "center",
  },

  friendAvatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    objectFit: "cover",
  },

  friendCountry: {
    color: "#64748b",
    fontSize: 13,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(15, 23, 42, 0.5)",
    display: "grid",
    placeItems: "center",
    padding: 20,
    zIndex: 2000,
  },

  modal: {
    width: "min(540px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: 24,
    borderRadius: 24,
    background:
      "rgba(255, 255, 255, 0.94)",
    border:
      "1px solid rgba(191, 219, 254, 0.78)",
    boxShadow:
      "0 30px 80px rgba(15, 23, 42, 0.24)",
  },

  modalHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 14,
    alignItems: "center",
    marginBottom: 16,
  },

  closeButton: {
    border: "none",
    background:
      "rgba(191, 219, 254, 0.55)",
    color: "#1d4ed8",
    borderRadius: 12,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 800,
  },

  preview: {
    width: 120,
    height: 120,
    borderRadius: 24,
    objectFit: "cover",
    display: "block",
    margin: "6px auto 0",
  },

  modalActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "flex-end",
    marginTop: 8,
  },
};

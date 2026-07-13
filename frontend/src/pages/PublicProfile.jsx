import {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  FaCheck,
  FaCompass,
  FaGlobe,
  FaMapMarkerAlt,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";

import PublicPageLayout from "../components/PublicPageLayout.jsx";

import {
  acceptFriendRequest,
  getPublicProfile,
  removeFriendship,
  resolveMediaUrl,
  sendFriendRequest,
} from "../api/social.js";

export default function PublicProfile() {
  const {
    userId,
  } = useParams();

  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const loadProfile =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getPublicProfile(
            userId
          );

        setProfile(
          data.profile
        );
      } catch (
        requestError
      ) {
        setError(
          requestError.message ||
            "Could not load this profile."
        );
      } finally {
        setLoading(false);
      }
    }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleFriendAction() {
    try {
      const relationship =
        profile.relationship;

      if (
        relationship.status ===
          "none"
      ) {
        await sendFriendRequest(
          userId
        );
      } else if (
        relationship.status ===
          "pending" &&
        relationship.direction ===
          "incoming"
      ) {
        await acceptFriendRequest(
          relationship.friendshipId
        );
      } else if (
        relationship.status ===
          "accepted"
      ) {
        await removeFriendship(
          relationship.friendshipId
        );
      }

      await loadProfile();
    } catch (
      requestError
    ) {
      setError(
        requestError.message
      );
    }
  }

  if (loading) {
    return (
      <PublicPageLayout
        title="Traveler Profile"
      >
        Loading profile...
      </PublicPageLayout>
    );
  }

  if (
    error &&
    !profile
  ) {
    return (
      <PublicPageLayout
        title="Traveler Profile"
      >
        <div
          style={
            styles.error
          }
        >
          {error}
        </div>
      </PublicPageLayout>
    );
  }

  const user =
    profile.user;

  const avatar =
    resolveMediaUrl(
      profile.avatar ||
        user.avatar
    );

  const cover =
    resolveMediaUrl(
      profile.coverImage
    );

  return (
    <PublicPageLayout
      showHeader={false}
      maxWidth={1080}
    >
      <section
        style={
          styles.profile
        }
      >
        <div
          style={{
            ...styles.cover,
            backgroundImage:
              cover
                ? `linear-gradient(rgba(15,23,42,.15),rgba(15,23,42,.55)),url("${cover}")`
                : styles.cover
                    .backgroundImage,
          }}
        />

        <div
          style={
            styles.content
          }
        >
          <div
            style={
              styles.avatarFrame
            }
          >
            {avatar ? (
              <img
                src={avatar}
                alt={
                  user.fullName
                }
                style={
                  styles.avatar
                }
              />
            ) : (
              <div
                style={
                  styles.fallback
                }
              >
                {String(
                  user.fullName
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          <div
            style={
              styles.titleRow
            }
          >
            <div>
              <h1
                style={
                  styles.name
                }
              >
                {
                  user.fullName
                }
              </h1>

              <div
                style={
                  styles.meta
                }
              >
                <span>
                  <FaMapMarkerAlt />
                  {profile.location ||
                    "Location not added"}
                </span>

                <span>
                  <FaCompass />
                  {
                    profile.travelStyle
                  }
                </span>
              </div>
            </div>

            {profile.relationship
              .status !==
              "self" && (
              <FriendButton
                relationship={
                  profile.relationship
                }
                onClick={
                  handleFriendAction
                }
              />
            )}
          </div>

          <p
            style={
              styles.bio
            }
          >
            {profile.bio ||
              "This traveler has not added a biography yet."}
          </p>

          <div
            style={
              styles.stats
            }
          >
            <Stat
              value={
                profile.stats.posts
              }
              label="Posts"
            />

            <Stat
              value={
                profile.stats.friends
              }
              label="Friends"
            />

            <Stat
              value={
                profile.stats.countries
              }
              label="Countries"
            />
          </div>
        </div>
      </section>

      {error && (
        <div
          style={
            styles.error
          }
        >
          {error}
        </div>
      )}

      <div
        style={
          styles.grid
        }
      >
        <section
          style={
            styles.card
          }
        >
          <h2>
            Travel information
          </h2>

          <div
            style={
              styles.details
            }
          >
            <Detail
              icon={
                <FaGlobe />
              }
              label="Favorite destination"
              value={
                profile.favoriteDestination ||
                "Not selected"
              }
            />

            <Detail
              icon={
                <FaCompass />
              }
              label="Travel style"
              value={
                profile.travelStyle
              }
            />

            <Detail
              icon={
                <FaGlobe />
              }
              label="Visited countries"
              value={
                profile
                  .visitedCountries
                  ?.join(", ") ||
                "No countries listed"
              }
            />

            <Detail
              icon={
                <FaUsers />
              }
              label="Travel interests"
              value={
                profile.interests
                  ?.join(", ") ||
                "No interests listed"
              }
            />
          </div>
        </section>

        <section
          style={
            styles.card
          }
        >
          <div
            style={
              styles.postsHeader
            }
          >
            <h2>
              Travel posts
            </h2>

            <Link
              to="/community"
              style={
                styles.link
              }
            >
              Community →
            </Link>
          </div>

          {profile.posts
            ?.length ? (
            <div
              style={
                styles.postGrid
              }
            >
              {profile.posts.map(
                (post) => (
                  <article
                    key={
                      post.id ||
                      post._id
                    }
                    style={
                      styles.post
                    }
                  >
                    {post.image && (
                      <img
                        src={resolveMediaUrl(
                          post.image
                        )}
                        alt=""
                        style={
                          styles.postImage
                        }
                      />
                    )}

                    <div
                      style={
                        styles.postBody
                      }
                    >
                      {post.destination && (
                        <span
                          style={
                            styles.destination
                          }
                        >
                          <FaMapMarkerAlt />
                          {
                            post.destination
                          }
                        </span>
                      )}

                      <h3>
                        {post.tripTitle ||
                          "Travel memory"}
                      </h3>

                      <p>
                        {
                          post.content
                        }
                      </p>

                      <small>
                        {
                          post.likesCount
                        }{" "}
                        likes ·{" "}
                        {
                          post.comments
                            ?.length ||
                          0
                        }{" "}
                        comments
                      </small>
                    </div>
                  </article>
                )
              )}
            </div>
          ) : (
            <p
              style={
                styles.empty
              }
            >
              This traveler has not shared any posts yet.
            </p>
          )}
        </section>
      </div>
    </PublicPageLayout>
  );
}

function FriendButton({
  relationship,
  onClick,
}) {
  if (
    relationship.status ===
    "accepted"
  ) {
    return (
      <button
        type="button"
        onClick={
          onClick
        }
        style={
          styles.secondaryButton
        }
      >
        <FaCheck />
        Friends
      </button>
    );
  }

  if (
    relationship.status ===
      "pending" &&
    relationship.direction ===
      "outgoing"
  ) {
    return (
      <button
        type="button"
        disabled
        style={
          styles.secondaryButton
        }
      >
        Request pending
      </button>
    );
  }

  if (
    relationship.status ===
      "pending" &&
    relationship.direction ===
      "incoming"
  ) {
    return (
      <button
        type="button"
        onClick={
          onClick
        }
        style={
          styles.primaryButton
        }
      >
        <FaCheck />
        Accept request
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      style={
        styles.primaryButton
      }
    >
      <FaUserPlus />
      Add friend
    </button>
  );
}

function Stat({
  value,
  label,
}) {
  return (
    <div
      style={
        styles.stat
      }
    >
      <strong>
        {value}
      </strong>

      <span>
        {label}
      </span>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}) {
  return (
    <div
      style={
        styles.detail
      }
    >
      <div
        style={
          styles.detailIcon
        }
      >
        {icon}
      </div>

      <div>
        <small>
          {label}
        </small>

        <strong>
          {value}
        </strong>
      </div>
    </div>
  );
}

const styles = {
  profile: {
    overflow: "hidden",
    borderRadius: 28,
    background: "#fff",
    border:
      "1px solid #dbeafe",
    boxShadow:
      "0 22px 60px rgba(15,23,42,.12)",
    marginBottom: 24,
  },

  cover: {
    height: 250,
    backgroundImage:
      "linear-gradient(135deg,#0f172a,#2563eb,#38bdf8)",
    backgroundSize:
      "cover",
    backgroundPosition:
      "center",
  },

  content: {
    padding:
      "0 30px 28px",
  },

  avatarFrame: {
    width: 140,
    height: 140,
    padding: 6,
    borderRadius: "50%",
    background: "#fff",
    marginTop: -70,
    boxShadow:
      "0 15px 38px rgba(15,23,42,.18)",
  },

  avatar: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%",
  },

  fallback: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg,#2563eb,#38bdf8)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 50,
  },

  titleRow: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-start",
    gap: 18,
    flexWrap: "wrap",
    marginTop: 18,
  },

  name: {
    margin: "0 0 8px",
    color: "#0f172a",
  },

  meta: {
    display: "flex",
    gap: 16,
    color: "#64748b",
    flexWrap: "wrap",
  },

  bio: {
    color: "#475569",
    lineHeight: 1.8,
    maxWidth: 760,
  },

  stats: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 20,
  },

  stat: {
    minWidth: 105,
    padding:
      "13px 17px",
    display: "grid",
    gap: 4,
    borderRadius: 15,
    background: "#f8fafc",
    border:
      "1px solid #e2e8f0",
  },

  grid: {
    display: "grid",
    gap: 22,
  },

  card: {
    padding: 24,
    borderRadius: 23,
    background: "#fff",
    border:
      "1px solid #dbeafe",
    boxShadow:
      "0 14px 38px rgba(15,23,42,.07)",
  },

  details: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 13,
  },

  detail: {
    display: "flex",
    gap: 13,
    alignItems: "center",
    padding: 15,
    borderRadius: 16,
    background: "#f8fafc",
  },

  detailIcon: {
    width: 42,
    height: 42,
    display: "grid",
    placeItems: "center",
    borderRadius: 13,
    background: "#dbeafe",
    color: "#2563eb",
  },

  postsHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  postGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",
    gap: 16,
    marginTop: 18,
  },

  post: {
    borderRadius: 18,
    overflow: "hidden",
    border:
      "1px solid #e2e8f0",
  },

  postImage: {
    width: "100%",
    height: 210,
    objectFit: "cover",
  },

  postBody: {
    padding: 16,
    color: "#475569",
  },

  destination: {
    color: "#2563eb",
    display: "flex",
    gap: 6,
    alignItems: "center",
    fontWeight: 800,
  },

  primaryButton: {
    border: 0,
    borderRadius: 13,
    padding:
      "11px 16px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
  },

  secondaryButton: {
    border:
      "1px solid #cbd5e1",
    borderRadius: 13,
    padding:
      "11px 16px",
    background: "#fff",
    color: "#334155",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
  },

  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 800,
  },

  empty: {
    color: "#64748b",
  },

  error: {
    padding: 14,
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 14,
    marginBottom: 18,
  },
};

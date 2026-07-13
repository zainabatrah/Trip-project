import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  FaCheck,
  FaComment,
  FaHeart,
  FaImage,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaSearch,
  FaTimes,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";

import PublicPageLayout from "../components/PublicPageLayout.jsx";

import {
  acceptFriendRequest,
  addPostComment,
  createPost,
  createStory,
  getFeed,
  getFriendRequests,
  getFriends,
  getPeople,
  getStories,
  removeFriendship,
  resolveMediaUrl,
  sendFriendRequest,
  togglePostLike,
} from "../api/social.js";

export default function Community() {
  const [
    posts,
    setPosts,
  ] = useState([]);

  const [
    stories,
    setStories,
  ] = useState([]);

  const [
    people,
    setPeople,
  ] = useState([]);

  const [
    friends,
    setFriends,
  ] = useState([]);

  const [
    requests,
    setRequests,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    postForm,
    setPostForm,
  ] = useState({
    content: "",
    destination: "",
    tripTitle: "",
  });

  const [
    postImage,
    setPostImage,
  ] = useState(null);

  const [
    storyImage,
    setStoryImage,
  ] = useState(null);

  const [
    storyCaption,
    setStoryCaption,
  ] = useState("");

  const [
    comments,
    setComments,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const filteredPeople =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return people;
      }

      return people.filter(
        (person) =>
          String(
            person.fullName ||
              ""
          )
            .toLowerCase()
            .includes(
              query
            )
      );
    }, [
      people,
      search,
    ]);

  async function loadCommunity() {
    try {
      setLoading(true);
      setError("");

      const [
        feedData,
        storyData,
        peopleData,
        requestData,
        friendsData,
      ] =
        await Promise.all([
          getFeed(),
          getStories(),
          getPeople(),
          getFriendRequests(),
          getFriends(),
        ]);

      setPosts(
        feedData.posts ||
          []
      );

      setStories(
        storyData.stories ||
          []
      );

      setPeople(
        peopleData.people ||
          []
      );

      setRequests(
        requestData.requests ||
          []
      );

      setFriends(
        friendsData.friends ||
          []
      );
    } catch (
      requestError
    ) {
      setError(
        requestError.message ||
          "Could not load the travel community."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCommunity();
  }, []);

  function handlePostChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setPostForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  }

  async function handleCreatePost(
    event
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const formData =
        new FormData();

      formData.append(
        "content",
        postForm.content
      );

      formData.append(
        "destination",
        postForm.destination
      );

      formData.append(
        "tripTitle",
        postForm.tripTitle
      );

      if (postImage) {
        formData.append(
          "image",
          postImage
        );
      }

      const data =
        await createPost(
          formData
        );

      setPosts((current) => [
        data.post,
        ...current,
      ]);

      setPostForm({
        content: "",
        destination: "",
        tripTitle: "",
      });

      setPostImage(null);
    } catch (
      requestError
    ) {
      setError(
        requestError.message ||
          "Could not publish your post."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateStory(
    event
  ) {
    event.preventDefault();

    if (!storyImage) {
      setError(
        "Choose an image for your story."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      const formData =
        new FormData();

      formData.append(
        "image",
        storyImage
      );

      formData.append(
        "caption",
        storyCaption
      );

      await createStory(
        formData
      );

      setStoryImage(null);
      setStoryCaption("");

      const data =
        await getStories();

      setStories(
        data.stories ||
          []
      );
    } catch (
      requestError
    ) {
      setError(
        requestError.message ||
          "Could not publish your story."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLike(
    postId
  ) {
    try {
      const data =
        await togglePostLike(
          postId
        );

      setPosts((current) =>
        current.map(
          (post) =>
            (
              post.id ||
              post._id
            ) === postId
              ? {
                  ...post,
                  likedByMe:
                    data.liked,
                  likesCount:
                    data.likesCount,
                }
              : post
        )
      );
    } catch (
      requestError
    ) {
      setError(
        requestError.message
      );
    }
  }

  async function handleComment(
    postId
  ) {
    const text =
      String(
        comments[postId] ||
          ""
      ).trim();

    if (!text) {
      return;
    }

    try {
      const data =
        await addPostComment(
          postId,
          text
        );

      setPosts((current) =>
        current.map(
          (post) =>
            (
              post.id ||
              post._id
            ) === postId
              ? data.post
              : post
        )
      );

      setComments(
        (current) => ({
          ...current,
          [postId]: "",
        })
      );
    } catch (
      requestError
    ) {
      setError(
        requestError.message
      );
    }
  }

  async function handleAddFriend(
    userId
  ) {
    try {
      await sendFriendRequest(
        userId
      );

      await loadCommunity();
    } catch (
      requestError
    ) {
      setError(
        requestError.message
      );
    }
  }

  async function handleAccept(
    requestId
  ) {
    try {
      await acceptFriendRequest(
        requestId
      );

      await loadCommunity();
    } catch (
      requestError
    ) {
      setError(
        requestError.message
      );
    }
  }

  async function handleRemove(
    friendshipId
  ) {
    try {
      await removeFriendship(
        friendshipId
      );

      await loadCommunity();
    } catch (
      requestError
    ) {
      setError(
        requestError.message
      );
    }
  }

  return (
    <PublicPageLayout
      eyebrow="Travel Network"
      title="Travel Community"
      subtitle="Share memories, publish stories, discover travelers, and build your travel network."
      maxWidth={1240}
      headerAction={
        <Link
          to="/profile"
          style={
            styles.primaryButton
          }
        >
          My Profile
        </Link>
      }
    >
      {error && (
        <div
          style={
            styles.errorBox
          }
        >
          {error}
        </div>
      )}

      <section
        style={
          styles.storySection
        }
      >
        <div
          style={
            styles.sectionHeader
          }
        >
          <div>
            <span
              style={
                styles.eyebrow
              }
            >
              Live for 24 hours
            </span>

            <h2
              style={
                styles.sectionTitle
              }
            >
              Travel stories
            </h2>
          </div>

          <form
            onSubmit={
              handleCreateStory
            }
            style={
              styles.storyForm
            }
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(
                event
              ) =>
                setStoryImage(
                  event.target
                    .files?.[0] ||
                    null
                )
              }
            />

            <input
              value={
                storyCaption
              }
              onChange={(
                event
              ) =>
                setStoryCaption(
                  event.target
                    .value
                )
              }
              placeholder="Story caption"
              style={
                styles.smallInput
              }
            />

            <button
              type="submit"
              disabled={
                saving
              }
              style={
                styles.primaryButton
              }
            >
              Add Story
            </button>
          </form>
        </div>

        <div
          style={
            styles.storyRow
          }
        >
          {stories.length ===
          0 ? (
            <div
              style={
                styles.emptyText
              }
            >
              No active stories.
            </div>
          ) : (
            stories.map(
              (story) => (
                <StoryCard
                  key={
                    story.id ||
                    story._id
                  }
                  story={
                    story
                  }
                />
              )
            )
          )}
        </div>
      </section>

      <div
        style={
          styles.layout
        }
      >
        <main>
          <form
            onSubmit={
              handleCreatePost
            }
            style={
              styles.createPost
            }
          >
            <div
              style={
                styles.sectionHeader
              }
            >
              <div>
                <span
                  style={
                    styles.eyebrow
                  }
                >
                  Share a memory
                </span>

                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  Create travel post
                </h2>
              </div>
            </div>

            <textarea
              name="content"
              value={
                postForm.content
              }
              onChange={
                handlePostChange
              }
              placeholder="Tell the community about your journey..."
              maxLength={1500}
              rows={4}
              style={
                styles.textarea
              }
            />

            <div
              style={
                styles.formGrid
              }
            >
              <input
                name="tripTitle"
                value={
                  postForm.tripTitle
                }
                onChange={
                  handlePostChange
                }
                placeholder="Trip title"
                style={
                  styles.input
                }
              />

              <input
                name="destination"
                value={
                  postForm.destination
                }
                onChange={
                  handlePostChange
                }
                placeholder="Destination"
                style={
                  styles.input
                }
              />
            </div>

            <div
              style={
                styles.postActions
              }
            >
              <label
                style={
                  styles.fileButton
                }
              >
                <FaImage />
                {postImage
                  ? postImage.name
                  : "Add photo"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(
                    event
                  ) =>
                    setPostImage(
                      event.target
                        .files?.[0] ||
                        null
                    )
                  }
                />
              </label>

              <button
                type="submit"
                disabled={
                  saving
                }
                style={
                  styles.primaryButton
                }
              >
                <FaPaperPlane />
                {saving
                  ? "Publishing..."
                  : "Publish"}
              </button>
            </div>
          </form>

          <section>
            <div
              style={
                styles.feedHeader
              }
            >
              <h2
                style={
                  styles.sectionTitle
                }
              >
                Community feed
              </h2>

              <span
                style={
                  styles.countPill
                }
              >
                {
                  posts.length
                }{" "}
                posts
              </span>
            </div>

            {loading ? (
              <div
                style={
                  styles.loadingBox
                }
              >
                Loading community...
              </div>
            ) : posts.length ===
              0 ? (
              <div
                style={
                  styles.loadingBox
                }
              >
                No posts yet.
              </div>
            ) : (
              <div
                style={
                  styles.feed
                }
              >
                {posts.map(
                  (post) => (
                    <PostCard
                      key={
                        post.id ||
                        post._id
                      }
                      post={
                        post
                      }
                      commentValue={
                        comments[
                          post.id ||
                            post._id
                        ] || ""
                      }
                      onCommentChange={(
                        value
                      ) =>
                        setComments(
                          (
                            current
                          ) => ({
                            ...current,
                            [
                              post.id ||
                                post._id
                            ]:
                              value,
                          })
                        )
                      }
                      onComment={() =>
                        handleComment(
                          post.id ||
                            post._id
                        )
                      }
                      onLike={() =>
                        handleLike(
                          post.id ||
                            post._id
                        )
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>
        </main>

        <aside>
          <section
            style={
              styles.sideCard
            }
          >
            <div
              style={
                styles.sideTitle
              }
            >
              <FaUserPlus />
              Friend requests
            </div>

            {requests.length ===
            0 ? (
              <p
                style={
                  styles.emptyText
                }
              >
                No new requests.
              </p>
            ) : (
              requests.map(
                (request) => (
                  <PersonRow
                    key={
                      request.id
                    }
                    user={
                      request.user
                    }
                    action={
                      <div
                        style={
                          styles.smallActions
                        }
                      >
                        <button
                          type="button"
                          title="Accept"
                          onClick={() =>
                            handleAccept(
                              request.id
                            )
                          }
                          style={
                            styles.acceptButton
                          }
                        >
                          <FaCheck />
                        </button>

                        <button
                          type="button"
                          title="Decline"
                          onClick={() =>
                            handleRemove(
                              request.id
                            )
                          }
                          style={
                            styles.rejectButton
                          }
                        >
                          <FaTimes />
                        </button>
                      </div>
                    }
                  />
                )
              )
            )}
          </section>

          <section
            id="people"
            style={
              styles.sideCard
            }
          >
            <div
              style={
                styles.sideTitle
              }
            >
              <FaSearch />
              Find travelers
            </div>

            <input
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search people"
              style={
                styles.input
              }
            />

            <div
              style={
                styles.peopleList
              }
            >
              {filteredPeople
                .slice(
                  0,
                  10
                )
                .map(
                  (person) => (
                    <PersonRow
                      key={
                        person.id
                      }
                      user={
                        person
                      }
                      action={
                        <FriendAction
                          person={
                            person
                          }
                          onAdd={() =>
                            handleAddFriend(
                              person.id
                            )
                          }
                          onAccept={() =>
                            handleAccept(
                              person
                                .relationship
                                .friendshipId
                            )
                          }
                          onRemove={() =>
                            handleRemove(
                              person
                                .relationship
                                .friendshipId
                            )
                          }
                        />
                      }
                    />
                  )
                )}
            </div>
          </section>

          <section
            style={
              styles.sideCard
            }
          >
            <div
              style={
                styles.sideTitle
              }
            >
              <FaUsers />
              My friends
            </div>

            {friends.length ===
            0 ? (
              <p
                style={
                  styles.emptyText
                }
              >
                Add travelers to build your network.
              </p>
            ) : (
              friends
                .slice(
                  0,
                  8
                )
                .map(
                  (friend) => (
                    <PersonRow
                      key={
                        friend.friendshipId
                      }
                      user={
                        friend.user
                      }
                      action={
                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(
                              friend.friendshipId
                            )
                          }
                          style={
                            styles.removeButton
                          }
                        >
                          Remove
                        </button>
                      }
                    />
                  )
                )
            )}
          </section>
        </aside>
      </div>
    </PublicPageLayout>
  );
}

function StoryCard({
  story,
}) {
  const image =
    resolveMediaUrl(
      story.image
    );

  const avatar =
    resolveMediaUrl(
      story.author
        ?.avatar
    );

  return (
    <Link
      to={`/people/${story.author?.id}`}
      style={{
        ...styles.storyCard,
        backgroundImage:
          `linear-gradient(transparent 40%, rgba(15,23,42,.9)), url("${image}")`,
      }}
    >
      <div
        style={
          styles.storyAvatar
        }
      >
        {avatar ? (
          <img
            src={avatar}
            alt=""
            style={
              styles.avatarImage
            }
          />
        ) : (
          String(
            story.author
              ?.fullName ||
              "T"
          ).charAt(0)
        )}
      </div>

      <div>
        <strong>
          {
            story.author
              ?.fullName
          }
        </strong>

        <small>
          {story.caption ||
            story.destination ||
            "Travel story"}
        </small>
      </div>
    </Link>
  );
}

function PostCard({
  post,
  onLike,
  commentValue,
  onCommentChange,
  onComment,
}) {
  const image =
    resolveMediaUrl(
      post.image
    );

  return (
    <article
      style={
        styles.postCard
      }
    >
      <div
        style={
          styles.postHeader
        }
      >
        <UserAvatar
          user={
            post.author
          }
        />

        <div
          style={{
            flex: 1,
          }}
        >
          <Link
            to={`/people/${post.author?.id}`}
            style={
              styles.userLink
            }
          >
            {
              post.author
                ?.fullName
            }
          </Link>

          <div
            style={
              styles.postMeta
            }
          >
            {post.destination && (
              <>
                <FaMapMarkerAlt />
                {
                  post.destination
                }
              </>
            )}
          </div>
        </div>

        <small
          style={
            styles.date
          }
        >
          {new Date(
            post.createdAt
          ).toLocaleDateString()}
        </small>
      </div>

      {post.tripTitle && (
        <h3
          style={
            styles.tripTitle
          }
        >
          {
            post.tripTitle
          }
        </h3>
      )}

      {post.content && (
        <p
          style={
            styles.postContent
          }
        >
          {
            post.content
          }
        </p>
      )}

      {image && (
        <img
          src={image}
          alt={
            post.tripTitle ||
            "Travel memory"
          }
          style={
            styles.feedImage
          }
        />
      )}

      <div
        style={
          styles.engagement
        }
      >
        <button
          type="button"
          onClick={
            onLike
          }
          style={{
            ...styles.engagementButton,
            color:
              post.likedByMe
                ? "#dc2626"
                : "#475569",
          }}
        >
          <FaHeart />
          {
            post.likesCount ||
            0
          }{" "}
          Likes
        </button>

        <span
          style={
            styles.engagementButton
          }
        >
          <FaComment />
          {
            post.comments
              ?.length ||
            0
          }{" "}
          Comments
        </span>
      </div>

      {post.comments
        ?.slice(-3)
        .map(
          (comment) => (
            <div
              key={
                comment.id ||
                comment._id
              }
              style={
                styles.comment
              }
            >
              <strong>
                {
                  comment
                    .author
                    ?.fullName
                }
              </strong>

              <span>
                {
                  comment.text
                }
              </span>
            </div>
          )
        )}

      <div
        style={
          styles.commentForm
        }
      >
        <input
          value={
            commentValue
          }
          onChange={(
            event
          ) =>
            onCommentChange(
              event.target
                .value
            )
          }
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
              "Enter"
            ) {
              onComment();
            }
          }}
          placeholder="Write a comment..."
          style={
            styles.commentInput
          }
        />

        <button
          type="button"
          onClick={
            onComment
          }
          style={
            styles.sendButton
          }
        >
          <FaPaperPlane />
        </button>
      </div>
    </article>
  );
}

function PersonRow({
  user,
  action,
}) {
  return (
    <div
      style={
        styles.personRow
      }
    >
      <UserAvatar
        user={user}
        size={44}
      />

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <Link
          to={`/people/${user.id}`}
          style={
            styles.userLink
          }
        >
          {
            user.fullName
          }
        </Link>

        <small
          style={
            styles.personSubtitle
          }
        >
          {user.location ||
            user.travelStyle ||
            "Traveler"}
        </small>
      </div>

      {action}
    </div>
  );
}

function UserAvatar({
  user,
  size = 48,
}) {
  const avatar =
    resolveMediaUrl(
      user?.avatar
    );

  return avatar ? (
    <img
      src={avatar}
      alt={
        user?.fullName ||
        "Traveler"
      }
      style={{
        width: size,
        height: size,
        borderRadius:
          "50%",
        objectFit: "cover",
      }}
    />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius:
          "50%",
        background:
          "linear-gradient(135deg,#2563eb,#38bdf8)",
        color: "#fff",
        display: "grid",
        placeItems:
          "center",
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      {String(
        user?.fullName ||
          "T"
      )
        .charAt(0)
        .toUpperCase()}
    </div>
  );
}

function FriendAction({
  person,
  onAdd,
  onAccept,
  onRemove,
}) {
  const relationship =
    person.relationship ||
    {};

  if (
    relationship.status ===
    "accepted"
  ) {
    return (
      <button
        type="button"
        onClick={
          onRemove
        }
        style={
          styles.removeButton
        }
      >
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
          styles.pendingButton
        }
      >
        Pending
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
          onAccept
        }
        style={
          styles.addButton
        }
      >
        Accept
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={
        onAdd
      }
      style={
        styles.addButton
      }
    >
      <FaUserPlus />
    </button>
  );
}

const styles = {
  storySection: {
    padding: 22,
    borderRadius: 24,
    background: "#fff",
    border:
      "1px solid #dbeafe",
    boxShadow:
      "0 16px 42px rgba(15,23,42,.07)",
    marginBottom: 22,
  },

  sectionHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 18,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 18,
  },

  eyebrow: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 900,
    textTransform:
      "uppercase",
    letterSpacing:
      ".12em",
  },

  sectionTitle: {
    margin: "4px 0 0",
    color: "#0f172a",
    fontSize: 23,
  },

  storyForm: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },

  storyRow: {
    display: "flex",
    gap: 14,
    overflowX: "auto",
    paddingBottom: 4,
  },

  storyCard: {
    width: 145,
    height: 210,
    borderRadius: 20,
    flexShrink: 0,
    backgroundSize:
      "cover",
    backgroundPosition:
      "center",
    textDecoration: "none",
    color: "#fff",
    padding: 14,
    boxSizing:
      "border-box",
    display: "flex",
    flexDirection:
      "column",
    justifyContent:
      "space-between",
    boxShadow:
      "0 13px 30px rgba(15,23,42,.18)",
  },

  storyAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border:
      "3px solid #38bdf8",
    background: "#2563eb",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    fontWeight: 900,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  layout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0,2fr) minmax(290px,.8fr)",
    gap: 22,
    alignItems: "start",
  },

  createPost: {
    padding: 22,
    borderRadius: 24,
    background: "#fff",
    border:
      "1px solid #dbeafe",
    boxShadow:
      "0 16px 42px rgba(15,23,42,.07)",
    marginBottom: 22,
  },

  textarea: {
    width: "100%",
    boxSizing:
      "border-box",
    border:
      "1px solid #cbd5e1",
    borderRadius: 16,
    padding: 14,
    resize: "vertical",
    font: "inherit",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",
    gap: 12,
    marginTop: 12,
  },

  input: {
    width: "100%",
    boxSizing:
      "border-box",
    padding:
      "11px 12px",
    borderRadius: 13,
    border:
      "1px solid #cbd5e1",
    font: "inherit",
  },

  smallInput: {
    padding:
      "10px 12px",
    borderRadius: 12,
    border:
      "1px solid #cbd5e1",
  },

  postActions: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 12,
    alignItems: "center",
    marginTop: 15,
  },

  fileButton: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    cursor: "pointer",
    color: "#2563eb",
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
    textDecoration: "none",
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
  },

  feedHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  countPill: {
    padding:
      "7px 12px",
    borderRadius: 999,
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: 800,
  },

  feed: {
    display: "grid",
    gap: 18,
  },

  postCard: {
    background: "#fff",
    borderRadius: 23,
    border:
      "1px solid #dbeafe",
    boxShadow:
      "0 14px 38px rgba(15,23,42,.07)",
    padding: 20,
  },

  postHeader: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },

  userLink: {
    color: "#0f172a",
    fontWeight: 900,
    textDecoration: "none",
  },

  postMeta: {
    color: "#64748b",
    display: "flex",
    gap: 5,
    alignItems: "center",
    fontSize: 13,
    marginTop: 3,
  },

  date: {
    color: "#94a3b8",
  },

  tripTitle: {
    margin:
      "18px 0 7px",
    color: "#0f172a",
  },

  postContent: {
    color: "#475569",
    lineHeight: 1.8,
    whiteSpace:
      "pre-wrap",
  },

  feedImage: {
    width: "100%",
    maxHeight: 520,
    objectFit: "cover",
    borderRadius: 18,
    marginTop: 12,
  },

  engagement: {
    display: "flex",
    gap: 20,
    borderTop:
      "1px solid #e2e8f0",
    borderBottom:
      "1px solid #e2e8f0",
    padding:
      "13px 0",
    marginTop: 16,
  },

  engagementButton: {
    border: 0,
    background:
      "transparent",
    fontWeight: 800,
    display: "flex",
    gap: 7,
    alignItems: "center",
    cursor: "pointer",
  },

  comment: {
    display: "flex",
    gap: 7,
    padding:
      "9px 12px",
    marginTop: 8,
    borderRadius: 13,
    background: "#f8fafc",
    color: "#475569",
    fontSize: 14,
  },

  commentForm: {
    display: "grid",
    gridTemplateColumns:
      "1fr 42px",
    gap: 8,
    marginTop: 12,
  },

  commentInput: {
    border:
      "1px solid #cbd5e1",
    borderRadius: 999,
    padding:
      "10px 14px",
  },

  sendButton: {
    width: 42,
    height: 42,
    border: 0,
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },

  sideCard: {
    background: "#fff",
    padding: 18,
    borderRadius: 21,
    border:
      "1px solid #dbeafe",
    boxShadow:
      "0 13px 34px rgba(15,23,42,.06)",
    marginBottom: 16,
  },

  sideTitle: {
    display: "flex",
    gap: 9,
    alignItems: "center",
    color: "#0f172a",
    fontWeight: 900,
    marginBottom: 14,
  },

  peopleList: {
    display: "grid",
    gap: 6,
    marginTop: 12,
  },

  personRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding:
      "9px 0",
    borderBottom:
      "1px solid #f1f5f9",
  },

  personSubtitle: {
    display: "block",
    color: "#64748b",
    marginTop: 3,
  },

  addButton: {
    border: 0,
    borderRadius: 10,
    padding:
      "8px 10px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: 800,
    cursor: "pointer",
  },

  pendingButton: {
    border: 0,
    borderRadius: 10,
    padding:
      "8px 10px",
    background: "#f1f5f9",
    color: "#64748b",
  },

  removeButton: {
    border:
      "1px solid #cbd5e1",
    borderRadius: 10,
    padding:
      "7px 9px",
    background: "#fff",
    color: "#475569",
    cursor: "pointer",
  },

  smallActions: {
    display: "flex",
    gap: 6,
  },

  acceptButton: {
    border: 0,
    borderRadius: 9,
    padding: 8,
    background: "#dcfce7",
    color: "#15803d",
    cursor: "pointer",
  },

  rejectButton: {
    border: 0,
    borderRadius: 9,
    padding: 8,
    background: "#fee2e2",
    color: "#b91c1c",
    cursor: "pointer",
  },

  loadingBox: {
    padding: 30,
    textAlign: "center",
    borderRadius: 18,
    background: "#fff",
    color: "#64748b",
  },

  emptyText: {
    color: "#64748b",
    fontSize: 14,
  },

  errorBox: {
    padding: 14,
    borderRadius: 14,
    background: "#fee2e2",
    color: "#991b1b",
    marginBottom: 18,
  },
};
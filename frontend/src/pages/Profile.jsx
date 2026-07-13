import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCamera,
  FaCheck,
  FaComment,
  FaCompass,
  FaEdit,
  FaGlobe,
  FaHeart,
  FaImage,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaPlus,
  FaSearch,
  FaTimes,
  FaUserFriends,
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
  getMyProfile,
  getPeople,
  getStories,
  removeFriendship,
  resolveMediaUrl,
  sendFriendRequest,
  togglePostLike,
  updateMyProfile,
} from "../api/social.js";

const profileTabs = [
  { id: "posts", label: "Posts" },
  { id: "stories", label: "Stories" },
  { id: "friends", label: "Friends" },
  { id: "about", label: "About" },
];

const emptyProfileForm = {
  bio: "",
  location: "",
  travelStyle: "Mixed",
  favoriteDestination: "",
  visitedCountries: "",
  interests: "",
};

const emptyPostForm = {
  content: "",
  tripTitle: "",
  destination: "",
};

function getId(item) {
  return String(item?.id || item?._id || "");
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [people, setPeople] = useState([]);

  const [activeTab, setActiveTab] = useState("posts");
  const [profileForm, setProfileForm] =
    useState(emptyProfileForm);
  const [postForm, setPostForm] =
    useState(emptyPostForm);

  const [postImage, setPostImage] = useState(null);
  const [storyImage, setStoryImage] = useState(null);
  const [storyCaption, setStoryCaption] = useState("");
  const [storyDestination, setStoryDestination] =
    useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [comments, setComments] = useState({});
  const [peopleSearch, setPeopleSearch] = useState("");
  const [editingProfile, setEditingProfile] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProfilePage() {
    try {
      setLoading(true);
      setError("");

      const profileData = await getMyProfile();
      const loadedProfile = profileData?.profile;

      if (!loadedProfile) {
        throw new Error(
          "Profile data was not returned by the server."
        );
      }

      setProfile(loadedProfile);

      setProfileForm({
        bio: loadedProfile.bio || "",
        location: loadedProfile.location || "",
        travelStyle:
          loadedProfile.travelStyle || "Mixed",
        favoriteDestination:
          loadedProfile.favoriteDestination || "",
        visitedCountries: (
          loadedProfile.visitedCountries || []
        ).join(", "),
        interests: (
          loadedProfile.interests || []
        ).join(", "),
      });

      const results = await Promise.allSettled([
        getFeed(),
        getStories(),
        getFriends(),
        getFriendRequests(),
        getPeople(),
      ]);

      const [
        feedResult,
        storiesResult,
        friendsResult,
        requestsResult,
        peopleResult,
      ] = results;

      if (feedResult.status === "fulfilled") {
        setPosts(feedResult.value?.posts || []);
      } else {
        console.error(
          "Could not load posts:",
          feedResult.reason
        );

        setPosts([]);
      }

      if (storiesResult.status === "fulfilled") {
        setStories(
          storiesResult.value?.stories || []
        );
      } else {
        console.error(
          "Could not load stories:",
          storiesResult.reason
        );

        setStories([]);
      }

      if (friendsResult.status === "fulfilled") {
        setFriends(
          friendsResult.value?.friends || []
        );
      } else {
        console.error(
          "Could not load friends:",
          friendsResult.reason
        );

        setFriends([]);
      }

      if (requestsResult.status === "fulfilled") {
        setFriendRequests(
          requestsResult.value?.requests || []
        );
      } else {
        console.error(
          "Could not load friend requests:",
          requestsResult.reason
        );

        setFriendRequests([]);
      }

      if (peopleResult.status === "fulfilled") {
        setPeople(
          peopleResult.value?.people || []
        );
      } else {
        console.error(
          "Could not load people:",
          peopleResult.reason
        );

        setPeople([]);
      }

      const failedSections = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedSections.length > 0) {
        setError(
          "Your profile loaded, but some social sections could not be loaded."
        );
      }
    } catch (requestError) {
      console.error(
        "Profile loading failed:",
        requestError
      );

      setProfile(null);
      setPosts([]);
      setStories([]);
      setFriends([]);
      setFriendRequests([]);
      setPeople([]);

      setError(
        requestError?.message ||
          "Could not load your profile."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfilePage();
  }, []);

  function handleProfileChange(event) {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      Object.entries(profileForm).forEach(
        ([key, value]) => {
          formData.append(key, value);
        }
      );

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      if (coverFile) {
        formData.append("coverImage", coverFile);
      }

      const response =
        await updateMyProfile(formData);

      setSuccess(
        response?.message ||
          "Profile updated successfully."
      );

      setEditingProfile(false);
      setAvatarFile(null);
      setCoverFile(null);

      await loadProfilePage();
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  function handlePostChange(event) {
    const { name, value } = event.target;

    setPostForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleCreatePost(event) {
    event.preventDefault();

    if (
      !postForm.content.trim() &&
      !postImage
    ) {
      setError(
        "Write something or choose a photo."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append(
        "content",
        postForm.content.trim()
      );

      formData.append(
        "tripTitle",
        postForm.tripTitle.trim()
      );

      formData.append(
        "destination",
        postForm.destination.trim()
      );

      if (postImage) {
        formData.append("image", postImage);
      }

      const response =
        await createPost(formData);

      if (response?.post) {
        setPosts((current) => [
          response.post,
          ...current,
        ]);
      }

      setPostForm(emptyPostForm);
      setPostImage(null);

      setSuccess(
        response?.message ||
          "Post published successfully."
      );

      const profileData =
        await getMyProfile();

      if (profileData?.profile) {
        setProfile(profileData.profile);
      }
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not publish your post."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLike(postId) {
    try {
      const response =
        await togglePostLike(postId);

      setPosts((current) =>
        current.map((post) =>
          getId(post) === postId
            ? {
                ...post,

                likedByMe:
                  response?.liked,

                likesCount:
                  response?.likesCount ??
                  post.likesCount,
              }
            : post
        )
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not update this post."
      );
    }
  }

  async function handleComment(postId) {
    const text = String(
      comments[postId] || ""
    ).trim();

    if (!text) {
      return;
    }

    try {
      const response =
        await addPostComment(
          postId,
          text
        );

      if (response?.post) {
        setPosts((current) =>
          current.map((post) =>
            getId(post) === postId
              ? response.post
              : post
          )
        );
      }

      setComments((current) => ({
        ...current,
        [postId]: "",
      }));
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not add your comment."
      );
    }
  }

  async function handleCreateStory(event) {
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
      setSuccess("");

      const formData = new FormData();

      formData.append(
        "image",
        storyImage
      );

      formData.append(
        "caption",
        storyCaption.trim()
      );

      formData.append(
        "destination",
        storyDestination.trim()
      );

      const response =
        await createStory(formData);

      setStoryImage(null);
      setStoryCaption("");
      setStoryDestination("");

      setSuccess(
        response?.message ||
          "Story published for 24 hours."
      );

      const storiesData =
        await getStories();

      setStories(
        storiesData?.stories || []
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not publish your story."
      );
    } finally {
      setSaving(false);
    }
  }

  async function reloadFriendData() {
    const [
      friendsData,
      requestsData,
      peopleData,
      profileData,
    ] = await Promise.all([
      getFriends(),
      getFriendRequests(),
      getPeople(),
      getMyProfile(),
    ]);

    setFriends(
      friendsData?.friends || []
    );

    setFriendRequests(
      requestsData?.requests || []
    );

    setPeople(
      peopleData?.people || []
    );

    if (profileData?.profile) {
      setProfile(
        profileData.profile
      );
    }
  }

  async function handleAddFriend(userId) {
    try {
      setError("");

      await sendFriendRequest(userId);
      await reloadFriendData();
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not send the friend request."
      );
    }
  }

  async function handleAcceptFriend(
    friendshipId
  ) {
    try {
      setError("");

      await acceptFriendRequest(
        friendshipId
      );

      await reloadFriendData();
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not accept the friend request."
      );
    }
  }

  async function handleRemoveFriend(
    friendshipId
  ) {
    try {
      setError("");

      await removeFriendship(
        friendshipId
      );

      await reloadFriendData();
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Could not remove the friendship."
      );
    }
  }

  const filteredPeople = useMemo(() => {
    const query = peopleSearch
      .trim()
      .toLowerCase();

    if (!query) {
      return people;
    }

    return people.filter((person) =>
      String(
        person.fullName ||
          person.name ||
          ""
      )
        .toLowerCase()
        .includes(query)
    );
  }, [people, peopleSearch]);

  if (loading) {
    return (
      <PublicPageLayout
        showHeader={false}
        maxWidth={1220}
      >
        <div style={styles.loadingBox}>
          Loading your profile...
        </div>
      </PublicPageLayout>
    );
  }

  if (!profile) {
    return (
      <PublicPageLayout
        showHeader={false}
        maxWidth={1220}
      >
        <div style={styles.errorBox}>
          {error ||
            "Profile could not be loaded."}
        </div>
      </PublicPageLayout>
    );
  }

  const user = profile.user || {};

  const avatar = resolveMediaUrl(
    profile.avatar ||
      user.avatar
  );

  const cover = resolveMediaUrl(
    profile.coverImage
  );

  const profileLetter = String(
    user.fullName ||
      user.name ||
      "T"
  )
    .charAt(0)
    .toUpperCase();

  return (
    <PublicPageLayout
      showHeader={false}
      maxWidth={1220}
    >
      <section style={styles.profileHeader}>
        <div
          style={{
            ...styles.cover,

            backgroundImage: cover
              ? `linear-gradient(rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.55)), url("${cover}")`
              : styles.cover.backgroundImage,
          }}
        >
          <button
            type="button"
            onClick={() =>
              setEditingProfile(true)
            }
            style={styles.editCoverButton}
          >
            <FaCamera />
            Edit profile
          </button>
        </div>

        <div
          style={
            styles.profileInformation
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
                  user.fullName ||
                  "Profile"
                }
                style={styles.avatar}
              />
            ) : (
              <div
                style={
                  styles.avatarFallback
                }
              >
                {profileLetter}
              </div>
            )}
          </div>

          <div
            style={
              styles.identityRow
            }
          >
            <div>
              <h1
                style={
                  styles.profileName
                }
              >
                {user.fullName ||
                  user.name ||
                  "Traveler"}
              </h1>

              <div
                style={
                  styles.profileMeta
                }
              >
                <span
                  style={
                    styles.inlineMeta
                  }
                >
                  <FaMapMarkerAlt />

                  {profile.location ||
                    "Location not added"}
                </span>

                <span
                  style={
                    styles.inlineMeta
                  }
                >
                  <FaCompass />

                  {profile.travelStyle ||
                    "Mixed"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setEditingProfile(true)
              }
              style={
                styles.primaryButton
              }
            >
              <FaEdit />
              Edit profile
            </button>
          </div>

          <p
            style={
              styles.profileBio
            }
          >
            {profile.bio ||
              "Add a biography describing your travel interests and experiences."}
          </p>

          <div
            style={
              styles.profileStats
            }
          >
            <StatButton
              value={
                profile.stats
                  ?.posts || 0
              }
              label="Posts"
              onClick={() =>
                setActiveTab("posts")
              }
            />

            <StatButton
              value={
                profile.stats
                  ?.friends || 0
              }
              label="Friends"
              onClick={() =>
                setActiveTab("friends")
              }
            />

            <StatButton
              value={
                profile.stats
                  ?.countries || 0
              }
              label="Countries"
              onClick={() =>
                setActiveTab("about")
              }
            />
          </div>
        </div>

        <div style={styles.tabs}>
          {profileTabs.map(
            (tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id)
                }
                style={{
                  ...styles.tabButton,

                  ...(activeTab ===
                  tab.id
                    ? styles.activeTabButton
                    : {}),
                }}
              >
                {tab.label}

                {tab.id ===
                  "friends" &&
                friendRequests.length >
                  0 ? (
                  <span
                    style={
                      styles.notificationBadge
                    }
                  >
                    {
                      friendRequests.length
                    }
                  </span>
                ) : null}
              </button>
            )
          )}
        </div>
      </section>

      {error ? (
        <div style={styles.errorBox}>
          {error}
        </div>
      ) : null}

      {success ? (
        <div style={styles.successBox}>
          {success}
        </div>
      ) : null}

      {activeTab === "posts" ? (
        <div
          style={
            styles.facebookLayout
          }
        >
          <aside>
            <ProfileSummary
              profile={profile}
            />

            <TripLinks />
          </aside>

          <div>
            <form
              onSubmit={
                handleCreatePost
              }
              style={
                styles.createPostCard
              }
            >
              <div
                style={
                  styles.createPostHeader
                }
              >
                <UserAvatar
                  user={user}
                  image={avatar}
                  size={50}
                />

                <textarea
                  name="content"
                  value={
                    postForm.content
                  }
                  onChange={
                    handlePostChange
                  }
                  maxLength={1500}
                  placeholder={`What's on your travel mind, ${
                    user.fullName ||
                    "traveler"
                  }?`}
                  style={
                    styles.postTextarea
                  }
                />
              </div>

              <div
                style={
                  styles.postFields
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
                  style={styles.input}
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
                  style={styles.input}
                />
              </div>

              <div
                style={
                  styles.createPostActions
                }
              >
                <label
                  style={
                    styles.uploadButton
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
                  disabled={saving}
                  style={
                    styles.primaryButton
                  }
                >
                  <FaPaperPlane />

                  {saving
                    ? "Publishing..."
                    : "Post"}
                </button>
              </div>
            </form>

            <div style={styles.feed}>
              {posts.length === 0 ? (
                <EmptySection
                  icon={<FaImage />}
                  title="No posts yet"
                  text="Publish the first travel post."
                />
              ) : (
                posts.map((post) => {
                  const postId =
                    getId(post);

                  return (
                    <PostCard
                      key={postId}
                      post={post}
                      commentValue={
                        comments[
                          postId
                        ] || ""
                      }
                      onCommentChange={(
                        value
                      ) =>
                        setComments(
                          (current) => ({
                            ...current,

                            [postId]:
                              value,
                          })
                        )
                      }
                      onLike={() =>
                        handleLike(
                          postId
                        )
                      }
                      onComment={() =>
                        handleComment(
                          postId
                        )
                      }
                    />
                  );
                })
              )}
            </div>
          </div>

          <aside>
            <FriendsPreview
              friends={friends}
              requests={
                friendRequests
              }
              onAccept={
                handleAcceptFriend
              }
            />
          </aside>
        </div>
      ) : null}

      {activeTab === "stories" ? (
        <section
          style={
            styles.contentCard
          }
        >
          <div
            style={
              styles.sectionHeader
            }
          >
            <div>
              <span
                style={styles.eyebrow}
              >
                Available for 24 hours
              </span>

              <h2
                style={
                  styles.sectionTitle
                }
              >
                Travel stories
              </h2>
            </div>
          </div>

          <form
            onSubmit={
              handleCreateStory
            }
            style={
              styles.storyCreator
            }
          >
            <label
              style={
                styles.storyUpload
              }
            >
              <FaPlus />

              <span>
                {storyImage
                  ? storyImage.name
                  : "Choose story image"}
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
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
            </label>

            <input
              value={storyCaption}
              onChange={(event) =>
                setStoryCaption(
                  event.target.value
                )
              }
              placeholder="Story caption"
              maxLength={300}
              style={styles.input}
            />

            <input
              value={
                storyDestination
              }
              onChange={(event) =>
                setStoryDestination(
                  event.target.value
                )
              }
              placeholder="Destination"
              style={styles.input}
            />

            <button
              type="submit"
              disabled={saving}
              style={
                styles.primaryButton
              }
            >
              Add story
            </button>
          </form>

          <div
            style={
              styles.storyGrid
            }
          >
            {stories.length === 0 ? (
              <EmptySection
                icon={<FaCamera />}
                title="No active stories"
                text="Upload a travel photo that remains available for 24 hours."
              />
            ) : (
              stories.map(
                (story) => (
                  <StoryCard
                    key={getId(story)}
                    story={story}
                  />
                )
              )
            )}
          </div>
        </section>
      ) : null}

      {activeTab === "friends" ? (
        <div
          style={
            styles.friendsLayout
          }
        >
          <section
            style={
              styles.contentCard
            }
          >
            <SectionHeader
              eyebrow="Connections"
              title="Friend requests"
              count={
                friendRequests.length
              }
            />

            {friendRequests.length ===
            0 ? (
              <EmptySection
                icon={
                  <FaUserFriends />
                }
                title="No pending requests"
                text="New friend requests will appear here."
              />
            ) : (
              <div
                style={
                  styles.peopleGrid
                }
              >
                {friendRequests.map(
                  (request) => (
                    <PersonCard
                      key={request.id}
                      user={
                        request.user
                      }
                      actions={
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleAcceptFriend(
                                request.id
                              )
                            }
                            style={
                              styles.acceptButton
                            }
                          >
                            <FaCheck />
                            Accept
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveFriend(
                                request.id
                              )
                            }
                            style={
                              styles.declineButton
                            }
                            title="Decline request"
                          >
                            <FaTimes />
                          </button>
                        </>
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>

          <section
            style={
              styles.contentCard
            }
          >
            <SectionHeader
              eyebrow="Your network"
              title="Friends"
              count={friends.length}
            />

            {friends.length === 0 ? (
              <EmptySection
                icon={<FaUsers />}
                title="No friends yet"
                text="Find travelers and send friend requests."
              />
            ) : (
              <div
                style={
                  styles.peopleGrid
                }
              >
                {friends.map(
                  (friend) => (
                    <PersonCard
                      key={
                        friend.friendshipId
                      }
                      user={friend.user}
                      actions={
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveFriend(
                              friend.friendshipId
                            )
                          }
                          style={
                            styles.secondaryButton
                          }
                        >
                          Remove
                        </button>
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>

          <section
            style={
              styles.contentCard
            }
          >
            <SectionHeader
              eyebrow="Discover"
              title="Find travelers"
            />

            <div
              style={
                styles.searchBox
              }
            >
              <FaSearch />

              <input
                value={peopleSearch}
                onChange={(event) =>
                  setPeopleSearch(
                    event.target.value
                  )
                }
                placeholder="Search by name"
                style={
                  styles.searchInput
                }
              />
            </div>

            <div
              style={
                styles.peopleGrid
              }
            >
              {filteredPeople.length ===
              0 ? (
                <EmptySection
                  icon={<FaSearch />}
                  title="No travelers found"
                  text="Try another name."
                />
              ) : (
                filteredPeople.map(
                  (person) => (
                    <PersonCard
                      key={person.id}
                      user={person}
                      actions={
                        <FriendAction
                          person={person}
                          onAdd={() =>
                            handleAddFriend(
                              person.id
                            )
                          }
                          onAccept={() =>
                            handleAcceptFriend(
                              person
                                .relationship
                                ?.friendshipId
                            )
                          }
                          onRemove={() =>
                            handleRemoveFriend(
                              person
                                .relationship
                                ?.friendshipId
                            )
                          }
                        />
                      }
                    />
                  )
                )
              )}
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "about" ? (
        <div
          style={
            styles.aboutLayout
          }
        >
          <section
            style={
              styles.contentCard
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
                  Profile details
                </span>

                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  About
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingProfile(
                    true
                  )
                }
                style={
                  styles.secondaryButton
                }
              >
                <FaEdit />
                Edit
              </button>
            </div>

            <div
              style={
                styles.aboutGrid
              }
            >
              <AboutItem
                icon={
                  <FaMapMarkerAlt />
                }
                label="Location"
                value={
                  profile.location ||
                  "Not provided"
                }
              />

              <AboutItem
                icon={<FaCompass />}
                label="Travel style"
                value={
                  profile.travelStyle ||
                  "Mixed"
                }
              />

              <AboutItem
                icon={<FaGlobe />}
                label="Favorite destination"
                value={
                  profile.favoriteDestination ||
                  "Not provided"
                }
              />

              <AboutItem
                icon={<FaGlobe />}
                label="Visited countries"
                value={
                  profile.visitedCountries
                    ?.join(", ") ||
                  "No countries added"
                }
              />

              <AboutItem
                icon={
                  <FaUserFriends />
                }
                label="Travel interests"
                value={
                  profile.interests
                    ?.join(", ") ||
                  "No interests added"
                }
              />

              <AboutItem
                icon={<FaUsers />}
                label="Account type"
                value={
                  user.role ||
                  "client"
                }
              />
            </div>
          </section>

          <TripLinks />
        </div>
      ) : null}

      {editingProfile ? (
        <div
          style={
            styles.modalBackdrop
          }
        >
          <form
            onSubmit={
              handleProfileSubmit
            }
            style={styles.modal}
          >
            <div
              style={
                styles.modalHeader
              }
            >
              <div>
                <span
                  style={
                    styles.eyebrow
                  }
                >
                  Profile settings
                </span>

                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  Edit profile
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingProfile(
                    false
                  )
                }
                style={
                  styles.closeButton
                }
              >
                ×
              </button>
            </div>

            <div
              style={
                styles.formGrid
              }
            >
              <label
                style={styles.field}
              >
                <span>
                  Profile photo
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setAvatarFile(
                      event.target
                        .files?.[0] ||
                        null
                    )
                  }
                  style={styles.input}
                />
              </label>

              <label
                style={styles.field}
              >
                <span>
                  Cover image
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setCoverFile(
                      event.target
                        .files?.[0] ||
                        null
                    )
                  }
                  style={styles.input}
                />
              </label>

              <label
                style={
                  styles.fullField
                }
              >
                <span>
                  Biography
                </span>

                <textarea
                  name="bio"
                  value={
                    profileForm.bio
                  }
                  onChange={
                    handleProfileChange
                  }
                  maxLength={300}
                  rows={4}
                  style={styles.input}
                />
              </label>

              <ProfileField
                label="Location"
                name="location"
                value={
                  profileForm.location
                }
                onChange={
                  handleProfileChange
                }
              />

              <ProfileField
                label="Favorite destination"
                name="favoriteDestination"
                value={
                  profileForm.favoriteDestination
                }
                onChange={
                  handleProfileChange
                }
              />

              <label
                style={styles.field}
              >
                <span>
                  Travel style
                </span>

                <select
                  name="travelStyle"
                  value={
                    profileForm.travelStyle
                  }
                  onChange={
                    handleProfileChange
                  }
                  style={styles.input}
                >
                  <option value="Adventure">
                    Adventure
                  </option>

                  <option value="Relaxation">
                    Relaxation
                  </option>

                  <option value="Culture">
                    Culture
                  </option>

                  <option value="Food">
                    Food
                  </option>

                  <option value="Nature">
                    Nature
                  </option>

                  <option value="Business">
                    Business
                  </option>

                  <option value="Mixed">
                    Mixed
                  </option>
                </select>
              </label>

              <ProfileField
                label="Visited countries"
                name="visitedCountries"
                value={
                  profileForm.visitedCountries
                }
                onChange={
                  handleProfileChange
                }
                placeholder="Lebanon, France, Turkey"
              />

              <label
                style={
                  styles.fullField
                }
              >
                <span>
                  Interests
                </span>

                <input
                  name="interests"
                  value={
                    profileForm.interests
                  }
                  onChange={
                    handleProfileChange
                  }
                  placeholder="Hiking, food, beaches, history"
                  style={styles.input}
                />
              </label>
            </div>

            <div
              style={
                styles.modalActions
              }
            >
              <button
                type="button"
                onClick={() =>
                  setEditingProfile(
                    false
                  )
                }
                style={
                  styles.secondaryButton
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={
                  styles.primaryButton
                }
              >
                {saving
                  ? "Saving..."
                  : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </PublicPageLayout>
  );
}

function StatButton({
  value,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.statButton}
    >
      <strong>{value}</strong>
      <span>{label}</span>
    </button>
  );
}

function ProfileField({
  label,
  ...props
}) {
  return (
    <label style={styles.field}>
      <span>{label}</span>

      <input
        {...props}
        style={styles.input}
      />
    </label>
  );
}

function ProfileSummary({
  profile,
}) {
  return (
    <section style={styles.sideCard}>
      <h3 style={styles.sideTitle}>
        Intro
      </h3>

      <p style={styles.introText}>
        {profile.bio ||
          "No biography added."}
      </p>

      <div style={styles.introList}>
        <span
          style={styles.inlineMeta}
        >
          <FaMapMarkerAlt />

          {profile.location ||
            "Location not added"}
        </span>

        <span
          style={styles.inlineMeta}
        >
          <FaCompass />

          {profile.travelStyle ||
            "Mixed"}
        </span>

        <span
          style={styles.inlineMeta}
        >
          <FaGlobe />

          {profile.favoriteDestination ||
            "Favorite destination not added"}
        </span>
      </div>
    </section>
  );
}

function TripLinks() {
  return (
    <section style={styles.sideCard}>
      <h3 style={styles.sideTitle}>
        Trip pages
      </h3>

      <div style={styles.tripLinks}>
        <Link
          to="/trips"
          style={styles.tripLink}
        >
          Explore Trips
          <span>→</span>
        </Link>

        <Link
          to="/private-trip"
          style={styles.tripLink}
        >
          Create Private Trip
          <span>→</span>
        </Link>

        <Link
          to="/my-requests"
          style={styles.tripLink}
        >
          My Requests
          <span>→</span>
        </Link>

        <Link
          to="/map"
          style={styles.tripLink}
        >
          Travel Map
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}

function FriendsPreview({
  friends,
  requests,
  onAccept,
}) {
  return (
    <>
      {requests.length > 0 ? (
        <section
          style={styles.sideCard}
        >
          <h3
            style={styles.sideTitle}
          >
            Friend requests
          </h3>

          {requests
            .slice(0, 4)
            .map((request) => (
              <div
                key={request.id}
                style={
                  styles.previewPerson
                }
              >
                <UserAvatar
                  user={
                    request.user
                  }
                  image={resolveMediaUrl(
                    request.user
                      ?.avatar
                  )}
                  size={42}
                />

                <div
                  style={
                    styles.previewPersonName
                  }
                >
                  <Link
                    to={`/people/${request.user.id}`}
                    style={
                      styles.personLink
                    }
                  >
                    {
                      request.user
                        .fullName
                    }
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onAccept(
                      request.id
                    )
                  }
                  style={
                    styles.iconAcceptButton
                  }
                  title="Accept request"
                >
                  <FaCheck />
                </button>
              </div>
            ))}
        </section>
      ) : null}

      <section style={styles.sideCard}>
        <div
          style={
            styles.sideTitleRow
          }
        >
          <h3
            style={styles.sideTitle}
          >
            Friends
          </h3>

          <span>
            {friends.length}
          </span>
        </div>

        {friends.length === 0 ? (
          <p style={styles.emptyText}>
            No friends yet.
          </p>
        ) : (
          friends
            .slice(0, 7)
            .map((friend) => (
              <div
                key={
                  friend.friendshipId
                }
                style={
                  styles.previewPerson
                }
              >
                <UserAvatar
                  user={friend.user}
                  image={resolveMediaUrl(
                    friend.user
                      ?.avatar
                  )}
                  size={42}
                />

                <Link
                  to={`/people/${friend.user.id}`}
                  style={
                    styles.personLink
                  }
                >
                  {
                    friend.user
                      .fullName
                  }
                </Link>
              </div>
            ))
        )}
      </section>
    </>
  );
}

function PostCard({
  post,
  onLike,
  commentValue,
  onCommentChange,
  onComment,
}) {
  const image = resolveMediaUrl(
    post.image
  );

  const authorAvatar =
    resolveMediaUrl(
      post.author?.avatar
    );

  const postId = getId(post);

  return (
    <article style={styles.postCard}>
      <div style={styles.postHeader}>
        <UserAvatar
          user={post.author}
          image={authorAvatar}
          size={48}
        />

        <div
          style={
            styles.postAuthorBlock
          }
        >
          <Link
            to={`/people/${post.author?.id}`}
            style={styles.authorName}
          >
            {post.author
              ?.fullName ||
              "Traveler"}
          </Link>

          <div
            style={styles.postDate}
          >
            {post.createdAt
              ? new Date(
                  post.createdAt
                ).toLocaleString()
              : "Just now"}

            {post.destination ? (
              <>
                <span>·</span>
                <FaMapMarkerAlt />
                <span>
                  {post.destination}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {post.tripTitle ? (
        <h3
          style={
            styles.tripPostTitle
          }
        >
          {post.tripTitle}
        </h3>
      ) : null}

      {post.content ? (
        <p
          style={
            styles.postContent
          }
        >
          {post.content}
        </p>
      ) : null}

      {image ? (
        <img
          src={image}
          alt={
            post.tripTitle ||
            "Travel post"
          }
          style={styles.postImage}
        />
      ) : null}

      <div style={styles.postCounts}>
        <span>
          {post.likesCount || 0}{" "}
          likes
        </span>

        <span>
          {post.comments?.length ||
            0}{" "}
          comments
        </span>
      </div>

      <div
        style={styles.postButtons}
      >
        <button
          type="button"
          onClick={onLike}
          style={{
            ...styles.postActionButton,

            color: post.likedByMe
              ? "#dc2626"
              : "#475569",
          }}
        >
          <FaHeart />
          Like
        </button>

        <button
          type="button"
          onClick={() =>
            document
              .getElementById(
                `comment-${postId}`
              )
              ?.focus()
          }
          style={
            styles.postActionButton
          }
        >
          <FaComment />
          Comment
        </button>
      </div>

      <div
        style={
          styles.commentsList
        }
      >
        {post.comments
          ?.slice(-4)
          .map((comment) => (
            <div
              key={getId(comment)}
              style={
                styles.commentBubble
              }
            >
              <strong>
                {comment.author
                  ?.fullName ||
                  "Traveler"}
              </strong>

              <span>
                {comment.text}
              </span>
            </div>
          ))}
      </div>

      <div
        style={
          styles.commentComposer
        }
      >
        <input
          id={`comment-${postId}`}
          value={commentValue}
          onChange={(event) =>
            onCommentChange(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (
              event.key ===
              "Enter"
            ) {
              event.preventDefault();
              onComment();
            }
          }}
          placeholder="Write a comment..."
          maxLength={500}
          style={
            styles.commentInput
          }
        />

        <button
          type="button"
          onClick={onComment}
          style={
            styles.commentSendButton
          }
          title="Send comment"
        >
          <FaPaperPlane />
        </button>
      </div>
    </article>
  );
}

function StoryCard({ story }) {
  const image = resolveMediaUrl(
    story.image
  );

  const avatar = resolveMediaUrl(
    story.author?.avatar
  );

  return (
    <article
      style={{
        ...styles.storyCard,

        backgroundImage: `linear-gradient(transparent 35%, rgba(15, 23, 42, 0.94)), url("${image}")`,
      }}
    >
      <UserAvatar
        user={story.author}
        image={avatar}
        size={46}
      />

      <div>
        <Link
          to={`/people/${story.author?.id}`}
          style={styles.storyName}
        >
          {story.author
            ?.fullName ||
            "Traveler"}
        </Link>

        <p
          style={
            styles.storyCaption
          }
        >
          {story.caption ||
            story.destination ||
            "Travel story"}
        </p>
      </div>
    </article>
  );
}

function PersonCard({
  user,
  actions,
}) {
  const avatar = resolveMediaUrl(
    user?.avatar
  );

  return (
    <article
      style={styles.personCard}
    >
      <UserAvatar
        user={user}
        image={avatar}
        size={72}
      />

      <div
        style={
          styles.personInformation
        }
      >
        <Link
          to={`/people/${user.id}`}
          style={
            styles.personCardName
          }
        >
          {user.fullName ||
            user.name ||
            "Traveler"}
        </Link>

        <span
          style={
            styles.personCardMeta
          }
        >
          {user.location ||
            user.travelStyle ||
            "Traveler"}
        </span>
      </div>

      <div
        style={styles.personActions}
      >
        {actions}
      </div>
    </article>
  );
}

function FriendAction({
  person,
  onAdd,
  onAccept,
  onRemove,
}) {
  const relationship =
    person.relationship || {};

  if (
    relationship.status ===
    "accepted"
  ) {
    return (
      <button
        type="button"
        onClick={onRemove}
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
          styles.pendingButton
        }
      >
        Request sent
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
        onClick={onAccept}
        style={
          styles.acceptButton
        }
      >
        <FaCheck />
        Accept
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      style={styles.primaryButton}
    >
      <FaUserPlus />
      Add friend
    </button>
  );
}

function UserAvatar({
  user,
  image,
  size = 48,
}) {
  const letter = String(
    user?.fullName ||
      user?.name ||
      "T"
  )
    .charAt(0)
    .toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt={
          user?.fullName ||
          "Traveler"
        }
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        color: "#ffffff",
        fontWeight: 900,
        background:
          "linear-gradient(135deg, #2563eb, #38bdf8)",
      }}
    >
      {letter}
    </div>
  );
}

function AboutItem({
  icon,
  label,
  value,
}) {
  return (
    <div style={styles.aboutItem}>
      <div style={styles.aboutIcon}>
        {icon}
      </div>

      <div>
        <span
          style={styles.aboutLabel}
        >
          {label}
        </span>

        <strong
          style={styles.aboutValue}
        >
          {value}
        </strong>
      </div>
    </div>
  );
}

function EmptySection({
  icon,
  title,
  text,
}) {
  return (
    <div
      style={styles.emptySection}
    >
      <div style={styles.emptyIcon}>
        {icon}
      </div>

      <h3 style={styles.emptyTitle}>
        {title}
      </h3>

      <p style={styles.emptyText}>
        {text}
      </p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  count,
}) {
  return (
    <div
      style={styles.sectionHeader}
    >
      <div>
        <span style={styles.eyebrow}>
          {eyebrow}
        </span>

        <h2
          style={styles.sectionTitle}
        >
          {title}
        </h2>
      </div>

      {typeof count === "number" ? (
        <span
          style={styles.countBadge}
        >
          {count}
        </span>
      ) : null}
    </div>
  );
}

const styles = {
  loadingBox: {
    minHeight: 300,
    display: "grid",
    placeItems: "center",
    background: "#ffffff",
    borderRadius: 22,
    color: "#64748b",
    fontWeight: 800,
  },

  profileHeader: {
    overflow: "hidden",
    background: "#ffffff",
    border:
      "1px solid #dbeafe",
    borderRadius: 26,
    boxShadow:
      "0 20px 55px rgba(15, 23, 42, 0.1)",
    marginBottom: 20,
  },

  cover: {
    height: 300,
    position: "relative",
    padding: 22,
    boxSizing: "border-box",
    backgroundImage:
      "linear-gradient(135deg, #0f172a, #2563eb 58%, #38bdf8)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  editCoverButton: {
    position: "absolute",
    right: 22,
    bottom: 22,
    border: 0,
    borderRadius: 13,
    padding: "11px 15px",
    background:
      "rgba(255, 255, 255, 0.94)",
    color: "#0f172a",
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  profileInformation: {
    position: "relative",
    padding: "0 30px 25px",
  },

  avatarFrame: {
    width: 158,
    height: 158,
    padding: 6,
    borderRadius: "50%",
    background: "#ffffff",
    marginTop: -79,
    boxShadow:
      "0 16px 40px rgba(15, 23, 42, 0.2)",
  },

  avatar: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%",
  },

  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    color: "#ffffff",
    fontSize: 55,
    fontWeight: 900,
    background:
      "linear-gradient(135deg, #2563eb, #38bdf8)",
  },

  identityRow: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: 18,
    flexWrap: "wrap",
    marginTop: 17,
  },

  profileName: {
    margin: "0 0 8px",
    color: "#0f172a",
    fontSize: 34,
  },

  profileMeta: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    color: "#64748b",
    fontWeight: 700,
  },

  inlineMeta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  },

  profileBio: {
    maxWidth: 760,
    margin: "18px 0",
    color: "#475569",
    lineHeight: 1.75,
  },

  profileStats: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  statButton: {
    minWidth: 105,
    border: 0,
    borderRadius: 14,
    padding: "11px 16px",
    background: "#f8fafc",
    color: "#0f172a",
    cursor: "pointer",
    display: "grid",
    gap: 3,
    textAlign: "left",
  },

  tabs: {
    display: "flex",
    gap: 4,
    borderTop:
      "1px solid #e2e8f0",
    padding: "0 24px",
    overflowX: "auto",
  },

  tabButton: {
    position: "relative",
    border: 0,
    borderBottom:
      "3px solid transparent",
    padding: "17px 22px",
    background: "transparent",
    color: "#64748b",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  activeTabButton: {
    color: "#2563eb",
    borderBottomColor: "#2563eb",
  },

  notificationBadge: {
    marginLeft: 7,
    display: "inline-grid",
    placeItems: "center",
    minWidth: 20,
    height: 20,
    padding: "0 5px",
    borderRadius: 999,
    background: "#dc2626",
    color: "#ffffff",
    fontSize: 11,
  },

  errorBox: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
    background: "#fee2e2",
    color: "#991b1b",
  },

  successBox: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
    background: "#dcfce7",
    color: "#166534",
  },

  facebookLayout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(220px, 0.75fr) minmax(0, 1.65fr) minmax(220px, 0.75fr)",
    gap: 20,
    alignItems: "start",
  },

  sideCard: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 19,
    border:
      "1px solid #dbeafe",
    background: "#ffffff",
    boxShadow:
      "0 12px 32px rgba(15, 23, 42, 0.06)",
  },

  sideTitle: {
    margin: "0 0 13px",
    color: "#0f172a",
    fontSize: 18,
  },

  sideTitleRow: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  introText: {
    color: "#475569",
    lineHeight: 1.65,
  },

  introList: {
    display: "grid",
    gap: 11,
    color: "#475569",
    fontSize: 14,
  },

  tripLinks: {
    display: "grid",
    gap: 8,
  },

  tripLink: {
    display: "flex",
    justifyContent:
      "space-between",
    padding: "11px 12px",
    borderRadius: 13,
    color: "#1e3a8a",
    background: "#eff6ff",
    textDecoration: "none",
    fontWeight: 800,
  },

  createPostCard: {
    padding: 18,
    borderRadius: 20,
    background: "#ffffff",
    border:
      "1px solid #dbeafe",
    boxShadow:
      "0 13px 34px rgba(15, 23, 42, 0.07)",
    marginBottom: 18,
  },

  createPostHeader: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },

  postTextarea: {
    flex: 1,
    minHeight: 78,
    resize: "vertical",
    border: 0,
    outline: 0,
    borderRadius: 18,
    padding: 14,
    background: "#f1f5f9",
    font: "inherit",
    boxSizing: "border-box",
  },

  postFields: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
    marginTop: 13,
  },

  createPostActions: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
    paddingTop: 14,
    borderTop:
      "1px solid #e2e8f0",
  },

  uploadButton: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#15803d",
    fontWeight: 900,
    cursor: "pointer",
  },

  feed: {
    display: "grid",
    gap: 18,
  },

  postCard: {
    padding: 19,
    borderRadius: 21,
    background: "#ffffff",
    border:
      "1px solid #dbeafe",
    boxShadow:
      "0 13px 36px rgba(15, 23, 42, 0.07)",
  },

  postHeader: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },

  postAuthorBlock: {
    flex: 1,
    minWidth: 0,
  },

  authorName: {
    color: "#0f172a",
    textDecoration: "none",
    fontWeight: 900,
  },

  postDate: {
    display: "flex",
    gap: 5,
    alignItems: "center",
    flexWrap: "wrap",
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },

  tripPostTitle: {
    margin: "17px 0 6px",
    color: "#0f172a",
  },

  postContent: {
    color: "#334155",
    lineHeight: 1.75,
    whiteSpace: "pre-wrap",
  },

  postImage: {
    width: "100%",
    maxHeight: 580,
    objectFit: "cover",
    borderRadius: 17,
    marginTop: 12,
  },

  postCounts: {
    display: "flex",
    justifyContent:
      "space-between",
    color: "#64748b",
    fontSize: 13,
    padding: "13px 2px",
  },

  postButtons: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, 1fr)",
    borderTop:
      "1px solid #e2e8f0",
    borderBottom:
      "1px solid #e2e8f0",
  },

  postActionButton: {
    border: 0,
    background: "transparent",
    padding: 12,
    fontWeight: 900,
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  commentsList: {
    display: "grid",
    gap: 8,
    marginTop: 12,
  },

  commentBubble: {
    display: "grid",
    justifySelf: "start",
    gap: 3,
    maxWidth: "85%",
    padding: "9px 13px",
    borderRadius: 15,
    background: "#f1f5f9",
    color: "#334155",
    fontSize: 14,
  },

  commentComposer: {
    display: "grid",
    gridTemplateColumns:
      "1fr 42px",
    gap: 8,
    marginTop: 12,
  },

  commentInput: {
    padding: "11px 14px",
    borderRadius: 999,
    border:
      "1px solid #cbd5e1",
    background: "#f8fafc",
  },

  commentSendButton: {
    width: 42,
    height: 42,
    border: 0,
    borderRadius: "50%",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
  },

  previewPerson: {
    display: "flex",
    gap: 9,
    alignItems: "center",
    padding: "9px 0",
    borderBottom:
      "1px solid #f1f5f9",
  },

  previewPersonName: {
    flex: 1,
    minWidth: 0,
  },

  personLink: {
    color: "#0f172a",
    fontWeight: 800,
    textDecoration: "none",
  },

  iconAcceptButton: {
    width: 34,
    height: 34,
    border: 0,
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#15803d",
    cursor: "pointer",
  },

  contentCard: {
    padding: 24,
    borderRadius: 23,
    background: "#ffffff",
    border:
      "1px solid #dbeafe",
    boxShadow:
      "0 15px 40px rgba(15, 23, 42, 0.07)",
    marginBottom: 20,
  },

  sectionHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 20,
  },

  eyebrow: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.11em",
  },

  sectionTitle: {
    margin: "5px 0 0",
    color: "#0f172a",
    fontSize: 24,
  },

  storyCreator: {
    display: "grid",
    gridTemplateColumns:
      "minmax(180px, 1.2fr) repeat(2, minmax(160px, 1fr)) auto",
    gap: 12,
    marginBottom: 22,
  },

  storyUpload: {
    minHeight: 48,
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "10px 14px",
    borderRadius: 14,
    border:
      "1px dashed #60a5fa",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 800,
  },

  storyGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(170px, 1fr))",
    gap: 16,
  },

  storyCard: {
    height: 280,
    padding: 15,
    borderRadius: 21,
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    justifyContent:
      "space-between",
    boxShadow:
      "0 16px 36px rgba(15, 23, 42, 0.18)",
  },

  storyName: {
    color: "#ffffff",
    fontWeight: 900,
    textDecoration: "none",
  },

  storyCaption: {
    margin: "5px 0 0",
    fontSize: 13,
    lineHeight: 1.5,
  },

  friendsLayout: {
    display: "grid",
    gap: 20,
  },

  countBadge: {
    minWidth: 32,
    height: 32,
    padding: "0 9px",
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: 900,
  },

  peopleGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 14,
  },

  personCard: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    padding: 14,
    borderRadius: 17,
    border:
      "1px solid #e2e8f0",
    background: "#ffffff",
  },

  personInformation: {
    flex: 1,
    minWidth: 0,
  },

  personCardName: {
    display: "block",
    color: "#0f172a",
    fontWeight: 900,
    textDecoration: "none",
  },

  personCardMeta: {
    display: "block",
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
  },

  personActions: {
    display: "flex",
    gap: 7,
    alignItems: "center",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 14px",
    borderRadius: 14,
    border:
      "1px solid #cbd5e1",
    marginBottom: 18,
    color: "#64748b",
  },

  searchInput: {
    flex: 1,
    padding: "13px 0",
    border: 0,
    outline: 0,
    font: "inherit",
  },

  aboutLayout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 2fr) minmax(250px, 0.8fr)",
    gap: 20,
    alignItems: "start",
  },

  aboutGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
  },

  aboutItem: {
    display: "flex",
    gap: 13,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    background: "#f8fafc",
    border:
      "1px solid #e2e8f0",
  },

  aboutIcon: {
    width: 43,
    height: 43,
    display: "grid",
    placeItems: "center",
    borderRadius: 13,
    background: "#dbeafe",
    color: "#2563eb",
    flexShrink: 0,
  },

  aboutLabel: {
    display: "block",
    color: "#64748b",
    fontSize: 12,
    marginBottom: 4,
  },

  aboutValue: {
    display: "block",
    color: "#0f172a",
  },

  primaryButton: {
    border: 0,
    borderRadius: 13,
    padding: "11px 16px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
  },

  secondaryButton: {
    border:
      "1px solid #cbd5e1",
    borderRadius: 12,
    padding: "9px 13px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  },

  acceptButton: {
    border: 0,
    borderRadius: 12,
    padding: "9px 13px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  },

  declineButton: {
    width: 38,
    height: 38,
    border: 0,
    borderRadius: 12,
    background: "#fee2e2",
    color: "#b91c1c",
    cursor: "pointer",
  },

  pendingButton: {
    border: 0,
    borderRadius: 12,
    padding: "9px 13px",
    background: "#f1f5f9",
    color: "#64748b",
    fontWeight: 800,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    borderRadius: 13,
    border:
      "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    font: "inherit",
  },

  emptySection: {
    minHeight: 180,
    display: "grid",
    justifyItems: "center",
    alignContent: "center",
    textAlign: "center",
    padding: 28,
    borderRadius: 18,
    background: "#f8fafc",
    color: "#64748b",
    gridColumn: "1 / -1",
  },

  emptyIcon: {
    width: 55,
    height: 55,
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#2563eb",
    fontSize: 22,
  },

  emptyTitle: {
    margin: "12px 0 4px",
    color: "#0f172a",
  },

  emptyText: {
    color: "#64748b",
    fontSize: 14,
    margin: 0,
  },

  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 3000,
    padding: 20,
    display: "grid",
    placeItems: "center",
    background:
      "rgba(15, 23, 42, 0.68)",
  },

  modal: {
    width: "100%",
    maxWidth: 780,
    maxHeight: "92vh",
    overflowY: "auto",
    padding: 26,
    boxSizing: "border-box",
    borderRadius: 24,
    background: "#ffffff",
    boxShadow:
      "0 30px 85px rgba(0, 0, 0, 0.3)",
  },

  modalHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  closeButton: {
    width: 40,
    height: 40,
    border: 0,
    borderRadius: "50%",
    background: "#f1f5f9",
    color: "#0f172a",
    fontSize: 24,
    cursor: "pointer",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },

  field: {
    display: "grid",
    gap: 7,
    color: "#334155",
    fontWeight: 800,
    fontSize: 13,
  },

  fullField: {
    display: "grid",
    gap: 7,
    gridColumn: "1 / -1",
    color: "#334155",
    fontWeight: 800,
    fontSize: 13,
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },
};
import {
  apiRequest,
} from "./http.js";

const API_ORIGIN = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export function resolveMediaUrl(
  value
) {
  const path =
    String(
      value || ""
    ).trim();

  if (!path) {
    return "";
  }

  if (
    /^https?:\/\//i.test(
      path
    ) ||
    path.startsWith(
      "data:"
    ) ||
    path.startsWith(
      "blob:"
    )
  ) {
    return path;
  }

  if (
    path.startsWith(
      "/uploads/"
    )
  ) {
    return `${API_ORIGIN}${path}`;
  }

  return path;
}

export function getMyProfile() {
  return apiRequest(
    "/social/me"
  );
}

export function updateMyProfile(
  formData
) {
  return apiRequest(
    "/social/me",
    {
      method: "PATCH",
      body: formData,
    }
  );
}

export function getPeople(
  search = ""
) {
  const query =
    search
      ? `?search=${encodeURIComponent(
          search
        )}`
      : "";

  return apiRequest(
    `/social/people${query}`
  );
}

export function getPublicProfile(
  userId
) {
  return apiRequest(
    `/social/users/${userId}`
  );
}

export function sendFriendRequest(
  userId
) {
  return apiRequest(
    `/social/friends/${userId}`,
    {
      method: "POST",
    }
  );
}

export function acceptFriendRequest(
  friendshipId
) {
  return apiRequest(
    `/social/friends/${friendshipId}/accept`,
    {
      method: "PATCH",
    }
  );
}

export function removeFriendship(
  friendshipId
) {
  return apiRequest(
    `/social/friends/${friendshipId}`,
    {
      method: "DELETE",
    }
  );
}

export function getFriends() {
  return apiRequest(
    "/social/friends"
  );
}

export function getFriendRequests() {
  return apiRequest(
    "/social/friend-requests"
  );
}

export function getFeed() {
  return apiRequest(
    "/social/posts/feed"
  );
}

export function createPost(
  formData
) {
  return apiRequest(
    "/social/posts",
    {
      method: "POST",
      body: formData,
    }
  );
}

export function togglePostLike(
  postId
) {
  return apiRequest(
    `/social/posts/${postId}/like`,
    {
      method: "POST",
    }
  );
}

export function addPostComment(
  postId,
  text
) {
  return apiRequest(
    `/social/posts/${postId}/comments`,
    {
      method: "POST",
      body: {
        text,
      },
    }
  );
}

export function deletePost(
  postId
) {
  return apiRequest(
    `/social/posts/${postId}`,
    {
      method: "DELETE",
    }
  );
}

export function getStories() {
  return apiRequest(
    "/social/stories"
  );
}

export function createStory(
  formData
) {
  return apiRequest(
    "/social/stories",
    {
      method: "POST",
      body: formData,
    }
  );
}

export function deleteStory(
  storyId
) {
  return apiRequest(
    `/social/stories/${storyId}`,
    {
      method: "DELETE",
    }
  );
}
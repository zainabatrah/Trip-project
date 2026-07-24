import api from "../services/api.js";
import { API_ROOT } from "./apiBase.js";

export function getSocialMediaUrl(
  value
) {
  const normalized = String(
    value || ""
  ).trim();

  if (!normalized) {
    return "";
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `${API_ROOT}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}

export async function getSocialProfile() {
  const { data } = await api.get(
    "/social/profile"
  );

  return data;
}

export async function getSocialFeed() {
  const { data } = await api.get(
    "/social/feed"
  );

  return data;
}

export async function getFriendsHub(
  search = ""
) {
  const { data } = await api.get(
    "/social/friends",
    {
      params: {
        search,
      },
    }
  );

  return data;
}

export async function sendFriendRequest(
  recipientId
) {
  const { data } = await api.post(
    "/social/friendships/requests",
    {
      recipientId,
    }
  );

  return data;
}

export async function respondToFriendRequest(
  friendshipId,
  action
) {
  const { data } = await api.patch(
    `/social/friendships/${friendshipId}`,
    {
      action,
    }
  );

  return data;
}

export async function removeFriendship(
  friendshipId
) {
  const { data } = await api.delete(
    `/social/friendships/${friendshipId}`
  );

  return data;
}

function buildSocialFormData({
  content,
  imageFile,
}) {
  const formData = new FormData();

  if (content) {
    formData.append(
      "content",
      content
    );
  }

  if (imageFile) {
    formData.append(
      "image",
      imageFile
    );
  }

  return formData;
}

export async function createSocialPost({
  content,
  imageFile,
}) {
  const { data } = await api.post(
    "/social/posts",
    buildSocialFormData({
      content,
      imageFile,
    }),
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return data;
}

export async function deleteSocialPost(
  postId
) {
  const { data } = await api.delete(
    `/social/posts/${postId}`
  );

  return data;
}

export async function toggleSocialPostLike(
  postId
) {
  const { data } = await api.post(
    `/social/posts/${postId}/likes`
  );

  return data;
}

export async function createSocialStory({
  content,
  imageFile,
}) {
  const { data } = await api.post(
    "/social/stories",
    buildSocialFormData({
      content,
      imageFile,
    }),
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return data;
}

export async function deleteSocialStory(
  storyId
) {
  const { data } = await api.delete(
    `/social/stories/${storyId}`
  );

  return data;
}

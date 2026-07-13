import { getSocialMediaUrl } from "../../api/social.js";

export const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export function getUserAvatarUrl(
  user
) {
  return (
    getSocialMediaUrl(
      user?.profileImage
    ) || DEFAULT_AVATAR
  );
}

export function getContentImageUrl(
  value
) {
  return getSocialMediaUrl(value);
}

export function formatRelativeTime(
  value
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Now";
  }

  const diff =
    Date.now() - date.getTime();
  const minutes = Math.floor(
    diff / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
}

export function formatStoryTimeLeft(
  expiresAt
) {
  const date = new Date(
    expiresAt
  );
  const diff =
    date.getTime() - Date.now();

  if (
    Number.isNaN(date.getTime()) ||
    diff <= 0
  ) {
    return "Ending soon";
  }

  const hours = Math.floor(
    diff / (1000 * 60 * 60)
  );

  if (hours > 0) {
    return `${hours}h left`;
  }

  const minutes = Math.max(
    1,
    Math.floor(
      diff / (1000 * 60)
    )
  );

  return `${minutes}m left`;
}

export function getUserInitial(
  user
) {
  return String(
    user?.fullName ||
      user?.name ||
      user?.email ||
      "U"
  )
    .trim()
    .charAt(0)
    .toUpperCase();
}

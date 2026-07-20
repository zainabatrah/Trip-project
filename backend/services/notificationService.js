const Notification = require(
  "../models/Notification"
);
const User = require("../models/User");
const {
  getEffectiveUserRole,
} = require("../middleware/auth");

function uniqueIds(ids) {
  return [
    ...new Set(
      (Array.isArray(ids)
        ? ids
        : [ids]
      )
        .map((id) =>
          String(id || "").trim()
        )
        .filter(Boolean)
    ),
  ];
}

function normalizeText(
  value,
  maxLength
) {
  const text = String(
    value || ""
  ).trim();

  if (!text) {
    return "";
  }

  return maxLength
    ? text.slice(0, maxLength)
    : text;
}

async function createNotification({
  userId,
  type,
  title,
  message,
  link = "",
  metadata = {},
}) {
  try {
    const normalizedUserId =
      normalizeText(
        userId
      );

    if (
      !normalizedUserId
    ) {
      return null;
    }

    const notification =
      await Notification.create({
        user: normalizedUserId,
        type:
          normalizeText(
            type,
            80
          ) || "general",
        title:
          normalizeText(
            title,
            140
          ) || "Notification",
        message:
          normalizeText(
            message,
            600
          ) ||
          "You have a new notification.",
        link:
          normalizeText(
            link,
            240
          ),
        metadata:
          metadata &&
          typeof metadata ===
            "object"
            ? metadata
            : {},
      });

    return notification;
  } catch (error) {
    console.error(
      "Could not create notification:",
      error.message
    );

    return null;
  }
}

async function createNotifications({
  userIds,
  type,
  title,
  message,
  link = "",
  metadata = {},
}) {
  try {
    const normalizedUserIds =
      uniqueIds(userIds);

    if (
      normalizedUserIds.length ===
      0
    ) {
      return [];
    }

    const payload =
      normalizedUserIds.map(
        (userId) => ({
          user: userId,
          type:
            normalizeText(
              type,
              80
            ) || "general",
          title:
            normalizeText(
              title,
              140
            ) || "Notification",
          message:
            normalizeText(
              message,
              600
            ) ||
            "You have a new notification.",
          link:
            normalizeText(
              link,
              240
            ),
          metadata:
            metadata &&
            typeof metadata ===
              "object"
              ? metadata
              : {},
        })
      );

    return await Notification.insertMany(
      payload,
      {
        ordered: false,
      }
    );
  } catch (error) {
    console.error(
      "Could not create notifications:",
      error.message
    );

    return [];
  }
}

async function getOrganizerUserIds() {
  try {
    const users =
      await User.find({})
        .select("role email")
        .lean();

    return users
      .filter((user) =>
        [
          "organizer",
          "admin",
        ].includes(
          getEffectiveUserRole(
            user
          )
        )
      )
      .map((user) =>
        String(user._id)
      );
  } catch (error) {
    console.error(
      "Could not load organizer users:",
      error.message
    );

    return [];
  }
}

async function notifyOrganizers({
  type,
  title,
  message,
  link = "",
  metadata = {},
}) {
  const organizerUserIds =
    await getOrganizerUserIds();

  return createNotifications({
    userIds:
      organizerUserIds,
    type,
    title,
    message,
    link,
    metadata,
  });
}

module.exports = {
  createNotification,
  createNotifications,
  getOrganizerUserIds,
  notifyOrganizers,
};

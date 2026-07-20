const express = require("express");
const mongoose = require("mongoose");

const Notification = require(
  "../models/Notification"
);
const {
  requireAuth,
} = require("../middleware/auth");

const router = express.Router();

function serializeNotification(
  notification
) {
  return {
    id: String(
      notification?._id ||
        notification?.id ||
        ""
    ),
    _id: String(
      notification?._id ||
        notification?.id ||
        ""
    ),
    type:
      notification?.type ||
      "general",
    title:
      notification?.title ||
      "Notification",
    message:
      notification?.message ||
      "",
    link:
      notification?.link || "",
    readAt:
      notification?.readAt ||
      null,
    isRead: Boolean(
      notification?.readAt
    ),
    metadata:
      notification?.metadata &&
      typeof notification.metadata ===
        "object"
        ? notification.metadata
        : {},
    createdAt:
      notification?.createdAt ||
      null,
    updatedAt:
      notification?.updatedAt ||
      null,
  };
}

router.get(
  "/",
  requireAuth,
  async (
    req,
    res,
    next
  ) => {
    try {
      const rawLimit =
        Number(
          req.query.limit
        ) || 12;

      const limit =
        Math.min(
          Math.max(rawLimit, 1),
          50
        );

      const [
        notifications,
        unreadCount,
      ] = await Promise.all([
        Notification.find({
          user: req.user._id,
        })
          .sort({
            createdAt: -1,
          })
          .limit(limit)
          .lean(),
        Notification.countDocuments({
          user: req.user._id,
          readAt: null,
        }),
      ]);

      return res.status(200).json({
        success: true,
        unreadCount,
        notifications:
          notifications.map(
            serializeNotification
          ),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/read-all",
  requireAuth,
  async (
    req,
    res,
    next
  ) => {
    try {
      const now = new Date();

      await Notification.updateMany(
        {
          user: req.user._id,
          readAt: null,
        },
        {
          $set: {
            readAt: now,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "All notifications marked as read.",
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:id/read",
  requireAuth,
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid notification ID.",
        });
      }

      const notification =
        await Notification.findOne({
          _id: req.params.id,
          user: req.user._id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found.",
        });
      }

      if (!notification.readAt) {
        notification.readAt =
          new Date();
        await notification.save();
      }

      return res.status(200).json({
        success: true,
        notification:
          serializeNotification(
            notification.toObject()
          ),
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

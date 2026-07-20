const mongoose = require("mongoose");

const notificationSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      type: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
        index: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 140,
      },

      message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 600,
      },

      link: {
        type: String,
        default: "",
        trim: true,
        maxlength: 240,
      },

      readAt: {
        type: Date,
        default: null,
        index: true,
      },

      metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);

const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    image: {
      type: String,
      required: [
        true,
        "Story image is required.",
      ],
      trim: true,
    },

    caption: {
      type: String,
      trim: true,
      maxlength: [
        300,
        "Story caption cannot exceed 300 characters.",
      ],
      default: "",
    },

    destination: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    expiresAt: {
      type: Date,
      required: true,
      default: () =>
        new Date(
          Date.now() +
            24 * 60 * 60 * 1000
        ),
    },
  },
  {
    timestamps: true,
  }
);

/*
 * MongoDB automatically deletes
 * expired stories.
 */
storySchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

const Story = mongoose.model(
  "Story",
  storySchema
);

module.exports = Story;
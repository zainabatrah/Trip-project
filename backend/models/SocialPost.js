const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: [
        true,
        "Comment text is required.",
      ],
      trim: true,
      maxlength: [
        500,
        "Comment cannot exceed 500 characters.",
      ],
    },
  },
  {
    timestamps: true,
  }
);

const socialPostSchema =
  new mongoose.Schema(
    {
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      content: {
        type: String,
        trim: true,
        maxlength: [
          1500,
          "Post cannot exceed 1500 characters.",
        ],
        default: "",
      },

      image: {
        type: String,
        trim: true,
        default: "",
      },

      destination: {
        type: String,
        trim: true,
        maxlength: 150,
        default: "",
      },

      tripTitle: {
        type: String,
        trim: true,
        maxlength: 150,
        default: "",
      },

      trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        default: null,
      },

      likes: {
        type: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        default: [],
      },

      comments: {
        type: [commentSchema],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

socialPostSchema.index({
  createdAt: -1,
});

const SocialPost = mongoose.model(
  "SocialPost",
  socialPostSchema
);

module.exports = SocialPost;
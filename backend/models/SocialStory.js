const mongoose = require("mongoose");

function buildDefaultExpiry() {
  return new Date(
    Date.now() +
      24 * 60 * 60 * 1000
  );
}

const socialStorySchema =
  new mongoose.Schema(
    {
      author: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      content: {
        type: String,
        trim: true,
        maxlength: 280,
        default: "",
      },

      image: {
        type: String,
        default: "",
      },

      expiresAt: {
        type: Date,
        default: buildDefaultExpiry,
        index: {
          expires: 0,
        },
      },
    },
    {
      timestamps: true,
    }
  );

socialStorySchema.index({
  author: 1,
  expiresAt: -1,
});

module.exports = mongoose.model(
  "SocialStory",
  socialStorySchema
);

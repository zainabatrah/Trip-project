const mongoose = require("mongoose");

const socialPostSchema =
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
        maxlength: 1000,
        default: "",
      },

      image: {
        type: String,
        default: "",
      },

      likes: [
        {
          type:
            mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    {
      timestamps: true,
    }
  );

socialPostSchema.index({
  author: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "SocialPost",
  socialPostSchema
);

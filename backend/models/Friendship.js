const mongoose = require("mongoose");

const friendshipSchema =
  new mongoose.Schema(
    {
      pairKey: {
        type: String,
        required: [
          true,
          "Friendship pair key is required.",
        ],
        unique: true,
        trim: true,
        index: true,
      },

      requester: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [
          true,
          "Friendship requester is required.",
        ],
        index: true,
      },

      recipient: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [
          true,
          "Friendship recipient is required.",
        ],
        index: true,
      },

      status: {
        type: String,

        enum: {
          values: [
            "pending",
            "accepted",
          ],

          message:
            "Friendship status must be pending or accepted.",
        },

        default: "pending",
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

friendshipSchema.index({
  requester: 1,
  recipient: 1,
});

friendshipSchema.index({
  recipient: 1,
  status: 1,
});

friendshipSchema.pre(
  "validate",
  function validateFriendship(
    next
  ) {
    if (
      this.requester &&
      this.recipient &&
      String(this.requester) ===
        String(this.recipient)
    ) {
      return next(
        new Error(
          "A user cannot add themselves as a friend."
        )
      );
    }

    return next();
  }
);

const Friendship =
  mongoose.models.Friendship ||
  mongoose.model(
    "Friendship",
    friendshipSchema
  );

module.exports = Friendship;
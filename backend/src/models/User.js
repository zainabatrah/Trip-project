const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [
        true,
        "Full name is required.",
      ],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    email: {
      type: String,
      required: [
        true,
        "Email is required.",
      ],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "client",
        "organizer",
        "admin",
      ],
      default: "client",
      index: true,
    },

    idDocument: {
      type: String,
      required: [
        true,
        "ID document is required.",
      ],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model(
  "User",
  userSchema
);

module.exports = User;
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [
        300,
        "Bio cannot exceed 300 characters.",
      ],
      default: "",
    },

    location: {
      type: String,
      trim: true,
      maxlength: [
        120,
        "Location cannot exceed 120 characters.",
      ],
      default: "",
    },

    avatar: {
      type: String,
      trim: true,
      default: "",
    },

    coverImage: {
      type: String,
      trim: true,
      default: "",
    },

    travelStyle: {
      type: String,
      enum: [
        "Adventure",
        "Relaxation",
        "Culture",
        "Food",
        "Nature",
        "Business",
        "Mixed",
      ],
      default: "Mixed",
    },

    favoriteDestination: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    visitedCountries: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 80,
        },
      ],
      default: [],
    },

    interests: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 60,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model(
  "Profile",
  profileSchema
);

module.exports = Profile;
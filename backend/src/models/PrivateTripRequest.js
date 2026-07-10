import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["client", "organizer"],
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

const privateTripRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Trip title is required."],
      trim: true,
      maxlength: 150,
    },

    destination: {
      type: String,
      required: [true, "Destination is required."],
      trim: true,
      maxlength: 150,
    },

    startDate: {
      type: String,
      required: [true, "Start date is required."],
    },

    endDate: {
      type: String,
      required: [true, "End date is required."],
    },

    transportation: {
      type: String,
      required: [true, "Transportation is required."],
      enum: {
        values: ["Car", "Van", "Minibus", "Bus"],
        message: "Transportation must be Car, Van, Minibus, or Bus.",
      },
    },

    travelers: {
      type: Number,
      required: [true, "Number of travelers is required."],
      min: [1, "Travelers must be at least 1."],
    },

    budget: {
      type: Number,
      required: [true, "Budget is required."],
      min: [0, "Budget cannot be negative."],
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: [800, "Notes cannot exceed 800 characters."],
    },

    clientName: {
      type: String,
      default: "Client",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    organizerReply: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const PrivateTripRequest = mongoose.model(
  "PrivateTripRequest",
  privateTripRequestSchema
);

export default PrivateTripRequest;

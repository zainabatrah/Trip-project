const mongoose = require("mongoose");

const messageSchema =
  new mongoose.Schema(
    {
      sender: {
        type: String,
        enum: [
          "client",
          "organizer",
        ],
        required: true,
      },

      text: {
        type: String,
        required: [
          true,
          "Message text is required.",
        ],
        trim: true,
        maxlength: [
          1000,
          "Message cannot exceed 1000 characters.",
        ],
      },
    },
    {
      timestamps: true,
    }
  );

const privateTripRequestSchema =
  new mongoose.Schema(
    {
      client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true,
      },

      title: {
        type: String,
        required: [
          true,
          "Trip title is required.",
        ],
        trim: true,
        minlength: 3,
        maxlength: 150,
      },

      destination: {
        type: String,
        required: [
          true,
          "End trip is required.",
        ],
        trim: true,
        maxlength: 150,
      },

      pickupCity: {
        type: String,
        default: "",
        trim: true,
        maxlength: 150,
      },

      startDate: {
        type: Date,
        required: [
          true,
          "Start date is required.",
        ],
      },

      endDate: {
        type: Date,
        required: [
          true,
          "End date is required.",
        ],
      },

      transportation: {
        type: String,
        required: [
          true,
          "Transportation is required.",
        ],
        enum: {
          values: [
            "Car",
            "Van",
            "Minibus",
            "Bus",
          ],
          message:
            "Transportation must be Car, Van, Minibus, or Bus.",
        },
      },

      travelers: {
        type: Number,
        required: [
          true,
          "Number of travelers is required.",
        ],
        min: [
          1,
          "Travelers must be at least 1.",
        ],
      },

      budget: {
        type: Number,
        required: [
          true,
          "Budget is required.",
        ],
        min: [
          0,
          "Budget cannot be negative.",
        ],
      },

      notes: {
        type: String,
        default: "",
        trim: true,
        maxlength: [
          800,
          "Notes cannot exceed 800 characters.",
        ],
      },

      clientName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true,
      },

      status: {
        type: String,
        enum: [
          "PENDING",
          "APPROVED",
          "REJECTED",
          "POSTPONED",
        ],
        default: "PENDING",
        index: true,
      },

      organizerReply: {
        type: String,
        default: "",
        trim: true,
        maxlength: [
          1000,
          "Organizer reply cannot exceed 1000 characters.",
        ],
      },

      reviewedAt: {
        type: Date,
        default: null,
      },

      approvedTripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
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

privateTripRequestSchema.pre(
  "validate",
  function validateDates(next) {
    if (
      this.startDate &&
      this.endDate &&
      this.endDate < this.startDate
    ) {
      this.invalidate(
        "endDate",
        "End date cannot be before the start date."
      );
    }

    next();
  }
);

const PrivateTripRequest =
  mongoose.model(
    "PrivateTripRequest",
    privateTripRequestSchema
  );

module.exports = PrivateTripRequest;
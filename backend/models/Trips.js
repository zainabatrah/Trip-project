const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  country: {
    type: String,
    required: true
  },

  description: String,

  photo: String,

  price: Number,

  duration: Number,

  numberOfTravelers: {
      type: Number,
      default: 1
    },


reservedTravelers: {
  type: Number,
  default: 0
},

    status: {
      type: String,
      enum: ["planned", "ongoing", "completed"],
      default: "planned"
    },

    transportation: {
      type: String,
      enum: ["flight", "train", "bus", "car"],
      default: "flight"
    },

    tripType: {
      type: String,
      enum: ["adventure", "relax", "business", "family"],
      default: "adventure"
    },

    inclusions: [
      {
        type: String
      }
    ],

   places: [
      {
        city: {
          type: String,
          required: true
        },

         image: {
          type: String,
          required: true
        },

        latitude: {
          type: Number,
          required: true
        },

        longitude: {
          type: Number,
          required: true
        },

        days: {
          type: Number,
          required: true
        }
      }
    ]

} ,
  { timestamps: true }
);

const Trip = mongoose.model("Trip", tripSchema);
module.exports = Trip;
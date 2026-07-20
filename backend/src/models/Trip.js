const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    from: {
      type: String,
      required: true,
    },

    to: {
      type: String,
      required: true,
    },
    fromLocation: {
  lat: Number,
  lng: Number,
},

toLocation: {
  lat: Number,
  lng: Number,
},
stops: [
  {
    name: String,
    lat: Number,
    lng: Number,
  }
],
    date: {
      type: Date,
      required: true,
      index: true,
    },

    description: String,

    photo: String,

    price: Number,

    duration: Number,

    numberOfTravelers: {
      type: Number,
      default: 1,
    },

    reservedTravelers: {
      type: Number,
      default: 0,
    },
    
    transportation: {
      type: String,
      enum: ["flight", "train", "bus", "car"],
      default: "flight",
    },

    tripType: {
      type: String,
      enum: ["adventure", "relax", "business", "family"],
      default: "adventure",
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    inclusions: [
      {
        type: String,
      },
    ],

    places: [
      {
        city: {
          type: String,
          required: true,
        },

        image: {
          type: String,
          required: true,
        },

        latitude: {
          type: Number,
          required: true,
        },

        longitude: {
          type: Number,
          required: true,
        },

        days: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

tripSchema.virtual("status").get(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(this.date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(
    end.getDate() + Math.max(1, this.duration || 1) - 1
  );

  if (today < start) {
    return "planned";
  }

  if (today <= end) {
    return "ongoing";
  }

  return "completed";
});


// Include virtual fields in API responses
tripSchema.set("toJSON", { virtuals: true });
tripSchema.set("toObject", { virtuals: true });


const Trip = mongoose.model("Trip", tripSchema);


module.exports = Trip;

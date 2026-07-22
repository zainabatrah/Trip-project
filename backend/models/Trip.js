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

  from: {
    type: String,
    required: true
  },
    to: {
    type: String,
    required: true
  },
  fromLocation:{
lat:Number,
lng:Number,
  },
    toLocation:{
lat:Number,
lng:Number,
  },
  date:{
type:Date,
require:true,
index:true,
  },
  description: String,

  photo: String,

  price: Number,

duration: {
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ["hours", "days"],
    default: "days"
  }
},

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
rating:{
type:Number,
default:0,
min:0,
max:5,
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

     
    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ["hours", "days"]
      }
    }
      }
    ]

} ,
  { timestamps: true }
);

const Trip = mongoose.model("Trip", tripSchema);
module.exports = Trip;
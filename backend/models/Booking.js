const mongoose = require("mongoose");


const bookingSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        required: true
    },

    travelers: {
        type: Number,
        required: true
    },

    totalPrice: {
        type: Number,
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["paid", "failed"],
        default: "paid"
    },

   bookingStatus:{
    type:String,
    enum:[
        "paid",
        "cancelled"
    ],
    default:"paid"
}

},
{
    timestamps: true
});


module.exports = mongoose.model("Booking", bookingSchema);
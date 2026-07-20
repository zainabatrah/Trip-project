const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const Trip = require("../models/Trip");
const {
    createNotification,
} = require(
    "../services/notificationService"
);
const {
    cancelBooking
} = require("../controllers/bookingController");

// Create booking after successful payment

router.post("/", async (req, res) => {

    try {

     const {
    userId,
    tripId,
    travelers,
    totalPrice
} = req.body;



        // Find trip

        const trip = await Trip.findById(tripId);



        if (!trip) {

            return res.status(404).json({
                success: false,
                message: "Trip not found"
            });

        }



        // Check available seats

      const availableSeats =
    trip.numberOfTravelers - trip.reservedTravelers;
    if(availableSeats < travelers){

    return res.status(400).json({
        success:false,
        message:"Not enough seats available"
    });

}
trip.reservedTravelers += travelers;



        await trip.save();




        // Create booking

        const booking = await Booking.create({

            userId,

            tripId,

            travelers,

            totalPrice,

            paymentStatus: "paid",

            bookingStatus: "paid"

        });

        await createNotification({
            userId,
            type: "booking-confirmed",
            title: "Booking confirmed",
            message: `Your booking for ${trip.title || "your trip"} is confirmed for ${travelers} traveler${Number(travelers) === 1 ? "" : "s"}.`,
            link: "/my-trips",
            metadata: {
                tripId: String(trip._id),
                bookingId: String(booking._id),
            },
        });





        res.status(201).json({

            success: true,

            message: "Booking created successfully",

            booking

        });



    } catch (error) {


        res.status(500).json({

            success: false,

            message: error.message

        });


    }


});

router.get("/my-trips/:userId", async(req,res)=>{

    try{

        const bookings = await Booking.find({
            userId:req.params.userId
        })
        .populate("tripId");


        res.json({

            success:true,

            bookings

        });


    }
    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});

router.put(
    "/cancel/:id",
    cancelBooking
);

module.exports = router;

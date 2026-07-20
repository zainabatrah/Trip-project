const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const Trip = require("../models/Trip");
const {
    requireAuth,
    requireOrganizer,
} = require(
    "../middleware/auth"
);
const {
    createNotification,
} = require(
    "../services/notificationService"
);
const {
    cancelBooking
} = require("../controllers/bookingController");

// Create booking after successful payment

router.post("/", requireAuth, async (req, res) => {

    try {

     const {
    tripId,
    travelers,
    totalPrice
} = req.body;
        const userId = String(
            req.user?._id || ""
        );



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

router.get(
    "/manage",
    requireAuth,
    requireOrganizer,
    async (req, res) => {

        try {

            const bookings = await Booking.find({})
                .populate({
                    path: "tripId",
                    select: "title country tripType photo transportation duration date numberOfTravelers reservedTravelers"
                })
                .populate({
                    path: "userId",
                    model: "User",
                    select: "fullName email profileImage country"
                })
                .sort({ createdAt: -1 });

            res.json({
                success: true,
                bookings
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });

        }

    }
);

router.get("/my-trips/:userId", requireAuth, async(req,res)=>{

    try{

        const requestedUserId = String(
            req.params.userId || ""
        );
        const authenticatedUserId = String(
            req.user?._id || ""
        );
        const isOrganizer =
            ["organizer", "admin"].includes(
                String(req.user?.role || "").toLowerCase()
            );

        if (
            requestedUserId !== authenticatedUserId &&
            !isOrganizer
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to view these bookings"
            });
        }

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
    requireAuth,
    cancelBooking
);

module.exports = router;

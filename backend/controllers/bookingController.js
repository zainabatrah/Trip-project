const Booking = require("../models/Booking");

const Trip=require("../models/Trip")
const {
    createNotification,
} = require(
    "../services/notificationService"
);
const {
    getEffectiveUserRole,
} = require(
    "../middleware/auth"
);

 const cancelBooking = async (req, res) => {

    try {

        const booking = await Booking.findById(req.params.id);


        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }


        // prevent cancelling twice
        if (booking.bookingStatus === "cancelled") {
            return res.status(400).json({
                message: "Booking already cancelled"
            });
        }

        const authenticatedUserId =
            String(req.user?._id || "");
        const bookingUserId =
            String(booking.userId || "");
        const userRole =
            getEffectiveUserRole(req.user);
        const isOrganizer =
            userRole === "organizer" ||
            userRole === "admin";

        if (
            authenticatedUserId !== bookingUserId &&
            !isOrganizer
        ) {
            return res.status(403).json({
                message: "You do not have permission to cancel this booking"
            });
        }



        const trip = await Trip.findById(booking.tripId);



        if (trip) {

            // decrease reserved seats
            trip.reservedTravelers -= booking.travelers;


            // avoid negative number
            if (trip.reservedTravelers < 0) {
                trip.reservedTravelers = 0;
            }


            await trip.save();

        }



        booking.bookingStatus = "cancelled";

        await booking.save();

        await createNotification({
            userId: booking.userId,
            type: "booking-cancelled",
            title: "Trip cancelled",
            message: `Your booking for ${trip?.title || "your trip"} has been cancelled.`,
            link: "/my-trips",
            metadata: {
                tripId: trip?._id ? String(trip._id) : "",
                bookingId: String(booking._id),
            },
        });



        res.json({
            message: "Trip cancelled successfully",
            booking
        });



    } catch(error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    cancelBooking
};

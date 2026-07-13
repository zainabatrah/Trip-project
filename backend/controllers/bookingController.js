const Booking = require("../models/Booking");

const Trip=require("../models/Trip")

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
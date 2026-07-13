import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { getCurrentUser } from "../api/auth.js";
import "./Payment.css";

export default function Payment() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [trip, setTrip] = useState(null);
    const [travelers, setTravelers] = useState(1);

    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);


    useEffect(() => {

        const fetchTrip = async () => {

            try {

                const response = await api.get(`/trips/${id}`);

                setTrip(response.data.trip);

            } catch {

                setError("Cannot load trip information");

            }

        };

        fetchTrip();

    }, [id]);



    if(!trip){

        return <h2>Loading...</h2>;

    }



    const totalPrice = trip.price * travelers;


    const availableSeats =
        trip.numberOfTravelers - (trip.reservedTravelers || 0);



    const handlePayment = async()=>{
            if (availableSeats === 0) {
        setError("This trip is fully booked. No seats are available.");
        setMessage("");
        return;
    }

        if(travelers > availableSeats){

            setError("Not enough seats available ❌");
            return;

        }


        try{

            setLoading(true);

            setError("");

            const response = await api.post(
                "/payment",
                {
                    tripId:id,
                    travelers,
                    amount:totalPrice
                }
            );


           if(response.data.success){


    // Get logged user
   const user = getCurrentUser();

   if (!user?._id) {
    navigate("/login", {
        replace: true
    });
    return;
   }


    // Create booking after payment success

    await api.post("/bookings",{

        userId: user._id,

        tripId: id,

        travelers,

        totalPrice

    });



    setMessage("Payment Successful 🎉");

    setSuccess(true);

}



        }catch(err){

             console.log(err.response?.data);

    setError(
        err.response?.data?.message ||
        err.message
    );


        }finally{

            setLoading(false);

        }


    };



    // SUCCESS SCREEN ONLY
    if(success){

        return (

            <div className="success-container">

                <div className="success-card">

                    <div className="success-icon">
                        ✓
                    </div>


                    <h1>
                        {message}
                    </h1>


                    <p>
                        Your trip has been booked successfully.
                    </p>


                    <button
                    onClick={()=>navigate("/my-trips")}
                    >
                        View My Trips
                    </button>


                </div>

            </div>

        );

    }



    return (

        <div className="payment-container">

<Link to={`/trips/${id}`} className="back-link">
    ← Back to Trip Details
</Link>
            <div className="payment-header">

                <h1>
                    Payment
                </h1>

                <p>
                    Complete your booking by making a secure payment
                </p>

            </div>



            <div className="trip-box">


                <img 
                src={trip.photo}
                alt={trip.title}
                />


                <div>

                    <h2 className="triptitle">
                        {trip.title}
                    </h2>


                    <p>
                        📍 {trip.country}
                    </p>


                    <p>
                        ⏱ {trip.duration.value} {trip.duration.unit}
                    </p>


                    <h2 className="price">
                        ${trip.price}
                        <span>
                            {" "}per traveler
                        </span>
                    </h2>


                </div>


            </div>




            <div className="payment-grid">


                <div className="left-card">


                    <h2>
                        👥 Number of Travelers
                    </h2>

{
    availableSeats === 0 ? (

        <div className="full-booked-box">
            <h3>❌ Trip Fully Booked</h3>
            <p>
                No seats are available for this trip.
            </p>
        </div>

    ) : (

        <>
           <div className="counter">

    <button
    onClick={() => {

        if (travelers > 1) {
            setTravelers(travelers - 1);
        }

        setError("");

    }}
    >
        −
    </button>


    <span>
        {travelers}
    </span>


    <button
    onClick={() => {

        if (travelers >= availableSeats) {

            setError(
                `Only ${availableSeats} seat${availableSeats === 1 ? "" : "s"} available.`
            );

            return;
        }

        setError("");
        setTravelers(travelers + 1);

    }}
    >
        +
    </button>

</div>


<p>
    Maximum available: {availableSeats}
</p>
        </>

    )
}



                    <hr/>


                    <h2>
                        Price Details
                    </h2>


                    <div className="price-row">

                        <span>
                            Price per traveler
                        </span>

                        <span>
                            ${trip.price}
                        </span>

                    </div>



                    <div className="price-row">

                        <span>
                            Travelers
                        </span>

                        <span>
                            {travelers}
                        </span>

                    </div>



                    <hr/>


                    <div className="total">

                        <span>
                            Total Price
                        </span>


                        <span>
                            ${totalPrice}
                        </span>

                    </div>




<button
    className="pay-button"
    onClick={handlePayment}
    disabled={loading || availableSeats === 0}
>
{
    availableSeats === 0
    ? "Trip Fully Booked"
    :
    loading
    ? "Processing..."
    :
    "🔒 Pay Now"
}
</button>



                 {error && (
    <div className="error-box">
        <span className="error-icon">⚠</span>
        <span>{error}</span>
    </div>
)}


                </div>




                <div className="right-card">


                    <h3>
                        Available Seats
                    </h3>

                    <p className="green">
                        {availableSeats} seats left
                    </p>



                    <hr/>


                    <h3>
                        🛡 Free Cancellation
                    </h3>

                    <p>
                        Cancel up to 24 hours before the tour
                    </p>



                    <hr/>


                    <h3>
                        Need Help?
                    </h3>

                    <p>
                        Contact our support team anytime
                    </p>


                    <hr/>


                    <h3>
                        🔒 Secure Payment
                    </h3>

                    <p>
                        Your payment is protected
                    </p>


                </div>


            </div>


        </div>

    );

}

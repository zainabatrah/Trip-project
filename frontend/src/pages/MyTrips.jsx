import { useEffect, useState } from "react";
import api from "../services/api";
import "./MyTrip.css";
import { Link } from "react-router-dom";

export default function MyTrips() {

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {

    const fetchTrips = async () => {

      try {

        const user = JSON.parse(localStorage.getItem("currentUser"));

        const response = await api.get(
          `/bookings/my-trips/${user._id}`
        );

        setBookings(response.data.bookings);

      } catch (error) {
        console.log(error);
      }
      finally {
        setLoading(false);
      }

    };

    fetchTrips();

  }, []);



  const cancelTrip = async (bookingId) => {

    try {

      await api.put(
        `/bookings/cancel/${bookingId}`
      );


      setBookings((prev)=>
        prev.map((booking)=>
          booking._id === bookingId
          ? {
              ...booking,
              bookingStatus:"cancelled"
            }
          : booking
        )
      );


    } catch(error){

      console.log(error);

    }

  };



 const filteredBookings = bookings.filter((booking)=>{

    const title =
    booking.tripId.title?.toLowerCase() || "";


    const country =
    booking.tripId.country?.toLowerCase() || "";


    const type =
    booking.tripId.tripType?.toLowerCase() || "";


    const searchMatch =
    title.includes(search.toLowerCase()) ||
    country.includes(search.toLowerCase()) ||
    type.includes(search.toLowerCase());


    const statusMatch =
    filter === "All" ||
    booking.bookingStatus === filter;


    const typeMatch =
    typeFilter === "All" ||
    booking.tripId.tripType === typeFilter;


    return searchMatch && statusMatch && typeMatch;


});



  if(loading){

    return <h2 className="loading">
      Loading trips...
    </h2>;

  }



  return (
<div className="mybody">
<div className="myTrips">




<div className="toolbar">


<input

type="text"

placeholder="Search by trip type..."

className="searchInput"

value={search}

onChange={(e)=>setSearch(e.target.value)}

/>



<select

className="filter"

value={filter}

onChange={(e)=>setFilter(e.target.value)}

>

<option value="All">
All
</option>

<option value="paid">
Paid
</option>

<option value="cancelled">
Cancelled
</option>


</select>

<select
className="filter"
value={typeFilter}
onChange={(e)=>setTypeFilter(e.target.value)}
>

<option value="All">
All Types
</option>

<option value="adventure">
Adventure
</option>

<option value="relax">
Relax
</option>

<option value="business">
Business
</option>

<option value="family">
Family
</option>

</select>

</div>





{
    filteredBookings.length === 0 ? (

    <div className="noTrips">
        <h2>No trips found</h2>
        <p>You don't have any booked trips yet.</p>
    </div>

) : (
filteredBookings.map((booking)=>(


<div className="tripCard" key={booking._id}>


<img

src={booking.tripId.photo}

alt={booking.tripId.title}

/>



<div className="tripInfo">



<div className="topRow">


<div>

<h2>
{booking.tripId.title}
</h2>


<p className="country">
📍 {booking.tripId.country}
</p>


<p>
🏷 {booking.tripId.tripType}
</p>


</div>



<span
className={`status ${booking.bookingStatus}`}
>
{
booking.bookingStatus === "paid"
? "Paid"
: "Cancelled"
}
</span>



</div>





<div className="details">


<span>
🕒 {booking.tripId.duration.value} {booking.tripId.duration.unit}
</span>


<span>
✈ {booking.tripId.transportation}
</span>


<span>
👥 {booking.travelers} Travelers
</span>


</div>






<div className="bottomRow">


<h3>
${booking.totalPrice}
</h3>



<div className="buttons">

<Link
to={`/trips/${booking.tripId._id}`}
className="detailsBtn"
>
View Details
</Link>









{
booking.bookingStatus !== "cancelled" &&

<button

className="cancelBtn"

onClick={()=>
cancelTrip(booking._id)
}

>

Cancel

</button>

}



</div>


</div>



</div>


</div>


))
)

}



</div>
</div>
  );

}
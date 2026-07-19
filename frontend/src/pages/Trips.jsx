import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";
import PublicPageLayout from "../components/PublicPageLayout.jsx";
import { pageTheme } from "../components/publicPageTheme.js";
import { getTrips } from "../api/trips.js";

const defaultTripImage =
  "/Images/Libanon233.jpg";


function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}


function capitalize(value) {
  const text = String(value || "");

  return text
    ? text.charAt(0).toUpperCase() +
        text.slice(1)
    : "Not specified";
}


function resolveTripCardImage(trip) {
  // Use the image saved in database first
  if (trip?.photo) {
    return trip.photo;
  }

  // fallback to place image
  if (Array.isArray(trip?.places)) {
    const placeImage = trip.places.find(
      (place) => place?.image
    )?.image;

    if (placeImage) {
      return placeImage;
    }
  }

  return defaultTripImage;
}


function buildMapLink(trip) {
  const firstPlace = Array.isArray(
    trip.places
  )
    ? trip.places[0]
    : null;

  const params =
    new URLSearchParams();


  if (trip.title) {
    params.set("title", trip.title);
  }


  if (trip.to) {
    params.set("city", trip.to);
  }


  if (
    firstPlace?.latitude !== undefined &&
    firstPlace?.longitude !== undefined
  ) {
    params.set(
      "lat",
      String(firstPlace.latitude)
    );

    params.set(
      "lng",
      String(firstPlace.longitude)
    );
  }


  const query = params.toString();

  return query
    ? `/map?${query}`
    : "/map";
}



function seatsLeft(trip) {
  return Math.max(
    Number(trip.numberOfTravelers || 0) -
      Number(trip.reservedTravelers || 0),
    0
  );
}



export default function Trips() {

  const [trips, setTrips] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [transportation, setTransportation] =
    useState("all");

  const [sort, setSort] =
    useState("date");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");



  useEffect(() => {

    let cancelled = false;


    async function loadTrips() {

      try {

        setLoading(true);
        setError("");


        const data = await getTrips();


        if (!cancelled) {

          setTrips(
            Array.isArray(data?.trips)
              ? data.trips
              : []
          );

        }


      } catch (requestError) {


        if (!cancelled) {

          setError(
            requestError.message ||
            "Could not load trips."
          );

          setTrips([]);

        }


      } finally {


        if (!cancelled) {
          setLoading(false);
        }


      }

    }


    loadTrips();


    return () => {
      cancelled = true;
    };


  }, []);




  const filteredTrips = useMemo(() => {

    const query =
      search.trim().toLowerCase();


    let result = trips.filter((trip) => {


      const searchableText = [
        trip.title,
        trip.country,
        trip.from,
        trip.to,
        trip.tripType,
      ]
        .join(" ")
        .toLowerCase();



      const matchesSearch =
        searchableText.includes(query);



      const matchesTransportation =
        transportation === "all" ||
        trip.transportation === transportation;



      return (
        matchesSearch &&
        matchesTransportation
      );

    });




    if (sort === "price-low") {

      result = [...result].sort(
        (a,b)=>
          Number(a.price || 0) -
          Number(b.price || 0)
      );

    }




    if (sort === "price-high") {

      result = [...result].sort(
        (a,b)=>
          Number(b.price || 0) -
          Number(a.price || 0)
      );

    }




    if (sort === "date") {

      result = [...result].sort(
        (a,b)=> {

          const priority = {
            ongoing:0,
            planned:1,
            completed:2,
          };


          if (
            priority[a.status] !==
            priority[b.status]
          ) {

            return (
              priority[a.status] -
              priority[b.status]
            );

          }


          return (
            new Date(a.date) -
            new Date(b.date)
          );

        }
      );

    }





    if (sort === "rating") {

      result = [...result].sort(
        (a,b)=> {

          const ratingA =
            Number(a.rating || 0);

          const ratingB =
            Number(b.rating || 0);


          if (
            ratingA === 0 &&
            ratingB > 0
          )
            return 1;


          if (
            ratingB === 0 &&
            ratingA > 0
          )
            return -1;


          return ratingB-ratingA;

        }
      );

    }



    return result;


  },[
    trips,
    search,
    transportation,
    sort
  ]);




  const displayTrips =
    useMemo(
      () =>
        filteredTrips.map((trip)=>({
          ...trip,
          displayImage:
            resolveTripCardImage(trip),
        })),
      [filteredTrips]
    );
  return (
    <PublicPageLayout
      title="Explore Our Trips"
      subtitle="Browse available trips, destinations, dates, and transportation options."
    >

      <section style={pageTheme.surface}>

        <div style={styles.filters}>

          <label style={pageTheme.field}>
            <span>Search</span>

            <input
              type="search"
              value={search}
              onChange={(event)=>
                setSearch(event.target.value)
              }
              placeholder="Search trips..."
              style={pageTheme.control}
            />

          </label>



          <label style={pageTheme.field}>

            <span>Transportation</span>

            <select
              value={transportation}
              onChange={(event)=>
                setTransportation(
                  event.target.value
                )
              }
              style={pageTheme.control}
            >

              <option value="all">
                All transportation
              </option>

              <option value="bus">
                Bus
              </option>

              <option value="car">
                Car
              </option>

            </select>

          </label>




          <label style={pageTheme.field}>

            <span>Sort by</span>

            <select
              value={sort}
              onChange={(event)=>
                setSort(
                  event.target.value
                )
              }
              style={pageTheme.control}
            >

              <option value="date">
                Nearest Upcoming
              </option>

              <option value="rating">
                Highest Rated
              </option>

              <option value="price-low">
                Lowest Price
              </option>

              <option value="price-high">
                Highest Price
              </option>


            </select>

          </label>


        </div>

      </section>




      {error && (

        <div
          style={{
            ...pageTheme.errorBox,
            marginTop:18,
          }}
        >

          {error}

        </div>

      )}




      {loading ? (

        <div
          style={{
            ...pageTheme.emptyBox,
            marginTop:18,
          }}
        >
          Loading trips...
        </div>


      ) : displayTrips.length === 0 ? (


        <div
          style={{
            ...pageTheme.emptyBox,
            marginTop:18,
          }}
        >
          No trips found.
        </div>


      ) : (



        <section
          style={{
            ...pageTheme.surface,
            marginTop:18,
          }}
        >



          <div style={styles.resultsBar}>


            <div>

              <h2 style={styles.resultsTitle}>
                Available trips
              </h2>


              <p style={styles.resultsText}>
                Open a trip for full details or jump to the map directly from the card.
              </p>

            </div>



            <span style={pageTheme.pill}>
              {displayTrips.length} visible
            </span>


          </div>






          <div style={styles.list}>


            {displayTrips.map((trip)=>{


              const id =
                trip._id || trip.id;


              return (

                <article
                  key={id}
                  style={styles.card}
                >



                  {/* IMAGE */}

                  <div style={styles.imageSection}>


                    <img
                      src={
                        trip.displayImage ||
                        defaultTripImage
                      }
                      alt={trip.title}
                      style={styles.image}

                      onError={(event)=>{

                        event.currentTarget.src =
                          defaultTripImage;

                        event.currentTarget.onerror =
                          null;

                      }}

                    />




                    {trip.status === "completed" ? (

                      <Link
                        to={`/feedback/${trip._id}`}
                        style={styles.commentsButton}
                      >

                        💬 Reviews

                      </Link>


                    ) : (


                      <div
                        style={styles.commentsDisabled}
                      >

                        💬 Reviews available after trip

                      </div>


                    )}



                  </div>







                  {/* DETAILS */}

                  <div style={styles.body}>


                    <div style={styles.mainInfo}>


                      <div style={styles.titleRow}>


                        <h2 style={styles.title}>
                          {trip.title}
                        </h2>




                        <span
                          style={{
                            ...styles.statusBadge,

                            ...(trip.status === "completed"
                              ? styles.completed
                              : trip.status === "ongoing"
                              ? styles.ongoing
                              : styles.planned)

                          }}
                        >

                          {trip.status?.toUpperCase()}

                        </span>



                      </div>






                      <p style={styles.route}>
                        {trip.from} → {trip.to}
                      </p>






                      <div style={styles.details}>


                        <span>
                          📅 {formatDate(trip.date)}
                        </span>




                        {trip.rating > 0 ? (

                          <span>
                            ⭐ {trip.rating}
                          </span>


                        ) : (

                          <span>
                            ⭐ No reviews yet
                          </span>

                        )}






                        <span>
                          💰 $
                          {Number(
                            trip.price || 0
                          ).toFixed(2)}
                        </span>





                        <span>
                          🚗 {capitalize(
                            trip.transportation
                          )}
                        </span>



                        <span>
                          🧳 {seatsLeft(trip)} seats left
                        </span>



                      </div>







                      <div style={styles.actions}>


                        <Link
                          to={`/trips/${id}`}
                          style={{
                            ...pageTheme.buttonSecondary,
                            ...styles.actionButton,
                          }}
                        >

                          Trip Details

                        </Link>





                        <Link
                          to={`/map/${id}`}
                          style={{
                            ...pageTheme.buttonSecondary,
                            ...styles.actionButton,
                          }}
                        >

                          Open Map

                        </Link>



                      </div>



                    </div>


                  </div>



                </article>


              );


            })}


          </div>




        </section>


      )}



    </PublicPageLayout>
  );

}
const styles = {

  filters: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },


  resultsBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: 18,
  },


  resultsTitle: {
    margin: "0 0 6px",
    fontSize: 20,
    fontWeight: 900,
    color: "#1e3a8a",
  },


  resultsText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.7,
  },


  list: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },


  card: {
    display: "flex",
    alignItems: "stretch",
    width: "100%",
    background:
      "rgba(255,255,255,0.8)",
    border:
      "1px solid #bfdbfe",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow:
      "0 12px 30px rgba(96,165,250,0.15)",
  },


  imageSection: {
    width: 230,
    display: "flex",
    flexDirection: "column",
  },


  image: {
    width: 230,
    height: 200,
    objectFit: "cover",
  },


  commentsButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px",
    background:
      "#f8fbff",
    borderTop:
      "1px solid #dbeafe",
    color:
      "#2563eb",
    textDecoration:
      "none",
    fontWeight: 700,
  },


  commentsDisabled: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "12px",
    background:
      "#f8fafc",
    color:
      "#94a3b8",
    borderTop:
      "1px solid #e2e8f0",
    fontSize: 14,
    fontWeight: 600,
    textAlign: "center",
  },


  body: {
    flex: 1,
    display: "flex",
    justifyContent:
      "space-between",
    alignItems:
      "stretch",
    padding: 22,
  },


  mainInfo: {
    flex: 1,
  },


  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 6,
  },


  title: {
    margin: "5px 0",
    fontSize: 23,
    fontWeight: 900,
    color:
      "#1e3a8a",
  },


  route: {
    margin:
      "5px 0 15px",
    color:
      "#2563eb",
    fontWeight: 700,
  },


  details: {
    display: "flex",
    flexWrap: "wrap",
    gap: 15,
    color:
      "#475569",
    marginBottom: 18,
    fontSize: 14,
  },


  statusBadge: {
    padding:
      "6px 12px",
    borderRadius:
      20,
    fontSize:
      12,
    fontWeight:
      800,
    color:
      "#fff",
    textTransform:
      "uppercase",
    letterSpacing:
      "0.5px",
  },


  planned: {
    background:
      "#3b8ce9",
  },


  ongoing: {
    background:
      "#f59e0b",
  },


  completed: {
    background:
      "#dc2626",
  },


  actions: {
    display:
      "flex",
    gap:
      12,
    marginTop:
      18,
    flexWrap:
      "wrap",
  },


  actionButton: {
    textDecoration:
      "none",
    textAlign:
      "center",
    padding:
      "10px 18px",
    borderRadius:
      12,
    fontWeight:
      800,
  },

};
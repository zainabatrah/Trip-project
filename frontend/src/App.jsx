import { useEffect, useState } from "react";

export default function App() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    fetch("/api/trips")
      .then(res => res.json())
      .then(data => setTrips(data))
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Trip Management</h1>
      <ul>
        {trips.map(trip => (
          <li key={trip.id}>
            {trip.destination} — {trip.transportation} — ⭐ {trip.rating}
          </li>
        ))}
      </ul>
    </div>
  );
}


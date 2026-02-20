// src/pages/Map.jsx
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

export default function Map() {
  const center = {
    lat: 48.8566,  // Example: Paris
    lng: 2.3522,
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Trip Map</h1>
      <LoadScript googleMapsApiKey="YOUR_API_KEY">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "500px" }}
          center={center}
          zoom={10}
        >
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
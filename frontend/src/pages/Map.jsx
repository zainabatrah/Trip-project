// src/pages/Map.jsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Map() {
  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Trip Map</h1>
      <MapContainer center={[48.8566, 2.3522]} zoom={10} style={{ height: "500px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[48.8566, 2.3522]}>
          <Popup>Paris Trip ✈️</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
import { Routes, Route, Navigate } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Trips from "./pages/Trips";
import PrivateTrip from "./pages/PrivateTrip";
import About from "./pages/About";
import TripDetails from "./pages/TripDetails";
import Map from "./pages/Map";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="/trips" element={<Trips />} />
      <Route path="/trips/:id" element={<TripDetails />} />

      <Route path="/private-trip" element={<PrivateTrip />} />
      <Route path="/about" element={<About />} />
      <Route path="/map" element={<Map />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
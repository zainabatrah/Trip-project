import { Navigate, Route, Routes } from "react-router-dom";

import Welcome from "./pages/Welcome.jsx";
import About from "./pages/About.jsx";
import Trips from "./pages/Trips.jsx";
import TripDetails from "./pages/TripDetails.jsx";
import PrivateTrip from "./pages/PrivateTrip.jsx";
import MyRequests from "./pages/MyRequests.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MapPage from "./pages/Map.jsx";
import Approve from "./pages/Approve.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/about" element={<About />} />

      <Route path="/trips" element={<Trips />} />
      <Route path="/trips/:id" element={<TripDetails />} />

      <Route path="/private-trip" element={<PrivateTrip />} />
      <Route path="/my-requests" element={<MyRequests />} />
      <Route path="/approve" element={<Approve />} />

      <Route path="/map" element={<MapPage />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
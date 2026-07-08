import { Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Trips from "./pages/Trips";
import PrivateTrip from "./pages/PrivateTrip";
<<<<<<< HEAD
import TripDetails from "./pages/TripDetails";
=======
import About from "./pages/About";

// Use these only if the files exist
// import Dashboard from "./pages/Dashboard";
// import Bookings from "./pages/Bookings";
// import Profile from "./pages/Profile";

>>>>>>> fa7baa441c87e0ddddde0572c6d9f225780bd353
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/trips" replace />} />

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/trips" element={<Trips />} />
      <Route path="/private-trip" element={<PrivateTrip />} />
      <Route path="/about" element={<About />} />
<<<<<<< HEAD
 <Route
          path="/trips/:id"
          element={<TripDetails />}
        />
      <Route path="*" element={<Navigate to="/" replace />} />
=======

      {/* Uncomment only if these pages exist */}
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      {/* <Route path="/bookings" element={<Bookings />} /> */}
      {/* <Route path="/profile" element={<Profile />} /> */}

      <Route path="*" element={<Navigate to="/trips" replace />} />
>>>>>>> fa7baa441c87e0ddddde0572c6d9f225780bd353
    </Routes>
  );
}
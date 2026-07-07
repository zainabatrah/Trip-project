import { Routes, Route, Navigate } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Trips from "./pages/Trips";
import About from "./pages/About";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Approve from "./pages/Approve";
import PrivateTrip from "./pages/PrivateTrip";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/approve" element={<Approve />} />

      <Route path="/trips" element={<Trips />} />
      <Route path="/private-trip" element={<PrivateTrip />} />
      <Route path="/about" element={<About />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
import {
  useEffect,
  useState,
} from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

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

import {
  getAuthenticatedUser,
  isOrganizerRole,
  isLoggedIn,
  logoutUser,
} from "./api/auth.js";

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

function OrganizerRoute({ children }) {
  const loggedIn = isLoggedIn();

  const [accessState, setAccessState] =
    useState({
      checking: true,
      redirectTo: "/",
      allowed: false,
    });

  useEffect(() => {
    if (!loggedIn) {
      return undefined;
    }

    let cancelled = false;

    async function verifyAccess() {
      try {
        const data =
          await getAuthenticatedUser();

        if (cancelled) {
          return;
        }

        const allowed =
          isOrganizerRole(
            data?.user?.role
          );

        setAccessState({
          checking: false,
          redirectTo: allowed
            ? "/approve"
            : "/",
          allowed,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error.status === 401) {
          logoutUser();

          setAccessState({
            checking: false,
            redirectTo: "/login",
            allowed: false,
          });

          return;
        }

        setAccessState({
          checking: false,
          redirectTo: "/",
          allowed: false,
        });
      }
    }

    verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  if (!loggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (accessState.checking) {
    return null;
  }

  if (!accessState.allowed) {
    return (
      <Navigate
        to={accessState.redirectTo}
        replace
      />
    );
  }

  return children;
}

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    async function goToApprove() {
      if (!isLoggedIn()) {
        navigate("/login");

        return {
          success: false,
          message:
            "Login is required before opening /approve.",
        };
      }

      const data =
        await getAuthenticatedUser();

      if (
        !isOrganizerRole(
          data?.user?.role
        )
      ) {
        throw new Error(
          "Current user is not an organizer or admin."
        );
      }

      navigate("/approve");

      return {
        success: true,
        role: data.user.role,
      };
    }

    async function goToMyRequests() {
      if (!isLoggedIn()) {
        navigate("/login");

        return {
          success: false,
          message:
            "Login is required before opening /my-requests.",
        };
      }

      await getAuthenticatedUser();

      navigate("/my-requests");

      return {
        success: true,
      };
    }

    window.tripApp = {
      ...(window.tripApp || {}),
      openApprove: goToApprove,
      openMyRequests:
        goToMyRequests,
      switchPage: async (
        target
      ) => {
        const normalized =
          String(target || "")
            .trim()
            .toLowerCase();

        if (
          normalized ===
            "approve" ||
          normalized ===
            "/approve"
        ) {
          return goToApprove();
        }

        if (
          normalized ===
            "my-requests" ||
          normalized ===
            "/my-requests" ||
          normalized ===
            "my request" ||
          normalized ===
            "my requests"
        ) {
          return goToMyRequests();
        }

        throw new Error(
          "Use 'approve' or 'my-requests'."
        );
      },
    };

    return undefined;
  }, [navigate]);

  return (
    <Routes>
      <Route
        path="/"
        element={<Welcome />}
      />

      <Route
        path="/about"
        element={<About />}
      />

      <Route
        path="/trips"
        element={<Trips />}
      />

      <Route
        path="/trips/:id"
        element={<TripDetails />}
      />

      <Route
        path="/private-trip"
        element={
          <ProtectedRoute>
            <PrivateTrip />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-requests"
        element={
          <ProtectedRoute>
            <MyRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/approve"
        element={
          <OrganizerRoute>
            <Approve />
          </OrganizerRoute>
        }
      />

      <Route
        path="/map"
        element={<MapPage />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

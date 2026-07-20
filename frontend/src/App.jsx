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

import DashboardLayout from "./components/DashboardLayout.jsx";
import About from "./pages/About.jsx";
import Approve from "./pages/Approve.jsx";
import Feedback from "./pages/feedback.jsx";
import Friends from "./pages/Friends.jsx";
import Login from "./pages/Login.jsx";
import ManageTravelers from "./pages/ManageTravelers.jsx";
import ManageTrips from "./pages/ManageTrips.jsx";
import MapPage from "./pages/Map.jsx";
import MyRequests from "./pages/MyRequests.jsx";
import MyTrips from "./pages/MyTrips.jsx";
import Payment from "./pages/Payment.jsx";
import PostsStories from "./pages/PostsStories.jsx";
import PrivateTrip from "./pages/PrivateTrip.jsx";
import Profile from "./pages/Profile.jsx";
import Register from "./pages/Register.jsx";
import TripDetails from "./pages/TripDetails.jsx";
import Trips from "./pages/Trips.jsx";
import Welcome from "./pages/Welcome.jsx";
import {
  getAuthenticatedUser,
  getCurrentUser,
  isLoggedIn,
  isOrganizerRole,
  logoutUser,
} from "./api/auth.js";

const APPROVE_PREVIEW_KEY =
  "tripAppApprovePreview";

function isDevelopmentMode() {
  return Boolean(
    import.meta.env.DEV
  );
}

function enableApprovePreview() {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  window.sessionStorage.setItem(
    APPROVE_PREVIEW_KEY,
    "true"
  );

  return true;
}

function disableApprovePreview() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.sessionStorage.removeItem(
    APPROVE_PREVIEW_KEY
  );
}

function hasApprovePreview() {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  if (
    isOrganizerRole(
      getCurrentUser()?.role
    )
  ) {
    return false;
  }

  return (
    window.sessionStorage.getItem(
      APPROVE_PREVIEW_KEY
    ) === "true"
  );
}

function ProtectedRoute({
  children,
}) {
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

function OrganizerRoute({
  children,
}) {
  const loggedIn =
    isLoggedIn();

  const previewRequested =
    hasApprovePreview();

  const [
    accessState,
    setAccessState,
  ] = useState({
    checking: loggedIn,
    redirectTo:
      previewRequested && !loggedIn
        ? "/approve"
        : loggedIn
          ? "/"
          : "/login",
    allowed:
      previewRequested && !loggedIn,
    preview:
      previewRequested && !loggedIn,
  });

  useEffect(() => {
    if (!loggedIn) {
      return undefined;
    }

    let cancelled =
      false;

    async function verifyAccess() {
      try {
        setAccessState({
          checking: true,
          redirectTo: "/",
          allowed: false,
          preview: false,
        });

        const data =
          await getAuthenticatedUser();

        if (cancelled) {
          return;
        }

        const allowed =
          isOrganizerRole(
            data?.user?.role
          );

        if (allowed) {
          disableApprovePreview();
        }

        setAccessState({
          checking: false,
          redirectTo:
            allowed
              ? "/approve"
              : previewRequested
                ? "/approve"
                : "/my-requests",
          allowed:
            allowed ||
            previewRequested,
          preview:
            !allowed &&
            previewRequested,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (
          error?.status ===
            401 ||
          error?.response
            ?.status === 401
        ) {
          logoutUser();

          setAccessState({
            checking: false,
            redirectTo:
              "/login",
            allowed: false,
            preview: false,
          });

          return;
        }

        console.error(
          "Organizer access verification failed:",
          error
        );

        setAccessState({
          checking: false,
          redirectTo:
            previewRequested
              ? "/approve"
              : "/my-requests",
          allowed:
            previewRequested,
          preview:
            previewRequested,
        });
      }
    }

    verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [
    loggedIn,
    previewRequested,
  ]);

  if (
    accessState.preview &&
    accessState.allowed
  ) {
    return children;
  }

  if (!loggedIn) {
    if (previewRequested) {
      return children;
    }

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    accessState.checking
  ) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        Checking access...
      </div>
    );
  }

  if (
    !accessState.allowed
  ) {
    return (
      <Navigate
        to={
          accessState.redirectTo
        }
        replace
      />
    );
  }

  return children;
}

export default function App() {
  const navigate =
    useNavigate();

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return undefined;
    }

    async function goToApprove() {
      try {
        if (
          isLoggedIn()
        ) {
          const data =
            await getAuthenticatedUser();

          const role =
            String(
              data?.user?.role ||
                ""
            )
              .trim()
              .toLowerCase();

          if (
            isOrganizerRole(
              role
            )
          ) {
            disableApprovePreview();

            navigate(
              "/approve"
            );

            return {
              success: true,
              preview: false,
              role,
              page:
                "/approve",
            };
          }

          if (
            enableApprovePreview()
          ) {
            navigate(
              "/approve"
            );

            return {
              success: true,
              preview: true,
              role:
                role ||
                "client",
              page:
                "/approve",
              message:
                "Approve page opened in console preview mode.",
            };
          }

          navigate(
            "/my-requests"
          );

          return {
            success: false,
            preview: false,
            role,
            page:
              "/my-requests",
            message:
              "Only organizers and administrators can access the approval page.",
          };
        }

        if (
          enableApprovePreview()
        ) {
          navigate(
            "/approve"
          );

          return {
            success: true,
            preview: true,
            guest: true,
            page:
              "/approve",
            message:
              "Approve page opened in console preview mode.",
          };
        }

        navigate("/login");

        return {
          success: false,
          preview: false,
          guest: true,
          page: "/login",
          message:
            "Login is required before opening /approve.",
        };
      } catch (error) {
        console.error(
          "Could not open Approve:",
          error
        );

        if (
          enableApprovePreview()
        ) {
          navigate(
            "/approve"
          );

          return {
            success: true,
            preview: true,
            page:
              "/approve",
            message:
              "User verification failed, so the page was opened in console preview mode.",
          };
        }

        return {
          success: false,
          message:
            error?.message ||
            "Could not open the approval page.",
        };
      }
    }

    async function goToMyRequests() {
      disableApprovePreview();

      navigate(
        "/my-requests"
      );

      return {
        success: true,
        preview: false,
        guest:
          !isLoggedIn(),
        page:
          "/my-requests",
      };
    }

    async function stopApprovePreview() {
      disableApprovePreview();

      navigate(
        "/my-requests"
      );

      return {
        success: true,
        preview: false,
        page:
          "/my-requests",
        message:
          "Approve preview mode disabled.",
      };
    }

    window.tripApp = {
      ...(
        window.tripApp ||
        {}
      ),
      goToApprove:
        goToApprove,
      openApprove:
        goToApprove,
      goToMyRequests:
        goToMyRequests,
      openMyRequests:
        goToMyRequests,
      disableApprovePreview:
        stopApprovePreview,
      getState: () => ({
        loggedIn:
          isLoggedIn(),
        development:
          isDevelopmentMode(),
        approvePreview:
          hasApprovePreview(),
        currentPage:
          window.location
            .pathname,
      }),
      switchPage: async (
        target
      ) => {
        const normalized =
          String(
            target || ""
          )
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
            "my-request" ||
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

        return {
          success: false,
          message:
            "Use 'approve' or 'my-requests'.",
        };
      },
    };

    window.tripApp.goToSection =
      window.tripApp.switchPage;
    window.goToApprove =
      goToApprove;
    window.openApprove =
      goToApprove;
    window.approve =
      goToApprove;
    window.goToMyRequests =
      goToMyRequests;
    window.openMyRequests =
      goToMyRequests;
    window.myRequests =
      goToMyRequests;
    window.goToSection = (
      target
    ) =>
      window.tripApp.switchPage(
        target
      );

    return () => {};
  }, [navigate]);

  return (
    <Routes>
      <Route
        element={
          <DashboardLayout />
        }
      >
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
          element={
            <ProtectedRoute>
              <Trips />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips/:id"
          element={
            <ProtectedRoute>
              <TripDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/posts-stories"
          element={
            <ProtectedRoute>
              <PostsStories />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/friends"
          element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          }
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
          path="/map/:tripId"
          element={<MapPage />}
        />

        <Route
          path="/manage-trips"
          element={
            <OrganizerRoute>
              <ManageTrips />
            </OrganizerRoute>
          }
        />

        <Route
          path="/manage-travelers"
          element={
            <OrganizerRoute>
              <ManageTravelers />
            </OrganizerRoute>
          }
        />

        <Route
          path="/my-trips"
          element={
            <ProtectedRoute>
              <MyTrips />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback/:tripId"
          element={<Feedback />}
        />
      </Route>

      <Route
        path="/payment/:id"
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        }
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

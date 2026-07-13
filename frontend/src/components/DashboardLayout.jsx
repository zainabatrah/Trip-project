import TopNavbar from "./TopNavbar.jsx";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
      }}
    >

      <TopNavbar />

      <main>
        <Outlet />
      </main>

    </div>
  );
}
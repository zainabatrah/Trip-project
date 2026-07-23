import TopNavbar from "./TopNavbar.jsx";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer.jsx";

export default function DashboardLayout() {

  const location = useLocation();


  const organizerPages = [
    "/approve",
    "/manage-trips"
  ];


  const hideFooter = organizerPages.some((path) =>
    location.pathname.startsWith(path)
  );


  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
      }}
    >

      <TopNavbar />


      <main
        style={{
          width: "100%",
          overflowX: "hidden",
        }}
      >
       
        <Outlet />
            {
        !hideFooter && <Footer />
      }
      </main>


     

    </div>
  );
}

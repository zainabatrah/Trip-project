import TopNavbar from "./TopNavbar.jsx";

export default function DashboardLayout({
  children,
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <TopNavbar />

      <main>{children}</main>
    </div>
  );
}
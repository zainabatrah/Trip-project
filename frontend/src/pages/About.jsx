import { Link } from "react-router-dom";

export default function About() {
  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>About Us</h1>
      <p>
        Trip Management is a platform that helps travel organizations create and manage trips,
        while users can browse, plan, and book trips online.
      </p>

      <ul>
        <li>Organizations manage trips from a dashboard (add/edit/delete)</li>
        <li>Users browse trips with details (schedule, stops, maps, weather, ratings)</li>
        <li>Users can book trips and later submit reviews</li>
      </ul>

      <Link to="/" style={{ color: "#cfd8ff" }}>← Back</Link>
    </div>
  );
}


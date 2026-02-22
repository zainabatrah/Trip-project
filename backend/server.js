import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";


dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/api/auth", authRoutes);


app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/api/trips", (req, res) => {
  res.json([
    { id: 1, destination: "Paris", transportation: "Bus", rating: 4.6 },
    { id: 2, destination: "Istanbul", transportation: "Plane", rating: 4.4 }
  ]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));

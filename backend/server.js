import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors());

// 🔥 THIS IS REQUIRED (fixes req.body = undefined)
app.use(express.json());

app.use("/api", authRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import mongoose from "mongoose";

export default async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from backend/.env");
  }

  const connection = await mongoose.connect(process.env.MONGODB_URI);

  console.log(
    `MongoDB connected successfully: ${connection.connection.host}`
  );

  return connection;
}
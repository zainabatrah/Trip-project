import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing authorization token." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid user." });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireOrganizer(req, res, next) {
  if (!req.user || !["organizer", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Organizer access required." });
  }

  next();
}

export function signUserToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

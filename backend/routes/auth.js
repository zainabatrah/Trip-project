import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// REGISTER (SAVE TO DB)
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User saved to MongoDB",
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN (CHECK DB)
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select("+passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Wrong password"
      });
    }

    const token = signUserToken(user);

    res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

export default router;
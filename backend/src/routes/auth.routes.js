import express from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { requireAuth, signUserToken } from "../middleware/auth.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, or PDF files are allowed."));
    }

    cb(null, true);
  },
});

router.post("/register", upload.single("idDocument"), async (req, res, next) => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields." });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload your ID document.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered. Please login.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role: "client",
      idDocument: {
        originalName: req.file.originalname,
        contentType: req.file.mimetype,
        size: req.file.size,
        data: req.file.buffer,
      },
    });

    const token = signUserToken(user);

    res.status(201).json({
      token,
      user: user.toPublicUser(),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = signUserToken(user);

    res.json({
      token,
      user: user.toPublicUser(),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({
    user: req.user.toPublicUser(),
  });
});

export default router;

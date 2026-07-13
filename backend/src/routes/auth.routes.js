const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const {
  requireAuth,
  signUserToken,
} = require("../middleware/auth");

const router = express.Router();

const uploadDirectory = path.join(
  __dirname,
  "..",
  "..",
  "uploads",
  "ids"
);

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, uploadDirectory);
  },

  filename(_req, file, callback) {
    const extension = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(
      Math.random() * 1_000_000_000
    )}${extension}`;

    callback(null, safeName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter(_req, file, callback) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error(
          "Only JPG, PNG, and PDF ID documents are allowed."
        )
      );
    }

    callback(null, true);
  },
});

function publicUser(user) {
  return {
    id: user._id.toString(),
    _id: user._id.toString(),
    fullName: user.fullName,
    name: user.fullName,
    email: user.email,
    role: user.role,
  };
}

router.post(
  "/register",
  upload.single("idDocument"),
  async (req, res, next) => {
    try {
      const fullName = String(
        req.body.fullName || ""
      ).trim();

      const email = String(req.body.email || "")
        .trim()
        .toLowerCase();

      const password = String(
        req.body.password || ""
      );

      if (!fullName || !email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Full name, email, and password are required.",
        });
      }

      if (fullName.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Full name must contain at least 2 characters.",
        });
      }

      const validEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!validEmail) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid email address.",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 6 characters.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Upload your ID document.",
        });
      }

      const existingUser = await User.findOne({
        email,
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists.",
        });
      }

      const passwordHash = await bcrypt.hash(
        password,
        12
      );

      const user = await User.create({
        fullName,
        email,
        passwordHash,

        // Never accept organizer/admin role from public registration.
        role: "client",

        idDocument: `/uploads/ids/${req.file.filename}`,
      });

      const token = signUserToken(user);

      return res.status(201).json({
        success: true,
        message: "Account created successfully.",
        token,
        user: publicUser(user),
      });
    } catch (error) {
      next(error);
    }
  }
);

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

module.exports = router;

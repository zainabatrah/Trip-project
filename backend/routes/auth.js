import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// --- simple local upload setup ---
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

// --- TEMP in-memory users (replace later with DB) ---
const users = []; // {id, fullName, email, passwordHash, status, idDocPath}

// helper
function signToken(user) {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  return jwt.sign({ sub: user.id, email: user.email, status: user.status }, secret, {
    expiresIn: "7d",
  });
}

// POST /api/auth/register  (multipart/form-data)
router.post("/register", upload.single("idFile"), async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Missing fullName/email/password" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "ID file is required (field name: idFile)" });
    }

    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return res.status(409).json({ error: "Email already used" });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = {
      id: crypto.randomUUID(),
      fullName,
      email,
      passwordHash,
      status: "pending",
      idDocPath: req.file.filename,
    };

    users.push(user);

    return res.status(201).json({
      message: "Registered. Pending approval.",
      user: { id: user.id, fullName: user.fullName, email: user.email, status: user.status },
    });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/login (application/json)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Missing email/password" });

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);

    return res.json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, status: user.status },
    });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;

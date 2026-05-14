const express = require("express");
const multer = require("multer");

const {
  register,
  login,
  getStatus,
  approveUser,
} = require("../controllers/authController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post("/register", upload.single("idFile"), register);
router.post("/login", login);
router.get("/status", protect, getStatus);
router.patch("/users/:userId/status", protect, adminOnly, approveUser);

module.exports = router;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

async function register(req, res) {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      idFile: req.file ? req.file.path : "",
      approvalStatus: "pending",
    });

    return res.status(201).json({
  message: "Registered successfully. Waiting for admin approval.",
  user: {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    approvalStatus: user.approvalStatus,
  },
});
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ error: "Registration failed" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (user.approvalStatus !== "approved") {
      return res.status(403).json({
        error: "Account is not approved yet",
        approvalStatus: user.approvalStatus,
      });
    }

    const token = createToken(user._id);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ error: "Login failed" });
  }
}

async function getStatus(req, res) {
  return res.json({
    approvalStatus: req.user.approvalStatus,
    role: req.user.role,
  });
}

async function approveUser(req, res) {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { approvalStatus: status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      message: "User status updated",
      user,
    });
  } catch (error) {
    console.error("Approve user error:", error.message);
    return res.status(500).json({ error: "Could not update user status" });
  }
}

module.exports = {
  register,
  login,
  getStatus,
  approveUser,
};
const jwt = require("jsonwebtoken");

const User = require(
  "../models/User"
);

async function requireAuth(
  req,
  res,
  next
) {
  try {
    const authorizationHeader =
      req.headers.authorization || "";

    const token =
      authorizationHeader.startsWith(
        "Bearer "
      )
        ? authorizationHeader.slice(7)
        : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Missing authorization token.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET is missing from backend/.env"
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.userId
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "The authenticated user does not exist.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error.name ===
        "TokenExpiredError"
          ? "Your session has expired. Please login again."
          : "Invalid authorization token.",
    });
  }
}

function requireOrganizer(
  req,
  res,
  next
) {
  const role = String(
    req.user?.role || ""
  ).toLowerCase();

  if (
    ![
      "organizer",
      "admin",
    ].includes(role)
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Organizer access is required.",
    });
  }

  next();
}

function signUserToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is missing from backend/.env"
    );
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

module.exports = {
  requireAuth,
  requireOrganizer,
  signUserToken,
};
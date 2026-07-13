const jwt = require("jsonwebtoken");

const User = require(
  "../models/User"
);
const ORGANIZER_EMAIL =
  "mazayaorganiz@gmail.com";
const ORGANIZER_EMAIL_ALIASES =
  new Set([
    ORGANIZER_EMAIL,
    "mazayaorganiz.gmail.com",
  ]);

function normalizeAuthEmail(email) {
  const normalized = String(
    email || ""
  )
    .trim()
    .toLowerCase();

  if (
    ORGANIZER_EMAIL_ALIASES.has(
      normalized
    )
  ) {
    return ORGANIZER_EMAIL;
  }

  return normalized;
}

function normalizeRole(role) {
  const normalized = String(
    role || "client"
  )
    .trim()
    .toLowerCase();

  if (normalized === "user") {
    return "client";
  }

  return normalized || "client";
}

function getEffectiveUserRole(user) {
  const role = normalizeRole(
    user?.role
  );

  if (
    [
      "organizer",
      "admin",
    ].includes(role)
  ) {
    return role;
  }

  if (
    normalizeAuthEmail(
      user?.email
    ) === ORGANIZER_EMAIL
  ) {
    return "organizer";
  }

  return role;
}

function applyEffectiveAccess(user) {
  if (!user) {
    return null;
  }

  user.email =
    normalizeAuthEmail(
      user.email
    );
  user.role =
    getEffectiveUserRole(
      user
    );

  return user;
}

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

    req.user =
      applyEffectiveAccess(
        user
      );

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

async function optionalAuth(
  req,
  _res,
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

    if (!token || !process.env.JWT_SECRET) {
      req.user = null;
      next();

      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.userId
    );

    req.user = user
      ? applyEffectiveAccess(
          user
        )
      : null;
    next();
  } catch (_error) {
    req.user = null;
    next();
  }
}

function requireOrganizer(
  req,
  res,
  next
) {
  const role =
    getEffectiveUserRole(
      req.user
    );

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
      role: getEffectiveUserRole(
        user
      ),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireOrganizer,
  normalizeAuthEmail,
  getEffectiveUserRole,
  signUserToken,
};

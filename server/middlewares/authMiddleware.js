const jwt = require("jsonwebtoken"); // JWT for verifying token signatures
const { User } = require("../models");

// @desc   Middleware to verify JWT token and authenticate user
// @access Private
const authenticateToken = async (req, res, next) => {
  // Extract token from 'Authorization' header
  const authHeader = req.headers["authorization"];
  console.log("Auth header:", authHeader ? "Present" : "Missing");

  // Format: 'Bearer <token>' or just token
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  // If no token found, respond with 401 Unauthorized
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify token using JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    console.log("Token decoded successfully, user ID:", decoded.id);

    // Ensure controllers relying on req.user.id have a numeric DB id
    let resolvedUserId = decoded.id;

    // If no id but we have a Firebase UID, resolve to our DB user id
    if (!resolvedUserId && decoded.uid) {
      const dbUser = await User.findOne({ where: { firebaseUid: decoded.uid } });
      if (dbUser) {
        resolvedUserId = dbUser.id;
        console.log("Resolved Firebase UID to DB user ID:", resolvedUserId);
      }
    }

    // Attach combined user info
    req.user = { ...decoded, id: resolvedUserId };
    console.log("User attached to request:", req.user.id);

    return next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    // Align with axios interceptor which expects 401 + message "jwt expired" to trigger refresh
    if (err && err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "jwt expired" });
    }
    return res.status(403).json({ message: "Invalid token" }); // Forbidden if verification fails
  }
};

module.exports = { authenticateToken }; // Export middleware for use in routes
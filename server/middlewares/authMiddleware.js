const jwt = require("jsonwebtoken"); // JWT for verifying token signatures

// @desc   Middleware to verify JWT token and authenticate user
// @access Private
const authenticateToken = (req, res, next) => {
  // Extract token from 'Authorization' header
  const authHeader = req.headers["authorization"];

  // Format: 'Bearer <token>' or just token
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  // If no token found, respond with 401 Unauthorized
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    // Verify token using JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    req.user = decoded; // Attach decoded user info to request object
    next(); // Move to next middleware or route handler
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" }); // Forbidden if verification fails
  }
};

module.exports = { authenticateToken }; // Export middleware for use in routes
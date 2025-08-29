// controllers/authController.js

const admin = require("../services/firebaseAdmin"); // Firebase Admin SDK instance
const jwt = require("jsonwebtoken"); // For issuing custom JWT
const { User } = require("../models"); // Sequelize User model

// JWT secret for signing tokens (fallback if env var is missing)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// 🔐 Utility: Generate JWT for internal use from user ID
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
};

// ✅ Login route: Verifies Firebase ID token & issues backend JWT
exports.verifyFirebaseTokenAndIssueJWT = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    // Check if token is provided
    if (!firebaseToken) return res.status(400).json({ message: "Missing ID token" });

    // 🔍 Decode Firebase token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const { uid, email, name, picture, email_verified } = decodedToken;

    if (!email_verified) {
      return res.status(403).json({ message: "Email not verified. Please verify your email before logging in." });
    }

    // 🔍 Find user in DB using firebaseUid; if not found, create implicitly on login
    let user = await User.findOne({ where: { firebaseUid: uid } });
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email: email || `${uid}@example.com`,
        name: name || email || uid,
        profileImage: picture || null,
      });
    }

    // ✅ Issue backend JWT
    const token = generateToken(user.id);
    return res.json({ token });
  } catch (error) {
    console.error("Firebase verification error:", error);
    return res.status(401).json({ message: "Invalid Firebase token" });
  }
};

// ✅ Signup route: Verifies Firebase ID token, creates new user, and issues JWT
exports.verifyFirebaseSignupAndIssueJWT = async (req, res) => {
  try {
    const { firebaseToken } = req.body;
    if (!firebaseToken) return res.status(400).json({ message: "Missing ID token" });

    // Decode and verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const { uid, email, name, picture, email_verified } = decodedToken;

    if (!email_verified) {
      return res.status(403).json({ message: "Email not verified. Please verify your email before signing up." });
    }

    // 👤 Check if user already exists
    let user = await User.findOne({ where: { firebaseUid: uid } });

    // ✳️ Create new user if not found
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email,
        name: name || email,
        profileImage: picture || null,
      });
    }

    // ✅ Issue backend JWT
    const token = generateToken(user.id);
    return res.json({ token });
  } catch (error) {
    console.error("🔥 Firebase Signup Error:", error);
    return res.status(500).json({ message: "Signup failed" });
  }
};

// 📩 Controller to handle forgot password flow using Firebase Admin SDK
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // 🔍 Check if email was provided in the request body
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {

    // 🔗 Generate a Firebase password reset link with a redirect URL (used after successful reset)
    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = await admin.auth().generatePasswordResetLink(email, {
      url: `${frontendBaseUrl}/login`,
    });

    // Optionally, send this reset link via your own email service (nodemailer, etc.)
    // For demo, we just send it back in the response (don't do this in prod)
    res.status(200).json({ message: "Reset link sent", resetLink });
  } catch (err) {

    // 🛑 Handle any errors (e.g., invalid email, network issues)
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Unable to send reset link", error: err.message });
  }
};

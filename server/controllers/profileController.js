// Import required modules
const { User } = require("../models"); // Sequelize User model
// const admin = require("firebase-admin"); // Firebase Admin SDK
const path = require("path");
const fs = require("fs");

// ───────────────────────────────────────────────────────────────
// @desc    Get authenticated user's profile
// @route   GET /api/profile
// @access  Private (requires JWT + Firebase ID token)
// ───────────────────────────────────────────────────────────────

exports.getProfile = async (req, res) => {
  try {

    // Fetch user by their ID from the database
    const user = await User.findByPk(req.user.id);

    // If user not found, send 404 response
    if (!user) return res.status(404).json({ message: "User not found" });

    // Return user profile
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl || null,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    // Handle unexpected server error
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
};

// ───────────────────────────────────────────────────────────────
// @desc    Update user's name and/or email
// @route   PUT /api/profile
// @access  Private
// ───────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }

    // Find the current user in DB
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update name or email only if provided
    if (name) user.name = name;
    if (email) user.email = email;

    // Save changes
    await user.save();

    // Return updated profile
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// ───────────────────────────────────────────────────────────────
// @desc    Update user's profile image (uploaded file URL)
// @route   PUT /api/profile/image
// @access  Private
// @note    Image must be uploaded via multer middleware
// ───────────────────────────────────────────────────────────────
exports.updateProfileImage = async (req, res) => {
  try {

    if (!req.file) return res.status(400).json({ message: "No image file uploaded" });

    // Find the current user
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete previous image if exists
    if (user.imageUrl && fs.existsSync(user.imageUrl)) {
      fs.unlinkSync(user.imageUrl);
    }

    // Build full URL to the uploaded profile image
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/profile/${req.file.filename}`;

    // Save image URL to user record
    user.profileImage = imageUrl;
    await user.save();

    res.json({ message: "Profile image updated", imageUrl });
  } catch (err) {
    console.error("Error uploading profile image:", err);
    res.status(500).json({ message: "Failed to upload image", error: err.message });
  }
};

// ───────────────────────────────────────────────────────────────
// @desc    Change password for password-based accounts
// @route   POST /api/profile/change-password
// @access  Private
// @note    Works only for Firebase accounts created with email/password
// ───────────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    //password must contain 6 character
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Find user by ID
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch the Firebase user using UID
    const firebaseUser = await admin.auth().getUserByEmail(user.email); // Assumes `firebaseUid` is stored in DB
    if (!firebaseUser) return res.status(404).json({ message: "Firebase user not found" });

    // Check if the user uses email/password provider
    const provider = firebaseUser.providerData[0].providerId;
    if (provider !== "password") {
      return res.status(400).json({ message: "Password change not supported for this provider" });
    }

    // Update password using Firebase Admin SDK
    await admin.auth().updateUser(user.firebaseUid, { password: newPassword });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Failed to change password", error: err.message });
  }
};

// ───────────────────────────────────────────────────────────────
// @desc    Logout user (clears JWT cookie)
// @route   POST /api/logout
// @access  Private
// ───────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  // Clear the auth token stored in cookie (if applicable)
  try{
    res.clearCookie("jwtToken");
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Failed to logout" });
  }
};

// DELETE /profile/delete - Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete profile image file if exists
    if (user.imageUrl && fs.existsSync(user.imageUrl)) {
      fs.unlinkSync(user.imageUrl);
    }

    await user.destroy(); // Delete from database

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ message: "Failed to delete account" });
  }
};

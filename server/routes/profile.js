const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController"); // Import controller that handles profile-related logic
const {authenticateToken} = require("../middlewares/authMiddleware"); // Middleware to verify JWT tokens
const multer = require("multer"); // For handling file uploads (profile image upload)
const path = require("path");
const fs = require("fs");

// Create a storage location for profile images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join("uploads", "profileImages");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
/* ------------------------------- Profile Routes ------------------------------- */

// ✅ Get logged-in user's profile (protected route)
router.get("/", authenticateToken, profileController.getProfile);
// ✅ Update name/email or other profile fields (protected)
router.put("/", authenticateToken, profileController.updateProfile);
// ✅ Upload a new profile image (protected, with multer)
// `profileImage` should match form-data key
router.post("/upload-image", authenticateToken, upload.single("profileImage"), profileController.updateProfileImage); 
// ✅ Change password (protected)
router.post("/change-password", authenticateToken, profileController.changePassword);
// ✅ Log out (optional route; clears client-side token or session)
router.post("/logout", profileController.logout);
// ✅ delete
router.delete("/delete", authenticateToken, profileController.deleteAccount);

// Export the router to be used in main app
module.exports = router;

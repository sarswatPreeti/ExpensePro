const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST /api/auth/firebase-login
router.post("/firebase-login", authController.verifyFirebaseTokenAndIssueJWT);
router.post("/firebase-signup", authController.verifyFirebaseSignupAndIssueJWT);
router.post("/forgot-password", authController.forgotPassword);

module.exports = router;

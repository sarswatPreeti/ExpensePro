const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let serviceAccount;

try {
  if (process.env.RENDER === "true") {
    // On Render, read from secrets
    const secretPath = "/etc/secrets/firebaseServiceAccountKey.json";

    if (!fs.existsSync(secretPath)) {
      throw new Error(`Firebase service account key not found at ${secretPath}`);
    }

    serviceAccount = JSON.parse(fs.readFileSync(secretPath, "utf-8"));
  } else {
    // Local development
    const localPath = path.join(__dirname, "../config/firebaseServiceAccountKey.json");

    if (!fs.existsSync(localPath)) {
      throw new Error(`Firebase service account key not found at ${localPath}`);
    }

    serviceAccount = require(localPath);
  }

  // Initialize Firebase admin if not already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

} catch (err) {
  console.error("Firebase admin initialization error:", err.message);
  process.exit(1); // stop the app if Firebase can't initialize
}

module.exports = admin;

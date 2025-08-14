const admin = require("firebase-admin");

const serviceAccount = process.env.RENDER
  ? require("/etc/secrets/firebaseServiceAccountKey.json")  // Render secret
  : require("../config/firebaseServiceAccountKey.json");    // Local dev

// Prevent multiple initializations
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
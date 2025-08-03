const admin = require("firebase-admin");

// Prevent multiple initializations
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("../config/firebaseServiceAccountKey.json")),
  });
}

module.exports = admin;
const admin = require("firebase-admin");

try {
  // Prevent multiple initializations
  if (!admin.apps.length) {
    // Try to use environment variables first (for production/Render)
    if (process.env.FIREBASE_PRIVATE_KEY) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Firebase Admin initialized with environment variables");
    } else {
      // Fallback to service account key file for local development
      try {
        const serviceAccount = require("../config/firebaseServiceAccountKey.json");
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log("✅ Firebase Admin initialized with service account file");
      } catch (fileError) {
        console.warn("⚠️ Firebase service account key file not found, Firebase Admin not initialized");
        console.warn("This is expected in production if using environment variables");
      }
    }
  }
} catch (error) {
  console.error("Firebase admin initialization error:", error.message);
}

module.exports = admin;
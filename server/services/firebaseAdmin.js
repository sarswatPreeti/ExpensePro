const admin = require("firebase-admin");

function parseServiceAccountFromEnv() {
  // // Prefer a full JSON string via FIREBASE_SERVICE_ACCOUNT
  // if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  //   try {
  //     return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  //   } catch (e) {
  //     console.error("Invalid FIREBASE_SERVICE_ACCOUNT JSON:", e.message);
  //   }
  // }

  // Support base64-encoded JSON via FIREBASE_SERVICE_ACCOUNT_BASE64 (handy for Railway)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decoded = Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        "base64"
      ).toString("utf-8");
      return JSON.parse(decoded);
    } catch (e) {
      console.error("Invalid FIREBASE_SERVICE_ACCOUNT_BASE64:", e.message);
    }
  }

  // // Fallback to discrete env vars
  // if (process.env.FIREBASE_PRIVATE_KEY) {
  //   return {
  //     type: "service_account",
  //     project_id: process.env.FIREBASE_PROJECT_ID,
  //     private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  //     private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  //     client_email: process.env.FIREBASE_CLIENT_EMAIL,
  //     client_id: process.env.FIREBASE_CLIENT_ID,
  //     auth_uri: "https://accounts.google.com/o/oauth2/auth",
  //     token_uri: "https://oauth2.googleapis.com/token",
  //     auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  //     client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  //   };
  // }

  return null;
}

try {
  if (!admin.apps.length) {
    const envServiceAccount = parseServiceAccountFromEnv();
    if (envServiceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(envServiceAccount),
      });
      console.log("✅ Firebase Admin initialized from environment variables");
    } else {
      try {
        const fileServiceAccount = require("../config/firebaseServiceAccountKey.json");
        admin.initializeApp({
          credential: admin.credential.cert(fileServiceAccount),
        });
        console.log("✅ Firebase Admin initialized from local file");
      } catch (fileError) {
        console.warn("⚠️ Firebase service account not provided. Admin not initialized.");
      }
    }
  }
} catch (error) {
  console.error("Firebase admin initialization error:", error.message);
}

module.exports = admin;
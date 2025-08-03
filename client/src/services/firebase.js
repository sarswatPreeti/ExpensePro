// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// 🔐 Paste your Firebase config here
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASEAPP_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASEAPP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASEAPP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASEAPP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASEAPP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASEAPP_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASEAPP_MEASUREMENT_ID
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 👤 Auth and Google Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {app, auth, googleProvider};

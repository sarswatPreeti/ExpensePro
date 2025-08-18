// import axios from "axios";
// import { getAuth } from "firebase/auth";

// /**
//  * Create a custom axios instance with base configuration.
//  * This will be used throughout the app to make API calls to backend.
//  */
// const axiosInstance = axios.create({
//   baseURL: "http://localhost:4000/api", /// 🔄 Consider using environment variables instead of hardcoding
//   headers: {
//     "Content-Type": "application/json", // Sets JSON as the default content type
//   },
// });

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("jwtToken");
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`; // 🔐 Attach JWT if exists
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Axios Response Interceptor
// // This interceptor checks if a response has an error.
// // If the error is due to an expired JWT, it attempts to refresh the token
// // using Firebase Authentication and retry the original request.
// axiosInstance.interceptors.response.use(
//   (response) => response, // ✅ Pass successful responses through untouched
//   async (error) => {
//     const originalRequest = error.config;  // Save the original failed request config

//     // Handle JWT Expiration Error
//     if (
//       error.response?.status === 401 && // Unauthorized
//       !originalRequest._retry && // Prevent infinite retry loop
//       error.response?.data?.message === "jwt expired" // Our backend custom error
//     ) {
//       originalRequest._retry = true; // Mark request as being retried

//       // Get Firebase Auth instance and current user
//       const auth = getAuth();
//       const user = auth.currentUser;

//       // If no user is logged in, remove stored JWT and redirect to login
//       if (!user) {
//         localStorage.removeItem("jwtToken");
//         window.location.href = "/login";
//         return Promise.reject(error); // Stop request chain
//       }

//       try {
//         // 🔁 Get a new refreshed Firebase ID token
//         const idToken = await user.getIdToken(true); // `true` forces refresh

        
//         // Get a new custom JWT from your backend
//         // Send the refreshed Firebase token to your backend to get a new JWT
//         const res = await axios.post("/api/auth/firebase-verify", {
//           firebaseToken: idToken,
//         });

//         const newJwt = res.data.token;

//         // Save new JWT to localStorage
//         localStorage.setItem("jwtToken", newJwt);

//         // Retry the original request with the new JWT
//         originalRequest.headers["Authorization"] = `Bearer ${newJwt}`;
//         return axiosInstance(originalRequest); // 🔁 Retry the original API call
//       } catch (refreshError) {
//         // If refresh fails, clear session and redirect to login
//         console.error("Token refresh failed:", refreshError);
//         localStorage.removeItem("jwtToken");
//         window.location.href = "/login";
//         return Promise.reject(refreshError); // Stop request chain
//       }
//     }
    
//     // For all other errors, reject the response
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;

// client/src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle Unauthorized responses globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ Unauthorized! Token might be missing, invalid, or expired.");
      // Optional: auto logout
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

// import React, { useCallback, useEffect, useState } from "react";
// import axiosInstance from "../axiosInstance";
// import { getAuth, signOut, updateProfile, updatePassword, onAuthStateChanged } from "firebase/auth";
// import { useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const ProfilePage = () => {
//   // 🔧 Local State Management
//   const [profile, setProfile] = useState(null); // Stores fetched user profile from backend
//   const [newName, setNewName] = useState(""); // Input for updating display name
//   const [newPassword, setNewPassword] = useState(""); // Input for updating password
//   const [imageFile, setImageFile] = useState(null);  // File input for profile image
//   const [updating, setUpdating] = useState(false); //loading indicator for update operation
//   const navigate = useNavigate();
  

//    // 📡 Fetch Profile From Backend
//   const fetchProfile = useCallback(async () => {
//     try {
//       const token = localStorage.getItem("jwtToken");

//       // If JWT is not found, redirect to login
//       if (!token) {
//         console.log("Token not found, redirecting...");
//         navigate("/login");
//         return;
//       }

//       // Make authenticated request to get user profile
//       const response = await axiosInstance.get("/profile");
//       setProfile(response.data); // Save profile data to state
//     } catch (err) {
//       console.error("Failed to fetch profile:", err);
//       toast.error("Session expired or failed to load profile.");

//       // Clear session and redirect
//       localStorage.removeItem("jwtToken");
//       navigate("/login");
//     }
//   },[navigate]);

//   // 🔁 Fetch profile once on component mount
//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         fetchProfile();
//       } else {
//         console.warn("Firebase user not logged in.");
//         toast.warn("Please login to continue.");
//         navigate("/login");
//       }
//     });
//     return () => unsubscribe(); // clean up
//   }, [fetchProfile, navigate]);

//   // ✏️ Handle Profile Update
//   const handleUpdateProfile = async () => {
//     const auth = getAuth();
//     const user = auth.currentUser;

//     if (!user) {
//       toast.error("User not authenticated. Please login again.");
//       return;
//     }

//     if (newPassword && newPassword.length < 6) {
//       toast.warn("Password must be at least 6 characters long.");
//       return;
//     }

//     setUpdating(true);
//     try {
//       // 🔁 Update display name in Firebase & Backend
//       if (newName && newName !== user.displayName) {
//         await updateProfile(user, { displayName: newName });
//         await axiosInstance.put("/profile/update", { name: newName });
//       }

//       // 🔐 Update password in Firebase only
//       if (newPassword) {
//         await updatePassword(user, newPassword);
//       }

//       // 📷 Upload profile image to backend
//       if (imageFile) {
//         const formData = new FormData();
//         formData.append("profileImage", imageFile);
//         await axiosInstance.post("/profile/image", formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       }

//       toast.success("Profile updated successfully!");
//       fetchProfile(); // Refresh the UI with updated profile
//     } catch (err) {
//       console.error("Update failed:", err);
//       toast.error("Failed to update profile.");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   // 🚪 Logout Function
//   const handleLogout = async () => {
//     try {
//       const auth = getAuth();
//       await signOut(auth); // Sign out from Firebase
//     } catch (err) {
//       console.warn("Error signing out from Firebase:", err);
//     } finally {

//       // Clear JWT & redirect
//       localStorage.removeItem("jwtToken");
//       toast.info("Logged out.");
//       navigate("/login");
//     }
//   };

//   // ❌ Delete Account Function
//   const handleDeleteAccount = async () => {
//     if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

//     try {
//       const auth = getAuth();
//       const user = auth.currentUser;

//       // Delete from backend first
//       await axiosInstance.delete("/profile/delete");

//       // Then delete from Firebase Auth
//       if (user) await user.delete();

//       localStorage.removeItem("jwtToken");
//       toast.success("Account deleted.");
//       navigate("/signup");
//     } catch (error) {
//         if (error.code === "auth/requires-recent-login") {
//           toast.warn("Please re-login before deleting your account.");
//           navigate("/login");
//         } else {
//           console.error("Failed to delete account:", error);
//           toast.error("Failed to delete account.");
//         }
//       }
//   };

//   // 🧼 Handle Loading State
//   if (!profile) {
//     return <div className="text-center mt-10 text-gray-600">Loading profile...</div>;
//   }

//   // 🖼️ Profile UI
//   return (
//     <div className="max-w-2xl mx-auto px-6 py-10 animate-fade-in">
//       <div className="bg-white shadow-xl rounded-xl p-8 space-y-6">

//         {/* Profile Header */}
//         <div className="flex items-center gap-4">
//           <img
//             src={profile.imageUrl || "https://via.placeholder.com/100"}
//             alt="Profile"
//             className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
//           />
//           <div>
//             <h2 className="text-xl font-semibold">{profile.name}</h2>
//             <p className="text-sm text-gray-600">{profile.email}</p>
//             <p className="text-xs text-gray-400">
//               Joined: {new Date(profile.createdAt).toLocaleDateString()}
//             </p>
//           </div>
//         </div>

//         {/* Profile Update Form */}
//         <div className="space-y-4">
//           <input
//             type="text"
//             value={newName}
//             onChange={(e) => setNewName(e.target.value)}
//             placeholder="New name"
//             className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
//           />

//           <input
//             type="password"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             placeholder="New password"
//             className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
//           />

//           <input
//             type="file"
//             onChange={(e) => setImageFile(e.target.files[0])}
//             className="w-full"
//           />

//           <button
//             disabled={updating}
//             onClick={handleUpdateProfile}
//             className={`w-full py-2 rounded-md transition ${
//               updating
//                 ? "bg-blue-300 cursor-not-allowed"
//                 : "bg-blue-600 text-white hover:bg-blue-700"
//             }`}
//           >
//             {updating ? "Updating..." : "Update Profile"}
//           </button>
//         </div>

//         {/* Logout & Delete Buttons */}
//         <div className="flex justify-between gap-4 mt-6">
//           <button
//             onClick={handleLogout}
//             className="flex-1 bg-gray-200 text-black py-2 rounded-md hover:bg-gray-300 transition"
//           >
//             Logout
//           </button>
//           <button
//             onClick={handleDeleteAccount}
//             className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
//           >
//             Delete Account
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;

// src/pages/ProfilePage.js

// import React, { useEffect, useState } from "react";
// import { getAuth, onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
// import { useNavigate } from "react-router-dom";
// import { FaMoon, FaSun, FaEdit, FaTrash, FaSignOutAlt } from "react-icons/fa";

// const ProfilePage = () => {
//   const auth = getAuth();
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [darkMode, setDarkMode] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (currentUser) setUser(currentUser);
//       else navigate("/login");
//     });
//     return () => unsubscribe();
//   }, [auth, navigate]);

//   const handleLogout = async () => {
//     await signOut(auth);
//     navigate("/login");
//   };

//   const handleDelete = async () => {
//     if (window.confirm("Are you sure you want to delete your account?")) {
//       try {
//         await deleteUser(auth.currentUser);
//         navigate("/signup");
//       } catch (error) {
//         alert("Error deleting account: " + error.message);
//       }
//     }
//   };

//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode);
//     document.documentElement.classList.toggle("dark", !darkMode);
//   };

//   if (!user) return null;

//   return (
//     <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300 px-4">
//       <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6">
//         <div className="flex flex-col items-center text-center">
//           <div className="relative mb-4">
//             <img
//               src="./images/image.png"
//               alt="Profile"
//               className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500 shadow-md"
//             />
//           </div>
//           <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user.displayName || "Anonymous User"}</h2>
//           <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
//         </div>

//         <div className="mt-6 space-y-4">
//           <button
//             onClick={() => navigate("/edit-profile")}
//             className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition"
//           >
//             <FaEdit /> Edit Profile
//           </button>

//           <button
//             onClick={toggleDarkMode}
//             className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg transition"
//           >
//             {darkMode ? <FaSun /> : <FaMoon />} Toggle Mode
//           </button>

//           <button
//             onClick={handleLogout}
//             className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
//           >
//             <FaSignOutAlt /> Logout
//           </button>

//           <button
//             onClick={handleDelete}
//             className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
//           >
//             <FaTrash /> Delete Account
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;

import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "../axiosInstance";
import "react-toastify/dist/ReactToastify.css";
import {
  FaMoon,
  FaSun,
  FaEdit,
  FaTrash,
  FaSignOutAlt,
  FaPlus,
} from "react-icons/fa";

const ProfilePage = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else navigate("/login");
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  // 🚪 Logout Function
  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth); // Sign out from Firebase
    } catch (err) {
      console.warn("Error signing out from Firebase:", err);
    } finally {

      // Clear JWT & redirect
      localStorage.removeItem("jwtToken");
      toast.info("Logged out.");
      navigate("/login");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) throw new Error("User not authenticated");

      // 1. Delete from Firebase first
      await user.delete();

      // 2. Then delete from your backend database
      await axios.delete("/profile/delete");

      // 3. Clear localStorage & redirect
      localStorage.removeItem("jwtToken");
      toast.success("Account deleted.");
      navigate("/register");

    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        toast.warn("Please re-login before deleting your account.");
        navigate("/login");
      } else {
        console.error("Failed to delete account:", error);
        toast.error("Failed to delete account.");
      }
    }
  };

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.documentElement.classList.toggle("dark", newMode);
  };

  if (!user) return null;

  const profileImage = user.photoURL || "/images/image.png";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800 px-4 py-10">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-8 space-y-6 transition-all duration-300">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32">
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-4 border-indigo-500 shadow-lg"
            />
          </div>
          <h1 className="text-2xl font-bold mt-4 text-gray-800 dark:text-white">
            {user.displayName || "Anonymous User"}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/edit-profile")}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition"
          >
            <FaEdit /> Edit Profile
          </button>

          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white rounded-xl transition"
          >
            {darkMode ? <FaSun /> : <FaMoon />} Toggle Mode
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition col-span-1 sm:col-span-2"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t dark:border-gray-700">
          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition"
          >
            <FaTrash /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

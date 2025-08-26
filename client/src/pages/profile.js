import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "../api/axiosInstance";
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [imgSrc, setImgSrc] = useState("/images/image.png");

  // Compute a safe profile image URL
  useEffect(() => {
    if (!user) return;

    const raw = user.photoURL;
    let url = (raw && raw !== "null" && raw !== "undefined") ? String(raw) : "";

    // Fix potential server path mismatch: /uploads/profile/ -> /uploads/profileImages/
    if (url.includes("/uploads/profile/")) {
      url = url.replace("/uploads/profile/", "/uploads/profileImages/");
    }

    // If still falsy, fall back to default avatar
    setImgSrc(url || "/images/image.png");
  }, [user]);

  // 🚪 Logout Function
  const handleLogout = async () => {
    await logout();
    toast.info("Logged out.");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    try {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800 px-4 py-10">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-8 space-y-6 transition-all duration-300">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32">
            <img
              src={imgSrc}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-4 border-indigo-500 shadow-lg"
              onError={() => {
                if (imgSrc !== "/images/image.png") setImgSrc("/images/image.png");
              }}
              referrerPolicy="no-referrer"
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
      <ToastContainer />
    </div>
  );
};

export default ProfilePage;

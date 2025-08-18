import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
} from "firebase/auth";
import { app } from "../services/firebase";
import axios from "../api/axiosInstance";
import {Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// SignupPage component handles user registration using Firebase Auth with email/password and Google OAuth.
// Includes form validation, password generation, password strength feedback, and email verification flow.
const SignupPage = () => {

  // Form input states for controlled components
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // UI states for feedback and logic control
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);

  const navigate = useNavigate();

  // Basic password strength evaluator based on length and character mix
  const getPasswordStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.length >= 8)
      return "Strong";
    return "Medium";
  };

  // Generates a random secure password using lowercase, uppercase, numbers, and symbols.. also Ensures at least one of each type is present and avoids repetition
  const generatePassword = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+";
    const allChars = (lowercase + uppercase + numbers + symbols).split("");

    const getRandom = (arr) => {
      const index = Math.floor(Math.random() * arr.length);
      const char = arr[index];
      arr.splice(index, 1); // remove selected char to avoid repetition
      return char;
    };

    // Start with one from each required type
    let availableChars = [...allChars];
    let passwordChars = [
      getRandom(lowercase.split("")),
      getRandom(uppercase.split("")),
      getRandom(numbers.split("")),
      getRandom(symbols.split("")),
    ];

    // Remove already used characters from available pool
    availableChars = availableChars.filter(c => !passwordChars.includes(c));

    // Fill up to 8 characters with remaining unique chars
    while (passwordChars.length < 8 && availableChars.length > 0) {
      passwordChars.push(getRandom(availableChars));
    }

    // Shuffle the result
    const newPassword = passwordChars.sort(() => Math.random() - 0.5).join("");

    // Set in form
    setFormData({
      ...formData,
      password: newPassword,
      confirmPassword: newPassword,
    });
  };

  // Updates form state as user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validates password format against common security rules
  const validatePassword = (password) => {
    return (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*]/.test(password)
    );
  };

  // Main signup handler: validates form, creates Firebase user, sends email verification.... Polls for verification and then syncs with backend
  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!validatePassword(formData.password)) {
      setMessage(
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a special character and a number."
      );
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth(app);
      const result = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = result.user;

      await updateProfile(user, {
        displayName: formData.name,
      });

      // ✅ Send email verification
      await sendEmailVerification(user);
      alert("A verification email has been sent to your email address. Please verify before logging in.");

      // Show message
      setMessage("Waiting for email verification...");

      // Polling mechanism to check if user has verified email
      // If verified, request JWT token from backend and redirect to dashboard
      const intervalId = setInterval(async () => {
        await user.reload(); // refresh user state
        if (auth.currentUser.emailVerified) {
          clearInterval(intervalId);

          const idToken = await user.getIdToken(true);
          const response = await axios.post("/auth/firebase-signup", {
            firebaseToken: idToken,
            name: formData.name,
            email: formData.email,
          });
          const backendToken = response.data.token;
          localStorage.setItem("jwtToken", backendToken);

          setMessage("Email verified! Redirecting to dashboard...");
          navigate("/dashboard");
        }
      }, 5000); // check every 5 seconds
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth signup logic via Firebase popup and backend token exchange
  const handleGoogleSignup = async () => {
    setLoading(true);
    setMessage("");
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const user = result.user;
      const idToken = await user.getIdToken(true);

      const response = await axios.post("/auth/firebase-signup", {
        firebaseToken: idToken,
        name: user.displayName,
        email: user.email,
      });

      const backendToken = response.data.token;
      localStorage.setItem("jwtToken", backendToken);

      setMessage("Google signup successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || err.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8 transition-all duration-500">

      {/* Signup Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[500px] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-5 sm:p-6 md:p-8 rounded-2xl shadow-xl transition-all duration-500 mx-auto relative"
      >

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-indigo-600 dark:text-indigo-400">
          Create your account
        </h2>

        <form onSubmit={handleSignup} className="space-y-5">

          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 bg-white dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-800 transition-all duration-300"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 bg-white dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-800 transition-all duration-300"
            />
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={18} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300"
              />
            </div>

            {/* Generate password button and password strength */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 space-y-2 sm:space-y-0 sm:gap-4">
              <button
                type="button"
                onClick={generatePassword}
                className="text-sm text-indigo-600 font-medium hover:text-blue-800 dark:text-gray-300 dark:hover:text-white flex items-center gap-1 transition-all duration-300"
              >
                🔁 Generate password
              </button>

              {formData.password && (
                <p
                  className={`text-xs font-semibold transition-all duration-300 ${
                    getPasswordStrength(formData.password) === "Strong"
                      ? "text-green-600 dark:text-green-400"
                      : getPasswordStrength(formData.password) === "Medium"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  Strength: {getPasswordStrength(formData.password)}
                </p>
              )}
            </div>

            {showPasswordInfo && (
              <div className="text-xs text-gray-600 space-y-1 mt-2 dark:text-[#E5E7EB] transition-all duration-300">
                <p>Password must:</p>
                <ul className="list-disc list-inside ml-3">
                  <li>Be at least 6 characters long</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Contain a number</li>
                  <li>Include a special character (!@#$%^&*)</li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 bg-white dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-800   transition-all duration-300"
            />

            {/* Show password button*/}
            <span
              className="absolute right-3 top-2.5 cursor-pointer text-sm text-indigo-600 hover:text-indigo-500 dark:text-gray-300 dark:hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>

            {/* password matching */}
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white font-medium rounded-lg transition-all duration-300 shadow-sm ${
              loading
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            }`}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center text-sm text-gray-500 dark:text-white transition-all duration-300">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700" />
          <span className="px-2">Or sign up with</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700" />
        </div>

        {/* Google Signup Button */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white dark:bg-[#1f2937] border border-gray-300 dark:border-gray-600 hover:shadow-md text-gray-800 dark:text-gray-100 font-semibold py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-base"
        >
          <img
            src="https://img.icons8.com/color/24/000000/google-logo.png"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* Footer Link */}
        <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400 transition-all duration-300">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-800 font-medium dark:text-indigo-400 dark:hover:text-indigo-500"
          >
            Login
          </a>
        </div>

        {/* Feedback Message */}
        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium transition-all duration-300 ${
              message.toLowerCase().includes("success")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );

};

export default SignupPage;



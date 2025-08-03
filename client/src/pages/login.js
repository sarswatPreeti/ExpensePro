import React, { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "../axiosInstance";
import { app } from "../services/firebase"; // Firebase app config
import { Eye, EyeOff, Loader2, Mail, Lock, LogIn} from "lucide-react";

const LoginPage = () => {

  // Form state for email and password
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // UI and error handling states
  const [errorMsg, setErrorMsg] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // State for unverified user handling
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  const [resendEmail, setResendEmail] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [loginUser, setLoginUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth(app);

  // Update form state on input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  // Handle user login via email/password
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setMessage("");
    setShowResend(false);
    setResendMsg("");

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = result.user;

      // If user email is not verified, prevent login
      if (!user.emailVerified) {
        setLoginUser(user);
        setShowResend(true);
        setError("Email not verified. Please verify before logging in.");
        await signOut(auth);
        setLoading(false);
        return;
      }

      // Get Firebase ID token and authenticate with backend
      const idToken = await user.getIdToken(true);
      const response = await axios.post("/auth/firebase-login", {
        firebaseToken: idToken,
      });

      // Save backend-issued JWT
      const backendToken = response.data.token;
      localStorage.setItem("jwtToken", backendToken);

      setMessage("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle resending verification email
  const handleResendVerification = async () => {
    if (!loginUser) return;

    try {
      await sendEmailVerification(loginUser);
      setResendMsg("Verification email sent. Please check your inbox.");
    } catch (err) {
      console.error("Resend error:", err);
      setResendMsg("Failed to send verification email. Try again later.");
    }
  };

  // Handle Google Sign-In with Firebase
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken(true);

      const response = await axios.post("/auth/firebase-login", {
        firebaseToken: idToken,
      });

      const backendToken = response.data.token;
      localStorage.setItem("jwtToken", backendToken);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || "Google login failed");
    }
  };

  // Handle forgot password email request
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email.");
      return;
    }

    try {
      const res = await axios.post("/auth/forgot-password", {
        email: formData.email,
      });
      console.log(res.data);
      setResendMsg("Password reset link sent. Check your email.");
    } catch (err) {
      console.error(err);
      setError("Could not send reset link.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8 transition-all duration-500 ">

      {/* login Card */}
      <div className="w-full max-w-[500px] sm:max-w-md md:max-w-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-5 sm:p-6 md:p-8 rounded-2xl shadow-xl transition-all duration-500 mx-auto relative">

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-indigo-600 dark:text-indigo-400">Login to Your Account</h2>

        {/* Error message (email not verified) */}
        {errorMsg && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm mb-4 dark:bg-red-800 dark:text-red-100">
            {errorMsg}
            {unverifiedUser && (
              <div className="mt-2">
                <button
                  onClick={handleResendVerification}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Resend Verification Email
                </button>
              </div>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email Field */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 bg-white dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-800   transition-all duration-300"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 bg-white dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-800   transition-all duration-300"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 dark:text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Forgot password link */}
          <div className="text-right mb-4">
            <button
              onClick={handleForgotPassword}
              type="button"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 text-white rounded-lg transition-colors duration-300 flex justify-center items-center shadow-sm ${
              loading
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><LogIn className="mr-2" size={18} /> Login</>}
          </button>
        </form>

        {/* Forgot password or resend message */}
        {resendMsg && (
          <p className="mt-4 text-center text-sm text-green-600 dark:text-green-400"> {resendMsg} </p>
        )}

        {error && (
          <p className="mt-4 text-center text-sm text-red-500 dark:text-red-400"> {error} </p>
        )}

        {/* Divider */}
        <div className="my-6 flex items-center text-sm text-gray-500 dark:text-white transition-all duration-300">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700" />
          <span className="px-2">Or login with</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700" />
        </div>

        {/* Google login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white dark:bg-[#1f2937] border border-gray-300 dark:border-gray-600 hover:shadow-md text-gray-800 dark:text-gray-100 font-semibold py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-base"
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" 
            className="w-5 h-5" 
          />
          Continue with Google
        </button>

        {/* Footer Link */}
        <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400 transition-all duration-300">
          Don’t have an account?{" "}
          <a
            className="text-blue-600 hover:text-blue-800 font-medium dark:text-indigo-400 dark:hover:text-indigo-500"
            onClick={() => navigate("/register")}
          >
            Sign up
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

        {/* Resend Verification Section */}
        {showResend && (
          <div className="mt-4 border-t pt-4">
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">
              Your email is not verified.
            </p>
            <button
              onClick={handleResendVerification}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Resend Verification Email
            </button>
            {resendMsg && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">{resendMsg}</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default LoginPage;

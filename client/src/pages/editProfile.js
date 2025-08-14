import React, { useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  reauthenticateWithPopup
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import {
  FaArrowLeft,
  FaUserEdit,
  FaSave,
  FaSpinner,
  FaLock,
  FaEnvelope,
  FaPlus,
} from "react-icons/fa";

const EditProfilePage = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const storage = getStorage();

  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showForgotPrompt, setShowForgotPrompt] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async(currentUser) => {
      if (!currentUser) return navigate("/login");
      setUser(currentUser);
      setDisplayName(currentUser.displayName || "");
      setEmail(currentUser.email || "");
      setImagePreview(currentUser.photoURL || "/images/image.png");

      const methods = await fetchSignInMethodsForEmail(auth, currentUser.email);
      setIsGoogleUser(methods.includes("google.com"));
      setHasPassword(methods.includes("password"));
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append("profileImage", file);

    const res = await fetch("http://localhost:4000/api/profile/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Image upload failed");
    }

    const data = await res.json();
    return data.imageUrl; // URL to store in Firebase Auth or your DB
  };

  const uploadImageToFirebase = async (file) => {
    const imageRef = ref(storage, `profileImages/${user.uid}/${uuidv4()}`);
    const snapshot = await uploadBytes(imageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const validatePassword = (password) => {
    const requirements = [
      { regex: /.{8,}/, message: "Password must be at least 8 characters long" },
      { regex: /[A-Z]/, message: "Password must contain at least one uppercase letter" },
      { regex: /[a-z]/, message: "Password must contain at least one lowercase letter" },
      { regex: /[0-9]/, message: "Password must contain at least one number" },
      { regex: /[^A-Za-z0-9]/, message: "Password must contain at least one special character" },
    ];

    for (let req of requirements) {
      if (!req.regex.test(password)) {
        return req.message;
      }
    }
    return null; // no errors
  };

  const handleSave = async () => {
    console.log("Save started");
    setLoading(true);
    setErrorMsg("");
    setShowForgotPrompt(false);

    const timeout = setTimeout(() => {
      setLoading(false);
      setErrorMsg("Operation timed out. Please try again.");
    }, 10000); // 10 seconds

    try {
      let photoURL = uploadImageToServer(selectedImage);
      console.log("Before image upload");
      if (selectedImage) {
        try {
          photoURL = await uploadImageToFirebase(selectedImage);
          console.log("Image uploaded:", photoURL);
        } catch (err) {
          setErrorMsg("Image upload failed: " + err.message);
          setLoading(false);
          return;
        }
      }

      await updateProfile(user, { displayName, photoURL });
      await user.reload();
      setUser(auth.currentUser);
      setImagePreview(photoURL);

      if (email && email !== user.email) {
        await updateEmail(user, email);
      }

      if (newPassword) {
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
          setErrorMsg(passwordError);
          setLoading(false);
          return;
        }
        if (newPassword !== confirmNewPassword) {
          throw new Error("New passwords do not match");
        }

        // Reauthenticate before updating password
        if (hasPassword) {
          if (!oldPassword) {
            throw new Error("Please enter your current password to update it.");
          }
          const credential = EmailAuthProvider.credential(user.email, oldPassword);
          await reauthenticateWithCredential(user, credential);
        } else {
          const provider = new GoogleAuthProvider();
          await reauthenticateWithPopup(user, provider);
        }

        await updatePassword(user, newPassword);
        setHasPassword(true);
      }

      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        setErrorMsg("Old password is incorrect.");
      } else if (error.code === "auth/requires-recent-login") {
        setErrorMsg("Please log out and log back in to update sensitive info.");
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800 px-4 py-10">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500 flex items-center gap-2">
            <FaUserEdit /> Edit Profile
          </h2>
          <button
            onClick={() => navigate("/profile")}
            className="text-sm text-indigo-600 dark:text-indigo-500 hover:underline flex items-center gap-1"
          >
            <FaArrowLeft /> Back
          </button>
        </div>

        <div className="flex flex-col items-center">
          {/* Profile Image */}
          <div className="relative w-32 h-32 mb-4">
            <img
              src={imagePreview}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-4 border-indigo-500 shadow-lg"
            />
            <label
              htmlFor="imageUpload"
              className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 p-2 rounded-full cursor-pointer transition"
              title="Change Profile Picture"
            >
              <FaPlus className="text-white text-sm" />
            </label>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Display Name */}
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2 mb-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />

          {/* Email */}
          <div className="w-full relative mb-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 pr-10"
            />
            <FaEnvelope className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Password Section */}
          {hasPassword ? (
            <>
              <div className="w-full relative mb-0">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 pr-10"
                />
                <FaLock className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
              </div>

              <div className="w-full text-right mt-0 mb-2">
                <button
                  onClick={() => {
                    sendPasswordResetEmail(auth, email)
                      .then(() => {
                        setShowForgotPrompt(true);
                        setErrorMsg("");
                      })
                      .catch((err) => setErrorMsg(err.message));
                  }}
                  className="text-sm text-indigo-600 dark:text-indigo-500 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          ) : (
              <p className="text-sm text-yellow-500 text-center mb-4">
                You signed in with Google. Set a password below to also enable email login.
              </p>
          )}

          <div className="w-full relative mb-3">
            <input
              type="password"
              placeholder="New Password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 pr-10"
            />
            <FaLock className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
          </div>

          <div className="w-full relative mb-3">
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 pr-10"
            />
            <FaLock className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {errorMsg && <div className="text-red-500 text-sm text-center">{errorMsg}</div>}
        {showForgotPrompt && (
          <div className="text-green-600 text-sm text-center">
            Password reset link sent to your email.
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-lg font-semibold rounded-xl transition disabled:opacity-50"
        >
          {loading ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save Changes</>}
        </button>
      </div>
    </div>
  );
};

export default EditProfilePage;

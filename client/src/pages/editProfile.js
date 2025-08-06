// // import React, { useEffect, useState } from "react";
// // import {
// //   getAuth,
// //   onAuthStateChanged,
// //   updateProfile,
// // } from "firebase/auth";
// // import { useNavigate } from "react-router-dom";
// // import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// // import { v4 as uuidv4 } from "uuid";
// // import {
// //   FaArrowLeft,
// //   FaUserEdit,
// //   FaSave,
// //   FaSpinner,
// //   FaPlus
// // } from "react-icons/fa";

// // const EditProfilePage = () => {
// //   const auth = getAuth();
// //   const navigate = useNavigate();
// //   const storage = getStorage();

// //   const [user, setUser] = useState(null);
// //   const [displayName, setDisplayName] = useState("");
// //   const [bio, setBio] = useState("");
// //   const [selectedImage, setSelectedImage] = useState(null);
// //   const [imagePreview, setImagePreview] = useState("");
// //   const [loading, setLoading] = useState(false);

// //   useEffect(() => {
// //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
// //       if (!currentUser) return navigate("/login");
// //       setUser(currentUser);
// //       setDisplayName(currentUser.displayName || "");
// //       setImagePreview(currentUser.photoURL || "/images/image.png");
// //     });

// //     return () => unsubscribe();
// //   }, [auth, navigate]);

// //   const handleImageChange = (e) => {
// //     const file = e.target.files[0];
// //     if (!file) return;
// //     setSelectedImage(file);
// //     const reader = new FileReader();
// //     reader.onloadend = () => setImagePreview(reader.result);
// //     reader.readAsDataURL(file);
// //   };

// //   const uploadImageToFirebase = async (file) => {
// //     const imageRef = ref(storage, `profileImages/${user.uid}/${uuidv4()}`);
// //     const snapshot = await uploadBytes(imageRef, file);
// //     return await getDownloadURL(snapshot.ref);
// //   };

// //   const handleSave = async () => {
// //     if (!displayName) return alert("Display name cannot be empty!");
// //     setLoading(true);
// //     try {
// //       let photoURL = user.photoURL;

// //       if (selectedImage) {
// //         photoURL = await uploadImageToFirebase(selectedImage);
// //       }

// //       await updateProfile(user, {
// //         displayName,
// //         photoURL,
// //       });

// //       // You can also save bio in Firestore if needed (not done here)
// //       alert("Profile updated successfully!");
// //       navigate("/profile");
// //     } catch (error) {
// //       console.error("Error updating profile", error);
// //       alert("Failed to update profile: " + error.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800 px-4 py-10">
// //       <div className="w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-8 space-y-6">
// //         <div className="flex items-center justify-between">
// //           <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
// //             <FaUserEdit /> Edit Profile
// //           </h2>
// //           <button
// //             onClick={() => navigate("/profile")}
// //             className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
// //           >
// //             <FaArrowLeft /> Back
// //           </button>
// //         </div>

// //         {/* Profile image section */}
// //         <div className="flex flex-col items-center">
// //           <div className="relative w-32 h-32 mb-4">
// //             <img
// //               src={imagePreview}
// //               alt="Profile"
// //               className="w-full h-full rounded-full object-cover border-4 border-indigo-500 shadow-lg"
// //             />
// //             <label
// //               htmlFor="imageUpload"
// //               className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 p-2 rounded-full cursor-pointer transition"
// //               title="Change Profile Picture"
// //             >
// //               <FaPlus className="text-white text-sm" />
// //             </label>
// //             <input
// //               type="file"
// //               id="imageUpload"
// //               accept="image/*"
// //               onChange={handleImageChange}
// //               className="hidden"
// //             />
// //           </div>

// //           {/* Display Name */}
// //           <input
// //             type="text"
// //             placeholder="Display Name"
// //             value={displayName}
// //             onChange={(e) => setDisplayName(e.target.value)}
// //             className="w-full px-4 py-2 mb-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
// //           />

// //           {/* Bio Field (for future Firestore integration) */}
// //           <textarea
// //             placeholder="Write a short bio (optional)"
// //             rows={3}
// //             value={bio}
// //             onChange={(e) => setBio(e.target.value)}
// //             className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
// //           />
// //         </div>

// //         {/* Save Button */}
// //         <button
// //           onClick={handleSave}
// //           disabled={loading}
// //           className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-lg font-semibold rounded-xl transition disabled:opacity-50"
// //         >
// //           {loading ? (
// //             <>
// //               <FaSpinner className="animate-spin" /> Saving...
// //             </>
// //           ) : (
// //             <>
// //               <FaSave /> Save Changes
// //             </>
// //           )}
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default EditProfilePage;

// import React, { useEffect, useState } from "react";
// import {
//   getAuth,
//   onAuthStateChanged,
//   updateProfile,
//   updateEmail,
//   updatePassword,
//   reauthenticateWithCredential,
//   EmailAuthProvider,
//   sendPasswordResetEmail,
// } from "firebase/auth";
// import { useNavigate } from "react-router-dom";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { v4 as uuidv4 } from "uuid";
// import {
//   FaArrowLeft,
//   FaUserEdit,
//   FaSave,
//   FaSpinner,
//   FaLock,
//   FaEnvelope,
//   FaPlus
// } from "react-icons/fa";

// const EditProfilePage = () => {
//   const auth = getAuth();
//   const navigate = useNavigate();
//   const storage = getStorage();

//   const [user, setUser] = useState(null);
//   const [displayName, setDisplayName] = useState("");
//   const [email, setEmail] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState("");
//   const [oldPassword, setOldPassword] = useState("");
//   const [confirmNewPassword, setConfirmNewPassword] = useState("");
//   const [errorMsg, setErrorMsg] = useState("");
//   const [showForgotPrompt, setShowForgotPrompt] = useState(false);
//   const [loading, setLoading] = useState(false);
//    const [isGoogleUser, setIsGoogleUser] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (!currentUser) return navigate("/login");
//       setUser(currentUser);
//       setDisplayName(currentUser.displayName || "");
//       setEmail(currentUser.email || "");
//       setImagePreview(currentUser.photoURL || "/images/image.png");

//       const providerId = currentUser.providerData[0]?.providerId;
//       setIsGoogleUser(providerId === "google.com");
//     });

//     return () => unsubscribe();
//   }, [auth, navigate]);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setSelectedImage(file);
//     const reader = new FileReader();
//     reader.onloadend = () => setImagePreview(reader.result);
//     reader.readAsDataURL(file);
//   };

//   const uploadImageToFirebase = async (file) => {
//     const imageRef = ref(storage, `profileImages/${user.uid}/${uuidv4()}`);
//     const snapshot = await uploadBytes(imageRef, file);
//     return await getDownloadURL(snapshot.ref);
//   };

//   // const handleSave = async () => {
//   //   setLoading(true);
//   //   setErrorMsg("");

//   //   try {
//   //     let photoURL = user.photoURL;

//   //     if (selectedImage) {
//   //       photoURL = await uploadImageToFirebase(selectedImage);
//   //     }

//   //     // 1. Update display name + photo
//   //     await updateProfile(user, {
//   //       displayName,
//   //       photoURL,
//   //     });

//   //     // 2. Update email if changed
//   //     if (email && email !== user.email) {
//   //       await updateEmail(user, email);
//   //     }

//   //     // 3. Update password if filled
//   //     if (newPassword) {
//   //       if (newPassword.length < 6) {
//   //         throw new Error("Password must be at least 6 characters");
//   //       }
//   //       if (newPassword !== confirmNewPassword) {
//   //         throw new Error("New passwords do not match");
//   //       }

//   //       // re-authenticate using old password
//   //       const credential = EmailAuthProvider.credential(user.email, oldPassword);
//   //       await reauthenticateWithCredential(user, credential);
//   //       await updatePassword(user, newPassword);
//   //     }

//   //     alert("Profile updated successfully!");
//   //     navigate("/profile");
//   //   } catch (error) {
//   //     alert("Error updating profile: " + error.message);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleSave = async () => {
//     setLoading(true);
//     setErrorMsg("");
//     setShowForgotPrompt(false);

//     try {
//       let photoURL = user.photoURL;

//       if (selectedImage) {
//         photoURL = await uploadImageToFirebase(selectedImage);
//       }

//       await updateProfile(user, {
//         displayName,
//         photoURL,
//       });

//       if (email && email !== user.email) {
//         await updateEmail(user, email);
//       }

//       if (newPassword) {
//         if (newPassword.length < 6) {
//           throw new Error("Password must be at least 6 characters");
//         }
//         if (newPassword !== confirmNewPassword) {
//           throw new Error("New passwords do not match");
//         }

//         if (!isGoogleUser) {
//           const credential = EmailAuthProvider.credential(user.email, oldPassword);
//           await reauthenticateWithCredential(user, credential);
//         }

//         await updatePassword(user, newPassword);
//       }

//       alert("Profile updated successfully!");
//       navigate("/profile");
//     } catch (error) {
//       setErrorMsg(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800 px-4 py-10">
//       <div className="w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-8 space-y-6">
//         <div className="flex items-center justify-between">
//           <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
//             <FaUserEdit /> Edit Profile
//           </h2>
//           <button
//             onClick={() => navigate("/profile")}
//             className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
//           >
//             <FaArrowLeft /> Back
//           </button>
//         </div>

//         {/* Profile image */}
//         <div className="flex flex-col items-center">
//           <div className="relative w-32 h-32 mb-4">
//             <img
//               src={imagePreview}
//               alt="Profile"
//               className="w-full h-full rounded-full object-cover border-4 border-indigo-500 shadow-lg"
//             />
//             <label
//               htmlFor="imageUpload"
//               className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 p-2 rounded-full cursor-pointer transition"
//               title="Change Profile Picture"
//             >
//               <FaPlus className="text-white text-sm" />
//             </label>
//             <input
//               type="file"
//               id="imageUpload"
//               accept="image/*"
//               onChange={handleImageChange}
//               className="hidden"
//             />
//           </div>

//           {/* Display Name */}
//           <input
//             type="text"
//             placeholder="Display Name"
//             value={displayName}
//             onChange={(e) => setDisplayName(e.target.value)}
//             className="w-full px-4 py-2 mb-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 pr-10"
//           />

//           {/* Email */}
//           <div className="w-full relative mb-3">
//             <input
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 pr-10"
//             />
//             <FaEnvelope className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
//           </div>

//           {/* Password
//           <div className="w-full relative">
//             <input
//               type="password"
//               placeholder="New Password (min 6 chars)"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 pr-10"
//             />
//             <FaLock className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
//           </div> */}

//           {/* Old Password */}
//           {/* <div className="w-full relative mb-3">
//             <input
//               type="password"
//               placeholder="Current Password"
//               value={oldPassword}
//               onChange={(e) => setOldPassword(e.target.value)}
//               className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 pr-10"
//             />
//             <FaLock className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
//           </div> */}

//           {/* Forgot Password */}
//           {/* <div className="w-full text-right mb-4">
//             <button
//               onClick={() => {
//                 sendPasswordResetEmail(auth, email)
//                   .then(() => {
//                     setShowForgotPrompt(true);
//                     setErrorMsg("");
//                   })
//                   .catch((err) => setErrorMsg(err.message));
//               }}
//               className="text-sm text-indigo-600 hover:underline"
//             >
//               Forgot Password?
//             </button>
//           </div> */}

//           {/* New Password */}
//           {/* <div className="w-full relative mb-3">
//             <input
//               type="password"
//               placeholder="New Password (min 6 chars)"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 pr-10"
//             />
//             <FaLock className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
//           </div> */}

//           {/* Confirm New Password */}
//           {/* <div className="w-full relative mb-3">
//             <input
//               type="password"
//               placeholder="Confirm New Password"
//               value={confirmNewPassword}
//               onChange={(e) => setConfirmNewPassword(e.target.value)}
//               className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 pr-10"
//             />
//             <FaLock className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
//           </div> */}

//            {/* Password Section */}
//           {!isGoogleUser ? (
//             <>
//               {/* Old Password */}
//               <div className="w-full relative mb-3">
//                 <input
//                   type="password"
//                   placeholder="Current Password"
//                   value={oldPassword}
//                   onChange={(e) => setOldPassword(e.target.value)}
//                   className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 pr-10"
//                 />
//                 <FaLock className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
//               </div>

//               {/* Forgot Password */}
//               <div className="w-full text-right mb-4">
//                 <button
//                   onClick={() => {
//                     sendPasswordResetEmail(auth, email)
//                       .then(() => {
//                         setShowForgotPrompt(true);
//                         setErrorMsg("");
//                       })
//                       .catch((err) => setErrorMsg(err.message));
//                   }}
//                   className="text-sm text-indigo-600 hover:underline"
//                 >
//                   Forgot Password?
//                 </button>
//               </div>
//             </>
//           ) : (
//             <p className="text-sm text-yellow-500 text-center mb-4">
//               You signed in with Google. Set a password below to also enable email login.
//             </p>
//           )}

//           {/* New Password */}
//           <div className="w-full relative mb-3">
//             <input
//               type="password"
//               placeholder="New Password (min 6 chars)"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 pr-10"
//             />
//             <FaLock className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
//           </div>

//           {/* Confirm New Password */}
//           <div className="w-full relative mb-3">
//             <input
//               type="password"
//               placeholder="Confirm New Password"
//               value={confirmNewPassword}
//               onChange={(e) => setConfirmNewPassword(e.target.value)}
//               className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 pr-10"
//             />
//             <FaLock className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
//           </div>
//         </div>

//         {/* Error or Success Messages */}
//         {errorMsg && (
//           <div className="text-red-500 text-sm text-center">{errorMsg}</div>
//         )}
//         {showForgotPrompt && (
//           <div className="text-green-600 text-sm text-center">
//             Password reset link sent to your email.
//           </div>
//         )}

//         {/* {errorMsg && (
//           <div className="text-red-500 text-sm text-center">{errorMsg}</div>
//         )}
//         {showForgotPrompt && (
//           <div className="text-green-600 text-sm text-center">
//             Reset link sent to your email.
//           </div>
//         )} */}

//         {/* Save button */}
//         <button
//           onClick={handleSave}
//           disabled={loading}
//           className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-lg font-semibold rounded-xl transition disabled:opacity-50"
//         >
//           {loading ? (
//             <>
//               <FaSpinner className="animate-spin" /> Saving...
//             </>
//           ) : (
//             <>
//               <FaSave /> Save Changes
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default EditProfilePage;

import React, { useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
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
  const [errorMsg, setErrorMsg] = useState("");
  const [showForgotPrompt, setShowForgotPrompt] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) return navigate("/login");
      setUser(currentUser);
      setDisplayName(currentUser.displayName || "");
      setEmail(currentUser.email || "");
      setImagePreview(currentUser.photoURL || "/images/image.png");

      const providerId = currentUser.providerData[0]?.providerId;
      setIsGoogleUser(providerId === "google.com");
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

  const uploadImageToFirebase = async (file) => {
    const imageRef = ref(storage, `profileImages/${user.uid}/${uuidv4()}`);
    const snapshot = await uploadBytes(imageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSave = async () => {
    setLoading(true);
    setErrorMsg("");
    setShowForgotPrompt(false);

    try {
      let photoURL = user.photoURL;

      if (selectedImage) {
        photoURL = await uploadImageToFirebase(selectedImage);
      }

      await updateProfile(user, {
        displayName,
        photoURL,
      });

      if (email && email !== user.email) {
        await updateEmail(user, email);
      }

      if (newPassword) {
        if (newPassword.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        if (newPassword !== confirmNewPassword) {
          throw new Error("New passwords do not match");
        }

        if (!isGoogleUser) {
          const credential = EmailAuthProvider.credential(user.email, oldPassword);
          await reauthenticateWithCredential(user, credential);
        }

        await updatePassword(user, newPassword);
      }

      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        setErrorMsg("Old password is incorrect.");
      } else if (error.code === "auth/requires-recent-login") {
        setErrorMsg("For security reasons, please log out and log back in to update your password.");
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800 px-4 py-10">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaUserEdit /> Edit Profile
          </h2>
          <button
            onClick={() => navigate("/profile")}
            className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
          >
            <FaArrowLeft /> Back
          </button>
        </div>

        {/* Profile Image */}
        <div className="flex flex-col items-center">
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
          {!isGoogleUser ? (
            <>
              {/* Old Password */}
              <div className="w-full relative mb-3">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 pr-10"
                />
                <FaLock className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Forgot Password */}
              <div className="w-full text-right mb-4">
                <button
                  onClick={() => {
                    sendPasswordResetEmail(auth, email)
                      .then(() => {
                        setShowForgotPrompt(true);
                        setErrorMsg("");
                      })
                      .catch((err) => setErrorMsg(err.message));
                  }}
                  className="text-sm text-indigo-600 hover:underline"
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

          {/* New Password */}
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

          {/* Confirm New Password */}
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

        {/* Error or Success Messages */}
        {errorMsg && (
          <div className="text-red-500 text-sm text-center">{errorMsg}</div>
        )}
        {showForgotPrompt && (
          <div className="text-green-600 text-sm text-center">
            Password reset link sent to your email.
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-lg font-semibold rounded-xl transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" /> Saving...
            </>
          ) : (
            <>
              <FaSave /> Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditProfilePage;

const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  verifyLoginOtp,
  forgotPassword,
  verifyForgotOtp,
  resetPassword,
  resendOtp,
  getMe,
  updateProfile,
  updateAvatar,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { uploadImage } = require("../middleware/uploadMiddleware");

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-otp", verifyForgotOtp);
router.post("/reset-password/:token", resetPassword);
router.post("/resend-otp", resendOtp);

// Protected routes
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.put("/update-avatar", protect, uploadImage.single("avatar"), updateAvatar);

module.exports = router;

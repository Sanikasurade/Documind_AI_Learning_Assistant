const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return regex.test(password);
};

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      institution: user.institution || "",
      learningGoal: user.learningGoal || "",
      bio: user.bio || "",
      createdAt: user.createdAt,
    },
  });
};

// Build a nodemailer transporter (reused across functions)
const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// Generate a random 6-digit OTP string
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Send an OTP email
const sendOTPEmail = async ({ to, name, otp, subject, purpose }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"DocuMind" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#4f46e5">DocuMind – ${purpose}</h2>
        <p>Hi ${name},</p>
        <p>Your one-time verification code is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:10px;
                    color:#4f46e5;text-align:center;padding:24px 0">
          ${otp}
        </div>
        <p style="color:#666;font-size:13px">
          This code expires in <strong>10 minutes</strong>. 
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  });
};

// ─── Register ─────────────────────────────────────────────────────────────────

// @desc    Register user
// @route   POST /api/v1/auth/signup
// @access  Public
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: "Please provide name, email, and password." });

  if (!validatePassword(password))
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." });

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(409).json({ success: false, message: "Email already in use." });

  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res);
};

// ─── Login (OTP step 1) ───────────────────────────────────────────────────────

// @desc    Validate credentials, send login OTP
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: "Please provide email and password." });

  const user = await User.findOne({ email }).select("+password +otp +otpExpires +otpType");

  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ success: false, message: "Invalid email or password." });

  // Generate OTP
  const otp = generateOTP();
  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  user.otpType = "login";
  await user.save({ validateBeforeSave: false });

  try {
    await sendOTPEmail({
      to: user.email,
      name: user.name,
      otp,
      subject: "DocuMind – Login Verification Code",
      purpose: "Login OTP",
    });
    return res.status(200).json({ success: true, requiresOTP: true });
  } catch (err) {
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpType = undefined;
    await user.save({ validateBeforeSave: false });
    console.error("OTP email error:", err);
    return res.status(500).json({ success: false, message: "Could not send OTP email. Try again." });
  }
};

// ─── Login (OTP step 2) ───────────────────────────────────────────────────────

// @desc    Verify login OTP, return JWT
// @route   POST /api/v1/auth/verify-login-otp
// @access  Public
const verifyLoginOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ success: false, message: "Email and OTP are required." });

  const user = await User.findOne({ email }).select("+otp +otpExpires +otpType");

  if (!user || user.otpType !== "login" || !user.otp || !user.otpExpires)
    return res.status(400).json({ success: false, message: "OTP request not found. Please login again." });

  if (user.otpExpires < new Date())
    return res.status(400).json({ success: false, message: "OTP has expired. Please login again." });

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch)
    return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });

  // Clear OTP fields
  user.otp = undefined;
  user.otpExpires = undefined;
  user.otpType = undefined;
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
};

// ─── Forgot Password (OTP step 1) ────────────────────────────────────────────

// @desc    Send forgot-password OTP to email
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ success: false, message: "Please provide an email address." });

  const user = await User.findOne({ email }).select("+otp +otpExpires +otpType");

  // Always return 200 to prevent email enumeration
  if (!user) {
    return res.status(200).json({ success: true, message: "If that email is registered, an OTP has been sent." });
  }

  const otp = generateOTP();
  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  user.otpType = "forgot-password";
  await user.save({ validateBeforeSave: false });

  try {
    await sendOTPEmail({
      to: user.email,
      name: user.name,
      otp,
      subject: "DocuMind – Password Reset OTP",
      purpose: "Password Reset",
    });
    return res.status(200).json({ success: true, message: "If that email is registered, an OTP has been sent." });
  } catch (err) {
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpType = undefined;
    await user.save({ validateBeforeSave: false });
    console.error("OTP email error:", err);
    return res.status(500).json({ success: false, message: "Could not send OTP email. Try again." });
  }
};

// ─── Forgot Password (OTP step 2) ────────────────────────────────────────────

// @desc    Verify forgot-password OTP, return a short-lived reset token
// @route   POST /api/v1/auth/verify-forgot-otp
// @access  Public
const verifyForgotOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ success: false, message: "Email and OTP are required." });

  const user = await User.findOne({ email }).select("+otp +otpExpires +otpType");

  if (!user || user.otpType !== "forgot-password" || !user.otp || !user.otpExpires)
    return res.status(400).json({ success: false, message: "OTP request not found. Please try again." });

  if (user.otpExpires < new Date())
    return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch)
    return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });

  // Clear OTP + generate a password reset token (10 min)
  user.otp = undefined;
  user.otpExpires = undefined;
  user.otpType = undefined;
  const rawToken = user.generatePasswordResetToken(); // sets passwordResetToken + passwordResetExpires
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({ success: true, resetToken: rawToken });
};

// ─── Reset Password ───────────────────────────────────────────────────────────

// @desc    Reset password using the reset token from verifyForgotOtp
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || !validatePassword(password))
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." });

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+password +passwordResetToken +passwordResetExpires");

  if (!user)
    return res.status(400).json({ success: false, message: "Reset token is invalid or has expired." });

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
};

// ─── Resend OTP ───────────────────────────────────────────────────────────────

// @desc    Resend OTP (login or forgot-password)
// @route   POST /api/v1/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
  const { email, type } = req.body; // type: 'login' | 'forgot-password'

  if (!email || !type)
    return res.status(400).json({ success: false, message: "Email and type are required." });

  const user = await User.findOne({ email }).select("+otp +otpExpires +otpType");

  if (!user)
    return res.status(200).json({ success: true, message: "If that email is registered, a new OTP has been sent." });

  const otp = generateOTP();
  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.otpType = type;
  await user.save({ validateBeforeSave: false });

  const isLogin = type === "login";
  try {
    await sendOTPEmail({
      to: user.email,
      name: user.name,
      otp,
      subject: isLogin ? "DocuMind – Login Verification Code" : "DocuMind – Password Reset OTP",
      purpose: isLogin ? "Login OTP" : "Password Reset",
    });
    return res.status(200).json({ success: true, message: "New OTP sent to your email." });
  } catch (err) {
    console.error("OTP email error:", err);
    return res.status(500).json({ success: false, message: "Could not send OTP email. Try again." });
  }
};

// ─── Profile ──────────────────────────────────────────────────────────────────

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// @desc    Update profile
// @route   PUT /api/v1/auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
  const { name, phone, institution, learningGoal, bio } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (institution !== undefined) user.institution = institution;
  if (learningGoal !== undefined) user.learningGoal = learningGoal;
  if (bio !== undefined) user.bio = bio;

  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      institution: user.institution || "",
      learningGoal: user.learningGoal || "",
      bio: user.bio || "",
    },
  });
};

module.exports = {
  signup,
  login,
  verifyLoginOtp,
  forgotPassword,
  verifyForgotOtp,
  resetPassword,
  resendOtp,
  getMe,
  updateProfile,
};

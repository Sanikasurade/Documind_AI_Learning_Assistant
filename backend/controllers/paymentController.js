const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");

// Initialise Razorpay with test credentials from .env
const razorpay = new Razorpay({
  key_id: process.env.TEST_API_KEY,
  key_secret: process.env.TEST_KEY_SECRET,
});

// Plan config — amounts in paise (INR × 100)
const PLANS = {
  monthly: { amount: 19900, duration: 30, label: "Monthly Pro" },
  yearly:  { amount: 149900, duration: 365, label: "Yearly Pro" },
};

// @desc   Create a Razorpay order
// @route  POST /api/v1/payments/create-order
// @access Private
const createOrder = async (req, res) => {
  const { planType } = req.body; // 'monthly' | 'yearly'

  if (!PLANS[planType]) {
    return res.status(400).json({ success: false, message: "Invalid plan type." });
  }

  const plan = PLANS[planType];

  const order = await razorpay.orders.create({
    amount: plan.amount,
    currency: "INR",
    receipt: `rcpt_${req.user._id.toString().slice(-6)}_${Date.now()}`,
    notes: { userId: String(req.user._id), planType },
  });

  // Persist the order id so we can validate it during verification
  await User.findByIdAndUpdate(req.user._id, { razorpayOrderId: order.id });

  res.status(200).json({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.TEST_API_KEY,
    planLabel: plan.label,
  });
};

// @desc   Verify Razorpay payment signature & upgrade user plan
// @route  POST /api/v1/payments/verify
// @access Private
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planType) {
    return res.status(400).json({ success: false, message: "Missing payment details." });
  }

  // Verify HMAC-SHA256 signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.TEST_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Payment verification failed. Invalid signature." });
  }

  const plan = PLANS[planType];
  if (!plan) {
    return res.status(400).json({ success: false, message: "Invalid plan type." });
  }

  // Calculate new expiry date
  const planExpiresAt = new Date();
  planExpiresAt.setDate(planExpiresAt.getDate() + plan.duration);

  // Upgrade the user
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      plan: "pro",
      planExpiresAt,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: `You're now on ${plan.label}! Enjoy unlimited uploads.`,
    user: {
      plan: updatedUser.plan,
      planExpiresAt: updatedUser.planExpiresAt,
    },
  });
};

// @desc   Get current user's plan info
// @route  GET /api/v1/payments/plan
// @access Private
const getPlan = async (req, res) => {
  const user = await User.findById(req.user._id).select("plan planExpiresAt");
  const isProActive =
    user.plan === "pro" &&
    user.planExpiresAt &&
    new Date(user.planExpiresAt) > new Date();

  res.status(200).json({
    success: true,
    plan: isProActive ? "pro" : "free",
    planExpiresAt: user.planExpiresAt,
  });
};

module.exports = { createOrder, verifyPayment, getPlan };

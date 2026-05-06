const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createOrder, verifyPayment, getPlan } = require("../controllers/paymentController");

// All payment routes require authentication
router.use(protect);

router.get("/plan", getPlan);
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

module.exports = router;

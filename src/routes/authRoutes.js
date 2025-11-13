const express = require("express");
const { 
  register, 
  verifyOTP, 
  login,
  logout 
} = require("../controllers/authController");
const auth = require("../middlewares/auth");

const router = express.Router();

// OTP-based authentication
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/logout", auth, logout);

module.exports = router;

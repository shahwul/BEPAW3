const express = require("express");
const passport = require("passport");
const { 
  register, 
  sendOTP, 
  verifyOTP, 
  login,
  refreshToken,
  logout 
} = require("../controllers/authController");
const jwt = require("jsonwebtoken");

const router = express.Router();

// OTP-based authentication
router.post("/register", register);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);

// Token management
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token, role: req.user.role });
  }
);

module.exports = router;

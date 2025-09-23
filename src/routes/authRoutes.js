const express = require("express");
const passport = require("passport");
const { register, login } = require("../controllers/authController");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

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

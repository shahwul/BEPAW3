const otpService = require("../services/otpService");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register dengan OTP
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = otpService.generateOTP();
    const otpExpiry = otpService.generateOTPExpiry();

    // Create user (not verified yet)
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "guest",
      otp,
      otpExpiry,
      isVerified: false
    });

    await user.save();

    // Send OTP email
    const emailResult = await otpService.sendOTPEmail(email, otp, 'verification');
    
    if (!emailResult.success) {
      // Delete user if email failed
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: "Gagal mengirim email OTP" });
    }

    res.status(201).json({
      message: "Registrasi berhasil. Silakan cek email untuk kode OTP",
      email: email,
      needVerification: true
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Send OTP setelah password benar
const sendOTP = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password harus diisi" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    // Verify password terlebih dahulu
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Password salah" });
    }

    // Jika password benar, generate dan kirim OTP
    const otp = otpService.generateOTP();
    const otpExpiry = otpService.generateOTPExpiry();

    // Update user dengan OTP baru
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const emailResult = await otpService.sendOTPEmail(email, otp, 'login');
    
    if (!emailResult.success) {
      return res.status(500).json({ message: "Gagal mengirim email OTP" });
    }

    res.json({
      message: "Password benar. Kode OTP telah dikirim ke email Anda",
      email: email,
      needOTP: true
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Verify OTP
    const otpVerification = otpService.verifyOTP(otp, user.otp, user.otpExpiry);
    
    if (!otpVerification.valid) {
      return res.status(400).json({ message: otpVerification.message });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "OTP berhasil diverifikasi",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Login dengan OTP
const login = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    // Verify OTP
    const otpVerification = otpService.verifyOTP(otp, user.otp, user.otpExpiry);
    
    if (!otpVerification.valid) {
      return res.status(400).json({ message: otpVerification.message });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { 
  register, 
  sendOTP, 
  verifyOTP, 
  login 
};
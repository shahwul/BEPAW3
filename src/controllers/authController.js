const otpService = require("../services/otpService");
const refreshTokenService = require("../services/refreshTokenService");
const { setAuthCookies, clearAuthCookies } = require("../utils/cookieUtils");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Register dengan OTP
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body; // Hilangkan role dari request body

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

    // Tentukan role berdasarkan domain email (konsisten dengan Google OAuth)
    let role = "guest";
    if (email.endsWith("@mail.ugm.ac.id")) {
      role = "mahasiswa";
    }

    // Create user (not verified yet)
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role, // Role berdasarkan domain email
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

    // Generate token pair (access + refresh)
    const tokens = refreshTokenService.generateTokenPair(user);
    
    // Save refresh token to user
    user.refreshToken = tokens.refreshToken;
    user.refreshTokenExpiry = tokens.refreshTokenExpiry;
    await user.save();

    // Set authentication cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    // Create response (without tokens for security)
    const response = {
      message: "OTP berhasil diverifikasi dan login otomatis",
      tokenType: 'Bearer',
      expiresIn: tokens.expiresIn,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    };
    
    res.json(response);

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

    // Generate token pair (access + refresh)
    const tokens = refreshTokenService.generateTokenPair(user);
    
    // Save refresh token to user
    user.refreshToken = tokens.refreshToken;
    user.refreshTokenExpiry = tokens.refreshTokenExpiry;
    await user.save();

    // Set authentication cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    // Create response (without tokens for security)
    const response = {
      message: "Login berhasil",
      tokenType: 'Bearer',
      expiresIn: tokens.expiresIn,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    };

    res.json(response);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    // Try to get refresh token from cookie first, then from body
    const refreshTokenValue = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshTokenValue) {
      return res.status(400).json({ message: "Refresh token diperlukan" });
    }

    // Verify refresh token
    const decoded = refreshTokenService.verifyRefreshToken(refreshTokenValue);

    // Find user with this refresh token
    const user = await User.findOne({ 
      _id: decoded.id,
      refreshToken: refreshTokenValue
    });

    if (!user) {
      return res.status(401).json({ message: "Refresh token tidak valid" });
    }

    // Check if refresh token expired
    if (refreshTokenService.isRefreshTokenExpired(user.refreshTokenExpiry)) {
      // Clear expired refresh token
      user.refreshToken = undefined;
      user.refreshTokenExpiry = undefined;
      await user.save();
      
      return res.status(401).json({ 
        message: "Refresh token sudah expired. Silakan login ulang." 
      });
    }

    // Generate new token pair
    const tokens = refreshTokenService.generateTokenPair(user);
    
    // Update refresh token in database
    user.refreshToken = tokens.refreshToken;
    user.refreshTokenExpiry = tokens.refreshTokenExpiry;
    await user.save();

    // Set new authentication cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    // Create response (without tokens for security)
    const response = {
      message: "Token berhasil di-refresh",
      tokenType: 'Bearer',
      expiresIn: tokens.expiresIn,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    };

    res.json(response);

  } catch (err) {
    res.status(401).json({ message: "Refresh token tidak valid" });
  }
};

// Logout - invalidate refresh token
const logout = async (req, res) => {
  try {
    // Get refresh token from cookie or body
    const refreshTokenValue = req.cookies.refreshToken || req.body.refreshToken;
    
    if (refreshTokenValue) {
      // Find and clear refresh token
      await User.findOneAndUpdate(
        { refreshToken: refreshTokenValue },
        { 
          $unset: { 
            refreshToken: 1, 
            refreshTokenExpiry: 1 
          } 
        }
      );
    }

    // Clear authentication cookies
    clearAuthCookies(res);

    res.json({ message: "Logout berhasil" });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { 
  register, 
  sendOTP, 
  verifyOTP, 
  login,
  refreshToken,
  logout 
};
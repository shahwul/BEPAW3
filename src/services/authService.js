const bcrypt = require("bcryptjs");
const User = require("../models/user");
const otpService = require("./otpService");
const refreshTokenService = require("./refreshTokenService");

exports.register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email sudah terdaftar");

  const hashed = await bcrypt.hash(password, 10);

  // tentukan role
  let role = "guest";
  if (email.endsWith("@mail.ugm.ac.id")) role = "mahasiswa";

  const otp = otpService.generateOTP();
  const otpExpiry = otpService.generateOTPExpiry();

  const user = new User({
    name,
    email,
    password: hashed,
    role,
    otp,
    otpExpiry,
    isVerified: false
  });
  await user.save();

  // kirim email OTP
  const emailResult = await otpService.sendOTPEmail(email, otp, "verification");
  if (!emailResult.success) {
    await User.findByIdAndDelete(user._id);
    throw new Error("Gagal mengirim email OTP");
  }

  return { email, needVerification: true };
};

exports.sendOTP = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email tidak ditemukan");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Password salah");

  const otp = otpService.generateOTP();
  const otpExpiry = otpService.generateOTPExpiry();

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  const emailResult = await otpService.sendOTPEmail(email, otp, "login");
  if (!emailResult.success) throw new Error("Gagal mengirim email OTP");

  return { email, needOTP: true };
};

exports.verifyOTP = async ({ email, otp }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User tidak ditemukan");

  const check = otpService.verifyOTP(otp, user.otp, user.otpExpiry);
  if (!check.valid) throw new Error(check.message);

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;

  const tokens = refreshTokenService.generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  user.refreshTokenExpiry = tokens.refreshTokenExpiry;
  await user.save();

  return { user, tokens };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email tidak ditemukan");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Password salah");

  const tokens = refreshTokenService.generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  user.refreshTokenExpiry = tokens.refreshTokenExpiry;
  await user.save();

  return { user, tokens };
};

exports.refreshToken = async (refreshTokenValue) => {
  const decoded = refreshTokenService.verifyRefreshToken(refreshTokenValue);

  const user = await User.findOne({
    _id: decoded.id,
    refreshToken: refreshTokenValue
  });
  if (!user) throw new Error("Refresh token tidak valid");

  if (refreshTokenService.isRefreshTokenExpired(user.refreshTokenExpiry)) {
    user.refreshToken = undefined;
    user.refreshTokenExpiry = undefined;
    await user.save();
    throw new Error("Refresh token expired");
  }

  const tokens = refreshTokenService.generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  user.refreshTokenExpiry = tokens.refreshTokenExpiry;
  await user.save();

  return { user, tokens };
};

exports.logout = async (refreshTokenValue) => {
  if (refreshTokenValue) {
    await User.findOneAndUpdate(
      { refreshToken: refreshTokenValue },
      { $unset: { refreshToken: 1, refreshTokenExpiry: 1 } }
    );
  }
};

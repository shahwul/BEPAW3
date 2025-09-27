const authService = require("../services/authService");
const { setAuthCookies, clearAuthCookies } = require("../utils/cookieUtils");

exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      message: "Registrasi berhasil. Cek email untuk kode OTP",
      ...result
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const result = await authService.sendOTP(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { user, tokens } = await authService.verifyOTP(req.body);

    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      message: "OTP berhasil diverifikasi",
      user,
      tokenType: "Bearer",
      expiresIn: tokens.expiresIn
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { user, tokens } = await authService.login(req.body);

    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      message: "Login berhasil",
      user,
      tokenType: "Bearer",
      expiresIn: tokens.expiresIn
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshTokenValue = req.cookies.refreshToken || req.body.refreshToken;
    const { user, tokens } = await authService.refreshToken(refreshTokenValue);

    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      message: "Token refreshed",
      user,
      tokenType: "Bearer",
      expiresIn: tokens.expiresIn
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshTokenValue = req.cookies.refreshToken || req.body.refreshToken;
    await authService.logout(refreshTokenValue);
    clearAuthCookies(res);
    res.json({ message: "Logout berhasil" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

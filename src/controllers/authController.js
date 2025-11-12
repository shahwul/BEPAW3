const authService = require("../services/authService");
const { setAuthCookie, clearAuthCookie } = require("../utils/cookieUtils");

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

exports.verifyOTP = async (req, res) => {
  try {
    const result = await authService.verifyOTP(req.body);

    setAuthCookie(res, result.token);

    res.json({
      message: "OTP berhasil diverifikasi",
      user: result.user,
      tokenType: "Bearer",
      expiresIn: result.expiresIn
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    setAuthCookie(res, result.token);

    res.json({
      message: "Login berhasil",
      user: result.user,
      tokenType: "Bearer",
      expiresIn: result.expiresIn
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    await authService.logout();
    clearAuthCookie(res);
    res.json({ message: "Logout berhasil" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

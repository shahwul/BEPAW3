// Middleware untuk validasi API Key (untuk cron job dan external services)
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ message: "API Key required" });
  }
  
  // Validasi API Key dari environment variable
  if (apiKey !== process.env.CRON_API_KEY) {
    return res.status(403).json({ message: "Invalid API Key" });
  }
  
  // API Key valid, lanjutkan
  next();
};

module.exports = apiKeyAuth;

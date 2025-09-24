const refreshTokenService = require("../services/refreshTokenService");

const verifyToken = (req, res, next) => {
  // Try to get token from Authorization header first, then from cookie
  const authHeader = req.header("Authorization");
  const headerToken = authHeader && authHeader.split(" ")[1];
  const cookieToken = req.cookies && req.cookies.accessToken;
  
  const token = headerToken || cookieToken;
  
  if (!token) {
    return res.status(401).json({ 
      message: "Access token diperlukan",
      code: "NO_TOKEN",
      hint: "Sertakan token di Authorization header atau login untuk set cookie"
    });
  }

  try {
    // Verify access token
    const decoded = refreshTokenService.verifyAccessToken(token);
    req.user = decoded;

    // Check if token expires soon (within 5 minutes)
    if (refreshTokenService.isTokenExpiringSoon(token)) {
      // Set header to inform client that token is expiring soon
      res.setHeader('X-Token-Expires-Soon', 'true');
    }

    next();
  } catch (err) {
    // Check if token is expired or invalid
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Access token sudah expired",
        code: "TOKEN_EXPIRED",
        hint: "Gunakan refresh token untuk mendapatkan access token baru"
      });
    }
    
    return res.status(401).json({ 
      message: "Access token tidak valid",
      code: "INVALID_TOKEN" 
    });
  }
};

// Optional middleware for auto-refresh (can be used selectively)
const verifyTokenWithAutoRefresh = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ 
      message: "Access token diperlukan",
      code: "NO_TOKEN"
    });
  }

  try {
    // Try to verify token first
    const decoded = refreshTokenService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Access token sudah expired",
        code: "TOKEN_EXPIRED",
        hint: "Silakan refresh token atau login ulang"
      });
    }
    
    return res.status(401).json({ 
      message: "Access token tidak valid",
      code: "INVALID_TOKEN" 
    });
  }
};

module.exports = verifyToken;
module.exports.verifyTokenWithAutoRefresh = verifyTokenWithAutoRefresh;
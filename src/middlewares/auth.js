const tokenService = require("../services/tokenService");

const verifyToken = (req, res, next) => {
  // Try to get token from Authorization header first, then from cookie
  const authHeader = req.header("Authorization");
  const headerToken = authHeader && authHeader.split(" ")[1];
  const cookieToken = req.cookies && req.cookies.token;
  
  const token = headerToken || cookieToken;
  
  if (!token) {
    return res.status(401).json({ 
      message: "Token diperlukan",
      code: "NO_TOKEN",
      hint: "Sertakan token di Authorization header atau login untuk set cookie"
    });
  }

  try {
    // Verify token
    const decoded = tokenService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    // Check if token is expired or invalid
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token sudah expired, silakan login ulang",
        code: "TOKEN_EXPIRED"
      });
    }
    
    return res.status(401).json({ 
      message: "Token tidak valid",
      code: "INVALID_TOKEN" 
    });
  }
};

module.exports = verifyToken;

const tokenService = require("../services/tokenService");

/**
 * Optional authentication middleware
 * If token exists and valid, attach user to req.user
 * If no token or invalid, continue without user (public access)
 */
const optionalAuth = (req, res, next) => {
  // Try to get token from Authorization header first, then from cookie
  const authHeader = req.header("Authorization");
  const headerToken = authHeader && authHeader.split(" ")[1];
  const cookieToken = req.cookies && req.cookies.token;
  
  const token = headerToken || cookieToken;
  
  // If no token, continue as public user
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // Verify token if provided
    const decoded = tokenService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    // If token invalid, continue as public user (no error thrown)
    req.user = null;
    next();
  }
};

module.exports = optionalAuth;

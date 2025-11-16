const cookieOptions = {
  // Cookie configuration for single token (1 day)
  getTokenCookieOptions: () => ({
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'none', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    path: '/'
  }),

  // Clear cookie options
  getClearCookieOptions: () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    path: '/'
  })
};

// Cookie name constant
const COOKIE_NAME = 'token';

// Set authentication cookie
const setAuthCookie = (res, token) => {
  res.cookie(
    COOKIE_NAME, 
    token, 
    cookieOptions.getTokenCookieOptions()
  );
};

// Clear authentication cookie
const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions.getClearCookieOptions());
};

// Get token from cookie
const getTokenFromCookie = (req) => {
  return req.cookies[COOKIE_NAME];
};

module.exports = {
  cookieOptions,
  COOKIE_NAME,
  setAuthCookie,
  clearAuthCookie,
  getTokenFromCookie
};
const cookieOptions = {
  // Cookie configuration
  getAccessTokenCookieOptions: () => ({
    httpOnly: false, // Allow JavaScript access for API calls
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // CSRF protection
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/'
  }),

  getRefreshTokenCookieOptions: () => ({
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth' // Only send to auth endpoints
  }),

  // Clear cookie options
  getClearCookieOptions: () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })
};

// Cookie names constants
const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken'
};

// Set authentication cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
  // Set access token cookie (accessible by JavaScript)
  res.cookie(
    COOKIE_NAMES.ACCESS_TOKEN, 
    accessToken, 
    cookieOptions.getAccessTokenCookieOptions()
  );

  // Set refresh token cookie (httpOnly - secure)
  res.cookie(
    COOKIE_NAMES.REFRESH_TOKEN, 
    refreshToken, 
    cookieOptions.getRefreshTokenCookieOptions()
  );
};

// Clear authentication cookies
const clearAuthCookies = (res) => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, cookieOptions.getClearCookieOptions());
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, cookieOptions.getClearCookieOptions());
};

// Get tokens from cookies
const getTokensFromCookies = (req) => {
  return {
    accessToken: req.cookies[COOKIE_NAMES.ACCESS_TOKEN],
    refreshToken: req.cookies[COOKIE_NAMES.REFRESH_TOKEN]
  };
};

// Check if cookies are available
const hasCookieSupport = (req) => {
  return req.cookies !== undefined;
};

module.exports = {
  cookieOptions,
  COOKIE_NAMES,
  setAuthCookies,
  clearAuthCookies,
  getTokensFromCookies,
  hasCookieSupport
};
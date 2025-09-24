const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class RefreshTokenService {
  
  // Generate access token (short-lived)
  generateAccessToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // 15 minutes
    );
  }

  // Generate refresh token (long-lived)
  generateRefreshToken(payload) {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET + '_refresh',
      { expiresIn: "7d" } // 7 days
    );
  }

  // Generate refresh token expiry (7 days from now)
  generateRefreshTokenExpiry() {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(
        token, 
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET + '_refresh'
      );
      
      if (decoded.type !== 'refresh') {
        throw new Error('Not a refresh token');
      }
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Check if token expires soon (within 5 minutes)
  isTokenExpiringSoon(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
      const timeLeft = decoded.exp - (Date.now() / 1000);
      return timeLeft < 300; // 5 minutes
    } catch (error) {
      return true; // If we can't decode, consider it expiring
    }
  }

  // Check if refresh token is expired
  isRefreshTokenExpired(refreshTokenExpiry) {
    return new Date() > refreshTokenExpiry;
  }

  // Generate token pair (access + refresh)
  generateTokenPair(user) {
    const payload = {
      id: user._id,
      role: user.role,
      email: user.email
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    const refreshTokenExpiry = this.generateRefreshTokenExpiry();

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiry,
      expiresIn: 900 // 15 minutes in seconds
    };
  }

  // Create secure token response
  createTokenResponse(user, tokens) {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: 'Bearer',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    };
  }
}

module.exports = new RefreshTokenService();
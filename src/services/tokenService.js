const jwt = require('jsonwebtoken');

class TokenService {
  
  // Generate single token (1 day expiry - balance between security & UX)
  generateToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // 1 day
    );
  }

  // Verify token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw error;
      }
      throw new Error('Invalid token');
    }
  }

  // Generate token for user
  generateUserToken(user) {
    const payload = {
      id: user._id,
      role: user.role,
      email: user.email
    };

    const token = this.generateToken(payload);

    return {
      token,
      expiresIn: 86400 // 1 day in seconds
    };
  }

  // Create token response
  createTokenResponse(user, tokenData) {
    return {
      token: tokenData.token,
      expiresIn: tokenData.expiresIn,
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

module.exports = new TokenService();
// JWT generate + build response - Placeholder
const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a user
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Build auth response object (token + user)
 */
const buildAuthResponse = (user, token) => ({
  token,
  user: {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    preferences: user.preferences,
    role: user.role,
    createdAt: user.createdAt,
  },
});

module.exports = { generateToken, buildAuthResponse };

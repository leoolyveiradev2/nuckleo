// JWT protect/optionalAuth - Placeholder
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createError } = require('../utils/errorUtils');

/**
 * Protect routes — verifies JWT and attaches req.user
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(createError('Not authenticated. Please log in.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return next(createError('User not found or account disabled.', 401));
    }

    // Update last seen (non-blocking)
    User.findByIdAndUpdate(user._id, { lastSeen: Date.now() }).exec();

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(createError('Invalid token.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(createError('Token expired. Please log in again.', 401));
    }
    next(error);
  }
};

/**
 * Optionally authenticate — does not block if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch {
    // Silently ignore
  }
  next();
};

/**
 * Role-based access
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(createError('Insufficient permissions.', 403));
  }
  next();
};

module.exports = { protect, optionalAuth, requireRole };

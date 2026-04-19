// Lógica de autenticação - Placeholder
const User = require('../models/User');
const { generateToken, buildAuthResponse } = require('../utils/tokenUtils');
const { createError } = require('../utils/errorUtils');

/**
 * AuthService — abstraction layer between routes and data store.
 * Swap the DB layer here without touching controllers.
 */
class AuthService {
  /**
   * Find or create a user from an OAuth provider.
   */
  async findOrCreateOAuthUser({ provider, providerId, email, name, avatar }) {
    const providerField = `${provider}Id`; // 'googleId' | 'appleId'

    // Try to find by provider ID first (most reliable)
    let user = await User.findOne({ [providerField]: providerId });

    if (!user) {
      // Try to find by email (account linking)
      user = await User.findOne({ email });

      if (user) {
        // Link provider to existing account
        user[providerField] = providerId;
        if (!user.avatar && avatar) user.avatar = avatar;
        await user.save();
      } else {
        // Create fresh account
        user = await User.create({
          [providerField]: providerId,
          email,
          name,
          avatar,
          isVerified: true, // OAuth emails are pre-verified
        });
      }
    }

    const token = generateToken(user._id);
    return buildAuthResponse(user, token);
  }

  /**
   * Register with email + password.
   */
  async register({ name, email, password }) {
    const existing = await User.findOne({ email });
    if (existing) throw createError('Email already registered', 409);

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    return buildAuthResponse(user, token);
  }

  /**
   * Login with email + password.
   */
  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw createError('Invalid email or password', 401);
    }
    const token = generateToken(user._id);
    return buildAuthResponse(user, token);
  }

  /**
   * Return current authenticated user's data.
   */
  async getMe(userId) {
    const user = await User.findById(userId).populate('friends', 'name username avatar');
    if (!user) throw createError('User not found', 404);
    return user;
  }
}

module.exports = new AuthService();

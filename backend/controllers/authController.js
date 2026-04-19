// Auth controller - Placeholder
const authService = require('../services/authService');
const { createError } = require('../utils/errorUtils');

/**
 * Auth Controller — thin layer, delegates all logic to AuthService.
 */

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/google
 * Receives { credential } — the Google ID token from frontend Google Sign-In SDK.
 * Verifies it via Google's tokeninfo endpoint and upserts the user.
 */
const googleOAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) return next(createError('Google credential required', 400));

    // Verify token with Google
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );
    if (!googleRes.ok) return next(createError('Invalid Google token', 401));

    const profile = await googleRes.json();
    if (profile.aud !== process.env.GOOGLE_CLIENT_ID) {
      return next(createError('Token audience mismatch', 401));
    }

    const result = await authService.findOrCreateOAuthUser({
      provider: 'google',
      providerId: profile.sub,
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, googleOAuth, getMe };

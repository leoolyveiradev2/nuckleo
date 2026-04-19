// Auth routes - Placeholder
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validateMiddleware');

// ── Email/Password ─────────────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    validate,
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate,
  ],
  authController.login
);

// ── Google OAuth ───────────────────────────────────────────────────────────
router.post('/google', authController.googleOAuth);

// ── Me ────────────────────────────────────────────────────────────────────
router.get('/me', protect, authController.getMe);

module.exports = router;

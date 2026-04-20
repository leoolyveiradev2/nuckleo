const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Designed with flat structure (no deep nesting) for easy migration to SQL.
 * Friends list uses ObjectId refs instead of embedding.
 */
const userSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name must be under 80 characters'],
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9_]{3,30}$/, 'Username must be 3-30 chars (letters, numbers, _)'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    password: {
      type: String,
      select: false, // never returned in queries by default
      minlength: 8,
    },

    // ── Profile ───────────────────────────────────────────────────────
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio must be under 300 characters'],
      default: '',
    },
    website: {
      type: String,
      default: null,
    },

    // ── OAuth ─────────────────────────────────────────────────────────
    googleId: { type: String, sparse: true },
    appleId: { type: String, sparse: true },

    // ── Preferences ───────────────────────────────────────────────────
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      accentColor: { type: String, default: '#81BFB7' }, // Wintergreen
      language: { type: String, default: 'en' },
      emailNotifications: { type: Boolean, default: true },
    },

    // ── Social ────────────────────────────────────────────────────────
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── Meta ──────────────────────────────────────────────────────────
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ name: 'text', username: 'text', bio: 'text' });

// ── Virtuals ────────────────────────────────────────────────────────────────
userSchema.virtual('friendCount').get(function () {
  return this.friends?.length ?? 0;
});

// ── Hooks ───────────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Methods ─────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    avatar: this.avatar,
    bio: this.bio,
    website: this.website,
    friendCount: this.friendCount,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);
module.exports = User;// Modelo de usuário - Placeholder

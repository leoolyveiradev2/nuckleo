const mongoose = require('mongoose');

/**
 * Space Model
 * A "Space" is the top-level container — equivalent to a folder/workspace.
 * Items are stored separately and reference their Space via spaceId.
 */
const spaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Space name is required'],
      trim: true,
      maxlength: [100, 'Name must be under 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description must be under 500 characters'],
      default: '',
    },
    icon: {
      type: String,
      default: '📁', // emoji or icon identifier
    },
    coverColor: {
      type: String,
      default: '#C6E6E3', // Mint
      match: [/^#[0-9A-Fa-f]{6}$/, 'Cover color must be a valid HEX'],
    },

    // ── Ownership ─────────────────────────────────────────────────────
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Privacy ───────────────────────────────────────────────────────
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },

    // ── Organization ──────────────────────────────────────────────────
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'Maximum 20 tags per space',
      },
    },
    isPinned: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },

    // ── Stats (denormalized for performance) ──────────────────────────
    itemCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
spaceSchema.index({ owner: 1, createdAt: -1 });
spaceSchema.index({ visibility: 1 });
spaceSchema.index({ tags: 1 });
spaceSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Space = mongoose.model('Space', spaceSchema);
module.exports = Space;// Modelo de espaço - Placeholder

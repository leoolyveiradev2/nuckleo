// Modeloconst mongoose = require('mongoose');

/**
 * Item Model
 * An Item belongs to a Space and can be:
 *   - note      → rich text content
 *   - link      → external URL with preview metadata
 *   - file      → uploaded file (PDF, image, code)
 *   - code      → code snippet with language
 *
 * Type-specific data is stored in a `meta` sub-document (avoid deep nesting).
 */
const itemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Item title is required'],
            trim: true,
            maxlength: [200, 'Title must be under 200 characters'],
        },

        type: {
            type: String,
            enum: ['note', 'link', 'file', 'code'],
            required: true,
        },

        // ── Ownership & Location ──────────────────────────────────────────
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        spaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Space',
            required: true,
            index: true,
        },

        // ── Content ───────────────────────────────────────────────────────
        // For type=note: rich text (HTML or markdown)
        content: {
            type: String,
            default: '',
        },

        // ── Type-specific metadata ─────────────────────────────────────────
        meta: {
            // link fields
            url: String,
            previewTitle: String,
            previewDescription: String,
            previewImage: String,
            previewFavicon: String,

            // file fields
            fileName: String,
            fileSize: Number,
            mimeType: String,
            filePath: String,
            fileUrl: String,

            // code fields
            language: String,
            code: String,
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
                validator: (arr) => arr.length <= 15,
                message: 'Maximum 15 tags per item',
            },
        },
        isPinned: { type: Boolean, default: false },
        isFavorite: { type: Boolean, default: false },

        // ── Stats ─────────────────────────────────────────────────────────
        viewCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Indexes ────────────────────────────────────────────────────────────────
itemSchema.index({ 
    spaceId: 1,
    createdAt: -1 
});

itemSchema.index({
    owner: 1,
    type: 1
});

itemSchema.index({
    tags: 1
});

itemSchema.index({
    visibility: 1
});

itemSchema.index({ 
    title: 'text', 
    content: 'text', 
    tags: 'text' 
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item; de item(note / link / file / code) - Placeholder

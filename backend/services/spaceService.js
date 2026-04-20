// CRUD de espaços - Placeholder
const Space = require('../models/Space');
const Item = require('../models/Item');
const { createError } = require('../utils/errorUtils');
const { v4: uuidv4 } = require('uuid');

class SpaceService {
  async getUserSpaces(userId, { page = 1, limit = 20, sort = '-createdAt', tag } = {}) {
    const query = { owner: userId };
    if (tag) query.tags = tag;

    const skip = (page - 1) * limit;
    const [spaces, total] = await Promise.all([
      Space.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Space.countDocuments(query),
    ]);

    return { spaces, total, page, pages: Math.ceil(total / limit) };
  }

  async createSpace(userId, data) {
    const space = await Space.create({ ...data, owner: userId });
    return space;
  }

  async getSpace(spaceId, userId) {
    const space = await Space.findById(spaceId).populate('owner', 'name username avatar');
    if (!space) throw createError('Space not found', 404);

    // Access control
    if (space.visibility === 'private' && space.owner._id.toString() !== userId?.toString()) {
      throw createError('Access denied', 403);
    }

    return space;
  }

  async getSpaceByToken(shareToken) {
    const space = await Space.findOne({ shareToken, visibility: 'public' })
      .populate('owner', 'name username avatar');
    if (!space) throw createError('Space not found', 404);
    return space;
  }

  async updateSpace(spaceId, userId, data) {
    const space = await Space.findOne({ _id: spaceId, owner: userId });
    if (!space) throw createError('Space not found or not authorized', 404);

    const allowed = ['name', 'description', 'icon', 'coverColor', 'visibility', 'tags', 'isPinned', 'isFavorite', 'sortOrder'];
    allowed.forEach((key) => { if (data[key] !== undefined) space[key] = data[key]; });

    // Generate share token when making public
    if (data.visibility === 'public' && !space.shareToken) {
      space.shareToken = uuidv4();
    }

    await space.save();
    return space;
  }

  async deleteSpace(spaceId, userId) {
    const space = await Space.findOneAndDelete({ _id: spaceId, owner: userId });
    if (!space) throw createError('Space not found or not authorized', 404);

    // Cascade delete items
    await Item.deleteMany({ spaceId });
    return { deleted: true };
  }
}

module.exports = new SpaceService();

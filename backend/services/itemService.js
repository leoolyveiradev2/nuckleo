// CRUD de itens - Placeholder
const Item = require('../models/Item');
const Space = require('../models/Space');
const { createError } = require('../utils/errorUtils');
const { v4: uuidv4 } = require('uuid');

class ItemService {
  async getSpaceItems(spaceId, userId, { page = 1, limit = 30, type, tag, sort = '-createdAt' } = {}) {
    const space = await Space.findById(spaceId);
    if (!space) throw createError('Space not found', 404);

    const isOwner = space.owner.toString() === userId?.toString();
    if (!isOwner && space.visibility === 'private') throw createError('Access denied', 403);

    const query = { spaceId };
    if (!isOwner) query.visibility = 'public';
    if (type) query.type = type;
    if (tag) query.tags = tag;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Item.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Item.countDocuments(query),
    ]);

    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async createItem(spaceId, userId, data) {
    const space = await Space.findOne({ _id: spaceId, owner: userId });
    if (!space) throw createError('Space not found or not authorized', 404);

    const item = await Item.create({ ...data, spaceId, owner: userId });

    // Update space item count
    await Space.findByIdAndUpdate(spaceId, { $inc: { itemCount: 1 } });

    return item;
  }

  async getItem(itemId, userId) {
    const item = await Item.findById(itemId).populate('owner', 'name username avatar');
    if (!item) throw createError('Item not found', 404);

    const isOwner = item.owner._id.toString() === userId?.toString();
    if (!isOwner && item.visibility === 'private') throw createError('Access denied', 403);

    // Increment view count (non-blocking)
    if (!isOwner) Item.findByIdAndUpdate(itemId, { $inc: { viewCount: 1 } }).exec();

    return item;
  }

  async getItemByToken(shareToken) {
    const item = await Item.findOne({ shareToken, visibility: 'public' })
      .populate('owner', 'name username avatar');
    if (!item) throw createError('Item not found', 404);
    Item.findByIdAndUpdate(item._id, { $inc: { viewCount: 1 } }).exec();
    return item;
  }

  async updateItem(itemId, userId, data) {
    const item = await Item.findOne({ _id: itemId, owner: userId });
    if (!item) throw createError('Item not found or not authorized', 404);

    const allowed = ['title', 'content', 'meta', 'visibility', 'tags', 'isPinned', 'isFavorite'];
    allowed.forEach((key) => { if (data[key] !== undefined) item[key] = data[key]; });

    if (data.visibility === 'public' && !item.shareToken) {
      item.shareToken = uuidv4();
    }

    await item.save();
    return item;
  }

  async deleteItem(itemId, userId) {
    const item = await Item.findOneAndDelete({ _id: itemId, owner: userId });
    if (!item) throw createError('Item not found or not authorized', 404);

    await Space.findByIdAndUpdate(item.spaceId, { $inc: { itemCount: -1 } });
    return { deleted: true };
  }

  async getUserFavorites(userId, { page = 1, limit = 30 } = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Item.find({ owner: userId, isFavorite: true }).sort('-updatedAt').skip(skip).limit(limit).lean(),
      Item.countDocuments({ owner: userId, isFavorite: true }),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }
}

module.exports = new ItemService();

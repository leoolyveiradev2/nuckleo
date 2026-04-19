// Item controller - Placeholder
const itemService = require('../services/itemService');

const getSpaceItems = async (req, res, next) => {
  try {
    const { page, limit, type, tag, sort } = req.query;
    const result = await itemService.getSpaceItems(req.params.spaceId, req.user?._id, { page, limit, type, tag, sort });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const createItem = async (req, res, next) => {
  try {
    const item = await itemService.createItem(req.params.spaceId, req.user._id, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

const getItem = async (req, res, next) => {
  try {
    const item = await itemService.getItem(req.params.id, req.user?._id);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

const getItemByToken = async (req, res, next) => {
  try {
    const item = await itemService.getItemByToken(req.params.token);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await itemService.updateItem(req.params.id, req.user._id, req.body);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

const deleteItem = async (req, res, next) => {
  try {
    const result = await itemService.deleteItem(req.params.id, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getFavorites = async (req, res, next) => {
  try {
    const result = await itemService.getUserFavorites(req.user._id, req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = { getSpaceItems, createItem, getItem, getItemByToken, updateItem, deleteItem, getFavorites };

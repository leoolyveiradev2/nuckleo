// Space controller - Placeholder
const spaceService = require('../services/spaceService');

const getMySpaces = async (req, res, next) => {
  try {
    const { page, limit, sort, tag } = req.query;
    const result = await spaceService.getUserSpaces(req.user._id, { page, limit, sort, tag });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const createSpace = async (req, res, next) => {
  try {
    const space = await spaceService.createSpace(req.user._id, req.body);
    res.status(201).json({ success: true, data: space });
  } catch (err) { next(err); }
};

const getSpace = async (req, res, next) => {
  try {
    const space = await spaceService.getSpace(req.params.id, req.user?._id);
    res.json({ success: true, data: space });
  } catch (err) { next(err); }
};

const getSpaceByToken = async (req, res, next) => {
  try {
    const space = await spaceService.getSpaceByToken(req.params.token);
    res.json({ success: true, data: space });
  } catch (err) { next(err); }
};

const updateSpace = async (req, res, next) => {
  try {
    const space = await spaceService.updateSpace(req.params.id, req.user._id, req.body);
    res.json({ success: true, data: space });
  } catch (err) { next(err); }
};

const deleteSpace = async (req, res, next) => {
  try {
    const result = await spaceService.deleteSpace(req.params.id, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = { getMySpaces, createSpace, getSpace, getSpaceByToken, updateSpace, deleteSpace };

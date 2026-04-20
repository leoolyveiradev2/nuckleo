// User controller - Placeholder
const userService = require('../services/userService');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getPublicProfile(req.params.username);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user._id, req.body);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

const updatePreferences = async (req, res, next) => {
  try {
    const user = await userService.updatePreferences(req.user._id, req.body);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

const sendFriendRequest = async (req, res, next) => {
  try {
    const result = await userService.sendFriendRequest(req.user._id, req.params.userId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const acceptFriendRequest = async (req, res, next) => {
  try {
    const result = await userService.acceptFriendRequest(req.user._id, req.params.userId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const removeFriend = async (req, res, next) => {
  try {
    const result = await userService.removeFriend(req.user._id, req.params.userId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getFriends = async (req, res, next) => {
  try {
    const result = await userService.getFriends(req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const searchUsers = async (req, res, next) => {
  try {
    const result = await userService.searchUsers(req.query.q, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, updatePreferences, sendFriendRequest, acceptFriendRequest, removeFriend, getFriends, searchUsers };

// User routes - Placeholder
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/search', protect, userController.searchUsers);
router.get('/friends', protect, userController.getFriends);
router.get('/:username', userController.getProfile);
router.put('/me/profile', protect, userController.updateProfile);
router.put('/me/preferences', protect, userController.updatePreferences);
router.post('/:userId/friend-request', protect, userController.sendFriendRequest);
router.post('/:userId/accept-friend', protect, userController.acceptFriendRequest);
router.delete('/:userId/friend', protect, userController.removeFriend);

module.exports = router;

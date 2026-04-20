// Notification routes - Placeholder
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const Notification = require('../models/Notification');

router.get('/', protect, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name username avatar')
      .sort('-createdAt')
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (err) { next(err); }
});

router.put('/read-all', protect, async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (err) { next(err); }
});

router.put('/:id/read', protect, async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;

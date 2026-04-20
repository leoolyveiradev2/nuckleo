// Search routes - Placeholder
// routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const Space = require('../models/Space');
const Item = require('../models/Item');

router.get('/', protect, async (req, res, next) => {
  try {
    const { q, type } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, data: { users: [], spaces: [], items: [] } });

    const textQuery = { $text: { $search: q } };
    const userId = req.user._id;

    const [users, spaces, items] = await Promise.all([
      type && type !== 'users' ? [] : User.find({ ...textQuery, _id: { $ne: userId }, isActive: true })
        .select('name username avatar bio').limit(10).lean(),
      type && type !== 'spaces' ? [] : Space.find({ ...textQuery, $or: [{ owner: userId }, { visibility: 'public' }] })
        .select('name description icon coverColor tags owner').limit(10).lean(),
      type && type !== 'items' ? [] : Item.find({
        ...textQuery,
        $or: [{ owner: userId }, { visibility: 'public' }],
      }).select('title type tags spaceId createdAt').limit(15).lean(),
    ]);

    res.json({ success: true, data: { users, spaces, items } });
  } catch (err) { next(err); }
});

module.exports = router;

// Item routes - Placeholder
// routes/itemRoutes.js
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');

router.get('/shared/:token', itemController.getItemByToken);
router.get('/favorites', protect, itemController.getFavorites);
router.get('/:id', optionalAuth, itemController.getItem);
router.put('/:id', protect, itemController.updateItem);
router.delete('/:id', protect, itemController.deleteItem);

module.exports = router;

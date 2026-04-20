// Space routes - Placeholder
const express = require('express');
const router = express.Router();
const spaceController = require('../controllers/spaceController');
const itemController = require('../controllers/itemController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validateMiddleware');

// Public share link
router.get('/shared/:token', spaceController.getSpaceByToken);

// Protected routes
router.use(protect);
router.get('/', spaceController.getMySpaces);
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('visibility').optional().isIn(['public', 'private']),
    body('coverColor').optional().matches(/^#[0-9A-Fa-f]{6}$/),
    validate,
  ],
  spaceController.createSpace
);

router.get('/:id', optionalAuth, spaceController.getSpace);
router.put('/:id', spaceController.updateSpace);
router.delete('/:id', spaceController.deleteSpace);

// Items nested under spaces
router.get('/:spaceId/items', optionalAuth, itemController.getSpaceItems);
router.post('/:spaceId/items', itemController.createItem);

module.exports = router;

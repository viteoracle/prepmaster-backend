const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 */
router.post('/', validateUser, userController.createUser);
router.get('/:id', authenticate, userController.getUser);
router.put('/:id', authenticate, validateUser, userController.updateUser);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

module.exports = router;

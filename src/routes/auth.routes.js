const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register/student', validateUser, authController.register);
router.post('/login', authController.login);
router.get('/verify-email/:token', authController.verifyEmail);

// Protected routes - only super_admin can access
router.post(
    '/register/staff',
    authenticate,
    authorize('super_admin'),
    validateUser,
    authController.register
);

router.post(
    '/register/admin',
    authenticate,
    authorize('super_admin'),
    validateUser,
    authController.register
);

module.exports = router;

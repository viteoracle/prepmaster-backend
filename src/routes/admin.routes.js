import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as authController from '../controllers/auth.controller.js';
import { authenticate, authorize, hasPermission } from '../middleware/auth.js';
import { validateUserFilter } from '../middleware/validation.js';
import { adminLimiter } from '../config/security.js';

const router = express.Router();

// Public admin routes
router.post('/register', authController.registerAdmin);
router.post('/verify-otp', authController.verifyAdminOTP);

// Protected admin routes
router.use(adminLimiter);
router.use(authenticate);
router.use(authorize('admin', 'super_admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

// User Management Routes
router.get('/users', hasPermission('manage_users'), validateUserFilter, adminController.getAllUsers);
router.patch('/users/:id/activate', hasPermission('manage_users'), adminController.activateUser);
router.patch('/users/:id/deactivate', hasPermission('manage_users'), adminController.deactivateUser);

// Analytics Routes
router.get('/stats', hasPermission('view_stats'), adminController.getUserStats);

export default router;

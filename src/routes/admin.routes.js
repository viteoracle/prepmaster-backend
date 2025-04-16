import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as authController from '../controllers/auth.controller.js';
import { authenticate, authorize, hasPermission, checkResourceOwnership } from '../middleware/auth.js';
import { validateQuestion, validateUserFilter, validateQuestionFilter } from '../middleware/validation.js';
import { adminLimiter } from '../config/security.js';
import Question from '../models/question.model.js';

const router = express.Router();

// Apply authentication, rate limiting and authorization for all routes
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
router.get('/users', 
    hasPermission('manage_users'),
    validateUserFilter,
    adminController.getAllUsers
);

router.patch('/users/:id/activate',
    hasPermission('manage_users'),
    adminController.activateUser
);

router.patch('/users/:id/deactivate',
    hasPermission('manage_users'),
    adminController.deactivateUser
);

// Question Management Routes
router.get('/questions',
    hasPermission('manage_questions'),
    validateQuestionFilter,
    adminController.getAllQuestions
);

router.post('/questions',
    hasPermission('manage_questions'),
    validateQuestion,
    adminController.createQuestion
);

router.patch('/questions/:id',
    hasPermission('manage_questions'),
    checkResourceOwnership(Question),
    validateQuestion,
    adminController.updateQuestion
);

router.delete('/questions/:id',
    hasPermission('manage_questions'),
    checkResourceOwnership(Question),
    adminController.deleteQuestion
);

// Analytics Routes
router.get('/stats',
    hasPermission('view_stats'),
    adminController.getUserStats
);

router.get('/stats/questions',
    hasPermission('view_stats'),
    adminController.getQuestionStats
);

// Admin Authentication Routes
router.post('/register', authController.registerAdmin);
router.post('/verify-otp', authController.verifyAdminOTP);

export default router;

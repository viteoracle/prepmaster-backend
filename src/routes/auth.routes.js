import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateUser, validateStudentRegistration, validateOtpVerification } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post(
    '/register/student',
    validateStudentRegistration,
    authController.registerStudent
);
router.post(
    '/verify-otp',
    validateOtpVerification,
    authController.verifyOTP
);
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

// Removed duplicate admin registration routes since they're in admin.routes.js

export default router;

import { check, validationResult } from 'express-validator';
import AppError from '../utils/appError.js';
import Joi from 'joi';

// Helper function for validation middleware - moved to top
const validationMiddleware = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            errors: errors.array()
        });
    }
    next();
};

// Base validation middleware
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });
    
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return next(new AppError(errors.join(', '), 400));
    }
    next();
};

// User filter validation schema
const userFilterSchema = Joi.object({
    role: Joi.string().valid('student', 'staff', 'admin', 'super_admin'),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    sort: Joi.string()
}).unknown(true);

const validateUser = [
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    check('name').notEmpty().withMessage('Name is required'),
    validationMiddleware
];

const validateStudentRegistration = [
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    check('fullName').notEmpty().withMessage('Full name is required'),
    check('yearLevel').isInt({ min: 1, max: 5 }).withMessage('Year level must be between 1 and 5'),
    validationMiddleware
];

const validateOtpVerification = [
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Invalid OTP format'),
    validationMiddleware
];

const validateUserFilter = validate(userFilterSchema);

export {
    validateUser,
    validateStudentRegistration,
    validateOtpVerification,
    validateUserFilter
};

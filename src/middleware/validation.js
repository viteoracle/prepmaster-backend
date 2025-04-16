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

// Question validation schema
const questionSchema = Joi.object({
    title: Joi.string().required().trim().min(3).max(500),
    description: Joi.string().trim(),
    category: Joi.string().required().trim(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard'),
    options: Joi.array().items(
        Joi.object({
            text: Joi.string().required().trim(),
            isCorrect: Joi.boolean().required()
        })
    ).min(2).required().custom((value, helpers) => {
        if (!value.some(option => option.isCorrect)) {
            return helpers.error('array.base', {
                message: 'At least one option must be correct'
            });
        }
        return value;
    })
});

// User filter validation schema
const userFilterSchema = Joi.object({
    role: Joi.string().valid('student', 'staff', 'admin', 'super_admin'),
    department: Joi.string(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    sort: Joi.string()
}).unknown(true);

// Question filter validation schema
const questionFilterSchema = Joi.object({
    category: Joi.string(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard'),
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
    check('department').notEmpty().withMessage('Department is required'),
    check('yearLevel').isInt({ min: 1, max: 5 }).withMessage('Year level must be between 1 and 5'),
    validationMiddleware
];

const validateOtpVerification = [
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Invalid OTP format'),
    validationMiddleware
];

const validateQuestion = validate(questionSchema);
const validateQuestionFilter = validate(questionFilterSchema);
const validateUserFilter = validate(userFilterSchema);

// Export schemas for testing
const schemas = {
    questionSchema,
    userFilterSchema,
    questionFilterSchema
};

export {
    validateUser,
    validateStudentRegistration,
    validateOtpVerification,
    validateQuestion,
    validateQuestionFilter,
    validateUserFilter,
    schemas
};

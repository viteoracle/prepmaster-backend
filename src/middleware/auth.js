import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// Role hierarchy and permissions
const ROLE_HIERARCHY = {
    super_admin: ['admin', 'staff', 'student'],
    admin: ['staff', 'student'],
    staff: ['student'],
    student: []
};

const ROLE_PERMISSIONS = {
    super_admin: ['*'],
    admin: [
        'manage_users',
        'manage_questions',
        'view_stats',
        'manage_departments'
    ],
    staff: [
        'create_questions',
        'edit_own_questions',
        'view_questions',
        'view_student_progress'
    ],
    student: [
        'attempt_questions',
        'view_own_progress',
        'update_own_profile'
    ]
};

const authenticate = catchAsync(async (req, res, next) => {
    // 1) Check if token exists
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(AppError.unauthorized('Please log in to access this resource'));
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
        return next(AppError.unauthorized('User no longer exists'));
    }

    // 4) Check if user changed password after token was issued
    if (user.passwordChangedAfter(decoded.iat)) {
        return next(AppError.unauthorized('Password recently changed. Please log in again'));
    }

    // 5) Check if account is locked
    if (user.isLocked && user.isLocked()) {
        return next(AppError.forbidden('Account is locked. Please try again later'));
    }

    // Grant access to protected route
    req.user = user;
    next();
});

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(AppError.forbidden('You do not have permission to perform this action'));
        }
        next();
    };
};

const hasPermission = (permission) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        const permissions = ROLE_PERMISSIONS[userRole];

        // Super admin has all permissions
        if (userRole === 'super_admin' || permissions.includes('*')) {
            return next();
        }

        // Check if user has specific permission
        if (!permissions.includes(permission)) {
            return next(AppError.forbidden('You do not have permission to perform this action'));
        }

        next();
    };
};

const checkResourceOwnership = (Model, paramIdField = 'id') => {
    return catchAsync(async (req, res, next) => {
        const resource = await Model.findById(req.params[paramIdField]);

        if (!resource) {
            return next(AppError.notFound('Resource not found'));
        }

        // Super admin and admin can access all resources
        if (['super_admin', 'admin'].includes(req.user.role)) {
            return next();
        }

        // Check if user owns the resource
        if (resource.createdBy?.toString() !== req.user._id.toString()) {
            return next(AppError.forbidden('You do not have permission to modify this resource'));
        }

        req.resource = resource;
        next();
    });
};

// Helper function to check role hierarchy
const isRoleHigherOrEqual = (userRole, targetRole) => {
    if (userRole === targetRole) return true;
    return ROLE_HIERARCHY[userRole]?.includes(targetRole) || false;
};

export {
    authenticate,
    authorize,
    hasPermission,
    checkResourceOwnership
};

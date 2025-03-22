const jwt = require('jsonwebtoken');
const config = require('../config/config');
const AppError = require('../utils/appError');
const User = require('../models/user.model');

exports.authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return next(new AppError('Please log in to access this resource', 401));
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        next(new AppError('Invalid token', 401));
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

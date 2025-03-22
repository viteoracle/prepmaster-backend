const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const config = require('../config/config');
const AppError = require('../utils/appError');

class AuthService {
    generateToken(userId) {
        return jwt.sign({ id: userId }, config.jwtSecret, {
            expiresIn: '24h'
        });
    }

    async register(userData, currentUser) {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new AppError('Email already registered', 400);
        }

        // Check permissions for creating staff and admin
        if (['staff', 'admin'].includes(userData.role)) {
            if (!currentUser || currentUser.role !== 'super_admin') {
                throw new AppError('Only super admin can create staff and admin accounts', 403);
            }
        }

        // Check for super_admin
        if (userData.role === 'super_admin') {
            const superAdminExists = await User.findOne({ role: 'super_admin' });
            if (superAdminExists) {
                throw new AppError('Super Admin already exists', 400);
            }
        }

        return await User.create(userData);
    }

    async login(email, password) {
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            throw new AppError('Invalid email or password', 401);
        }

        if (!user.isEmailVerified) {
            throw new AppError('Please verify your email first', 401);
        }

        const token = this.generateToken(user._id);
        user.password = undefined;

        return { user, token };
    }

    async generateEmailVerificationToken(user) {
        const token = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await user.save();
        return token;
    }
}

module.exports = new AuthService();

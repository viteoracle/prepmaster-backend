import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import chalk from 'chalk';
import User from '../models/user.model.js';
import config from '../config/config.js';
import AppError from '../utils/appError.js';

class AuthService {
    generateToken(userId) {
        return jwt.sign({ id: userId }, config.jwtSecret, {
            expiresIn: '24h'
        });
    }

    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async register(userData, currentUser) {
        console.log(chalk.blue(`📝 New registration attempt: ${userData.email}`));
        const { confirmPassword, ...userDataWithoutConfirm } = userData;

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

        const otp = this.generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await User.create({
            ...userDataWithoutConfirm,
            role: 'student',
            otpCode: otp,
            otpExpires
        });

        console.log(chalk.green(`✓ Successfully registered user: ${userData.email}`));
        return { user, otp };
    }

    async registerAdmin(userData) {
        const { email, password, name } = userData;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('Email already registered', 400);
        }

        const otp = this.generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await User.create({
            email,
            password,
            name,
            role: 'admin',
            otpCode: otp,
            otpExpires
        });

        user.password = undefined;
        return { user, otp };
    }

    async verifyOTP(email, otp) {
        const user = await User.findOne({
            email,
            otpCode: otp,
            otpExpires: { $gt: Date.now() }
        }).select('+otpCode +otpExpires');

        if (!user) {
            throw new AppError('Invalid or expired OTP', 400);
        }

        user.isEmailVerified = true;
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        return user;
    }

    async verifyAdminOTP(email, otp) {
        const user = await User.findOne({
            email,
            role: 'admin',
            otpCode: otp,
            otpExpires: { $gt: Date.now() }
        }).select('+otpCode +otpExpires');

        if (!user) {
            throw new AppError('Invalid or expired OTP', 400);
        }

        user.isEmailVerified = true;
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = this.generateToken(user._id);
        user.password = undefined;

        return { user, token };
    }

    async login(email, password) {
        console.log(chalk.blue(`👤 Login attempt for user: ${email}`));
        
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            console.log(chalk.yellow(`❌ Failed login attempt for user: ${email}`));
            throw new AppError('Invalid email or password', 401);
        }

        console.log(chalk.green(`✓ Successful login for user: ${email}`));

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

export default new AuthService();

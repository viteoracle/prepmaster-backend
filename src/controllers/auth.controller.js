import authService from '../services/auth.service.js';
import emailService from '../services/email.service.js';
import catchAsync from '../utils/catchAsync.js';

const register = catchAsync(async (req, res) => {
    const user = await authService.register(req.body, req.user);
    const verificationToken = await authService.generateEmailVerificationToken(user);

    await emailService.sendVerificationEmail(
        user.email,
        user.name,
        verificationToken
    );

    res.status(201).json({
        status: 'success',
        message: 'Registration successful. Please verify your email.'
    });
});

const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    res.status(200).json({
        status: 'success',
        data: { user, token }
    });
});

const verifyEmail = catchAsync(async (req, res) => {
    await authService.verifyEmail(req.params.token);

    res.status(200).json({
        status: 'success',
        message: 'Email verified successfully'
    });
});

const registerStudent = catchAsync(async (req, res) => {
    const { user, otp } = await authService.register(req.body);

    await emailService.sendOTPEmail(
        user.email,
        user.fullName,
        otp
    );

    res.status(201).json({
        status: 'success',
        message: 'Registration successful. Please check your email for OTP verification.'
    });
});

const verifyOTP = catchAsync(async (req, res) => {
    const { email, otp } = req.body;
    await authService.verifyOTP(email, otp);

    res.status(200).json({
        status: 'success',
        message: 'Email verified successfully'
    });
});

const registerAdmin = catchAsync(async (req, res) => {
    const userData = {
        ...req.body,
        role: 'admin'  // Force role to be admin
    };

    const { user, otp } = await authService.registerAdmin(userData);

    await emailService.sendOTPEmail(
        user.email,
        user.name,
        otp
    );

    res.status(201).json({
        status: 'success',
        message: 'Admin registration successful. Please verify OTP sent to your email.'
    });
});

const verifyAdminOTP = catchAsync(async (req, res) => {
    const { email, otp } = req.body;
    const { user, token } = await authService.verifyAdminOTP(email, otp);

    res.status(200).json({
        status: 'success',
        message: 'Admin verified successfully',
        data: { user, token }
    });
});

export {
    register,
    login,
    verifyEmail,
    registerStudent,
    verifyOTP,
    registerAdmin,
    verifyAdminOTP
};

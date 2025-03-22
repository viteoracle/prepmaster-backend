const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res) => {
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

exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    res.status(200).json({
        status: 'success',
        data: { user, token }
    });
});

exports.verifyEmail = catchAsync(async (req, res) => {
    await authService.verifyEmail(req.params.token);

    res.status(200).json({
        status: 'success',
        message: 'Email verified successfully'
    });
});

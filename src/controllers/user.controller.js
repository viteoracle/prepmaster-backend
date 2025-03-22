const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');

exports.createUser = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    res.status(201).json({
        status: 'success',
        data: { user }
    });
});

exports.getUser = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: { user }
    });
});

exports.updateUser = catchAsync(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({
        status: 'success',
        data: { user }
    });
});

exports.deleteUser = catchAsync(async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null
    });
});

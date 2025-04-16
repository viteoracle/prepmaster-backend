import userService from '../services/user.service.js';
import catchAsync from '../utils/catchAsync.js';

export const createUser = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    res.status(201).json({
        status: 'success',
        data: { user }
    });
});

export const getUser = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: { user }
    });
});

export const updateUser = catchAsync(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({
        status: 'success',
        data: { user }
    });
});

export const deleteUser = catchAsync(async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null
    });
});

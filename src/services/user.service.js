const User = require('../models/user.model');
const AppError = require('../utils/appError');

class UserService {
    async createUser(userData) {
        const user = await User.create(userData);
        return user;
    }

    async getUserById(id) {
        const user = await User.findById(id);
        if (!user) throw new AppError('User not found', 404);
        return user;
    }

    async updateUser(id, updateData) {
        const user = await User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });
        if (!user) throw new AppError('User not found', 404);
        return user;
    }

    async deleteUser(id) {
        const user = await User.findByIdAndDelete(id);
        if (!user) throw new AppError('User not found', 404);
        return user;
    }
}

module.exports = new UserService();

import User from '../models/user.model.js';
import AppError from '../utils/appError.js';

class AdminService {
    async getAllUsers(role, department, options = {}) {
        const query = {};
        if (role) query.role = role;

        const users = await User.paginate(query, {
            ...options,
            select: '-password'
        });

        return users;
    }

    async getUserStats() {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    verifiedUsers: {
                        $sum: { $cond: ['$isEmailVerified', 1, 0] }
                    }
                }
            },
            {
                $project: {
                    role: '$_id',
                    count: 1,
                    verifiedUsers: 1,
                    verificationRate: {
                        $multiply: [
                            { $divide: ['$verifiedUsers', '$count'] },
                            100
                        ]
                    }
                }
            }
        ]);

        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

        return {
            totalUsers,
            verifiedUsers,
            verificationRate: (verifiedUsers / totalUsers) * 100,
            roleDistribution: stats
        };
    }

    async updateUser(id, updateData) {
        const user = await User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user;
    }
}

export default new AdminService();

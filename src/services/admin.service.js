import User from '../models/user.model.js';
import Question from '../models/question.model.js';
import AppError from '../utils/appError.js';

class AdminService {
    async getAllUsers(role, department, options = {}) {
        const query = {};
        if (role) query.role = role;
        if (department) query.department = department;

        const users = await User.paginate(query, {
            ...options,
            select: '-password',
            populate: {
                path: 'department',
                select: 'name'
            }
        });

        return users;
    }

    async getAllQuestions(category, difficulty, options = {}) {
        const query = {};
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;

        const questions = await Question.paginate(query, {
            ...options,
            populate: {
                path: 'createdBy',
                select: 'name role'
            }
        });

        return questions;
    }

    async createQuestion(questionData) {
        const question = await Question.create(questionData);
        return await question.populate('createdBy', 'name role');
    }

    async updateQuestion(id, updateData) {
        const question = await Question.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name role');

        if (!question) {
            throw new AppError('Question not found', 404);
        }

        return question;
    }

    async deleteQuestion(id) {
        const question = await Question.findByIdAndDelete(id);
        if (!question) {
            throw new AppError('Question not found', 404);
        }
        return question;
    }

    async getUserStats() {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    departments: { $addToSet: '$department' },
                    verifiedUsers: {
                        $sum: { $cond: ['$isEmailVerified', 1, 0] }
                    }
                }
            },
            {
                $project: {
                    role: '$_id',
                    count: 1,
                    departments: 1,
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

    async getQuestionStats() {
        const stats = await Question.aggregate([
            {
                $group: {
                    _id: {
                        category: '$category',
                        difficulty: '$difficulty'
                    },
                    count: { $sum: 1 },
                    averageOptions: { $avg: { $size: '$options' } }
                }
            },
            {
                $group: {
                    _id: '$_id.category',
                    difficulties: {
                        $push: {
                            difficulty: '$_id.difficulty',
                            count: '$count',
                            averageOptions: { $round: ['$averageOptions', 1] }
                        }
                    },
                    totalQuestions: { $sum: '$count' }
                }
            }
        ]);

        return {
            categoryDistribution: stats,
            totalQuestions: await Question.countDocuments()
        };
    }
}

export default new AdminService();

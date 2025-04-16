import adminService from '../services/admin.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const getAllUsers = catchAsync(async (req, res) => {
    const { role, department, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const users = await adminService.getAllUsers(role, department, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort
    });

    res.status(200).json({
        status: 'success',
        results: users.docs.length,
        pagination: {
            currentPage: users.page,
            totalPages: users.totalPages,
            totalResults: users.totalDocs
        },
        data: { users: users.docs }
    });
});

export const getAllQuestions = catchAsync(async (req, res) => {
    const { category, difficulty, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const questions = await adminService.getAllQuestions(category, difficulty, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort
    });

    res.status(200).json({
        status: 'success',
        results: questions.docs.length,
        pagination: {
            currentPage: questions.page,
            totalPages: questions.totalPages,
            totalResults: questions.totalDocs
        },
        data: { questions: questions.docs }
    });
});

export const createQuestion = catchAsync(async (req, res) => {
    if (!req.body.options?.some(option => option.isCorrect)) {
        throw new AppError('At least one correct answer must be provided', 400);
    }

    const question = await adminService.createQuestion({
        ...req.body,
        createdBy: req.user._id
    });

    res.status(201).json({
        status: 'success',
        data: { question }
    });
});

export const updateQuestion = catchAsync(async (req, res) => {
    const question = await adminService.updateQuestion(req.params.id, req.body);
    res.status(200).json({
        status: 'success',
        data: { question }
    });
});

export const deleteQuestion = catchAsync(async (req, res) => {
    await adminService.deleteQuestion(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null
    });
});

export const getUserStats = catchAsync(async (req, res) => {
    const stats = await adminService.getUserStats();
    const questionStats = await adminService.getQuestionStats();

    res.status(200).json({
        status: 'success',
        data: { 
            users: stats,
            questions: questionStats
        }
    });
});

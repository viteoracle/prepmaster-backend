const Joi = require('joi');
const AppError = require('../utils/appError');

exports.validateUser = (req, res, next) => {
    const baseSchema = {
        name: Joi.string().required().min(2),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('student', 'staff', 'admin', 'super_admin')
    };

    const studentSchema = {
        ...baseSchema,
        studentId: Joi.string().required(),
        yearLevel: Joi.number().min(1).max(5).required(),
        department: Joi.string().required()
    };

    const staffSchema = {
        ...baseSchema,
        staffId: Joi.string().required(),
        department: Joi.string().required()
    };

    // Enforce role based on endpoint
    if (req.path === '/register/student') {
        req.body.role = 'student';
    } else if (req.path === '/register/staff') {
        req.body.role = 'staff';
    } else if (req.path === '/register/admin') {
        req.body.role = 'admin';
    }

    let schema;
    if (req.body.role === 'student') {
        schema = Joi.object(studentSchema);
    } else if (req.body.role === 'staff') {
        schema = Joi.object(staffSchema);
    } else {
        schema = Joi.object(baseSchema);
    }

    const { error } = schema.validate(req.body);
    if (error) {
        return next(new AppError(error.details[0].message, 400));
    }
    next();
};

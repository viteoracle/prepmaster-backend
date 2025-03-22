const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false,
    },
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'staff', 'admin', 'super_admin'],
        default: 'student'
    },
    studentId: {
        type: String,
        unique: true,
        sparse: true
    },
    staffId: {
        type: String,
        unique: true,
        sparse: true
    },
    department: String,
    yearLevel: {
        type: Number,
        min: 1,
        max: 5
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

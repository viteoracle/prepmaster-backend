import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Question title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Question category is required'],
        index: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
        index: true
    },
    options: [{
        text: {
            type: String,
            required: [true, 'Option text is required']
        },
        isCorrect: {
            type: Boolean,
            required: true
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
questionSchema.index({ category: 1, difficulty: 1 });
questionSchema.index({ createdAt: -1 });

// Add pagination plugin
questionSchema.plugin(mongoosePaginate);

// Ensure at least one correct option exists
questionSchema.pre('save', function(next) {
    if (!this.options.some(option => option.isCorrect)) {
        next(new Error('At least one correct option is required'));
    }
    next();
});

const Question = mongoose.model('Question', questionSchema);
export default Question;

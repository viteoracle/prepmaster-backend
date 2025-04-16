import AppError from './appError.js';

/**
 * A utility function to wrap async route handlers and avoid try-catch blocks
 * Includes error tracking and logging capabilities
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        const startTime = Date.now();
        const routeInfo = {
            method: req.method,
            path: req.path,
            correlationId: req.headers['x-correlation-id'] || generateCorrelationId(),
            userId: req.user?.id
        };

        Promise.resolve(fn(req, res, next))
            .catch(error => {
                // Log error with context
                const errorContext = {
                    ...routeInfo,
                    duration: Date.now() - startTime,
                    errorType: error.name,
                    errorMessage: error.message,
                    stack: error.stack
                };

                // Log error context in development
                if (process.env.NODE_ENV === 'development') {
                    console.error('Request Error Context:', errorContext);
                }

                // Convert unknown errors to AppError
                if (!(error instanceof AppError)) {
                    error = AppError.internal(
                        'Something went wrong! Please try again later.',
                        'UNKNOWN_ERROR'
                    );
                }

                next(error);
            });
    };
};

/**
 * Generate a unique correlation ID for request tracking
 */
const generateCorrelationId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default catchAsync;

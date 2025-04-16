class AppError extends Error {
    constructor(message, statusCode, errorCode = null) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.errorCode = errorCode;

        // Add timestamp for logging and debugging
        this.timestamp = new Date().toISOString();

        // Classify error type
        this.errorType = this.classifyError(statusCode);

        Error.captureStackTrace(this, this.constructor);
    }

    classifyError(statusCode) {
        if (statusCode === 400) return 'ValidationError';
        if (statusCode === 401) return 'AuthenticationError';
        if (statusCode === 403) return 'AuthorizationError';
        if (statusCode === 404) return 'NotFoundError';
        if (statusCode === 409) return 'ConflictError';
        if (statusCode === 429) return 'RateLimitError';
        if (statusCode >= 500) return 'ServerError';
        return 'UnknownError';
    }

    toJSON() {
        return {
            status: this.status,
            statusCode: this.statusCode,
            message: this.message,
            errorType: this.errorType,
            errorCode: this.errorCode,
            timestamp: this.timestamp,
            isOperational: this.isOperational
        };
    }

    static badRequest(message, errorCode = null) {
        return new AppError(message, 400, errorCode);
    }

    static unauthorized(message, errorCode = null) {
        return new AppError(message, 401, errorCode);
    }

    static forbidden(message, errorCode = null) {
        return new AppError(message, 403, errorCode);
    }

    static notFound(message, errorCode = null) {
        return new AppError(message, 404, errorCode);
    }

    static conflict(message, errorCode = null) {
        return new AppError(message, 409, errorCode);
    }

    static tooManyRequests(message, errorCode = null) {
        return new AppError(message, 429, errorCode);
    }

    static internal(message, errorCode = null) {
        return new AppError(message, 500, errorCode);
    }
}

export default AppError;

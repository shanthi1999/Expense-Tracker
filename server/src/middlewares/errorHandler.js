import logger from '../vendors/logger/logger.js';

const errorHandler = (err, req, res, next) => {
    const txId = req.id || 'unknown';
    const statusCode = err.statusCode || 500;
    const isServerError = statusCode >= 500;

    if (isServerError) {
        logger.error(`[${txId}] [ErrorHandler] ${err.message}`, {
            statusCode,
            stack: err.stack,
        });
    } else {
        logger.warn(`[${txId}] [ErrorHandler] ${err.message}`, { statusCode });
    }

    if (res.headersSent) {
        return next(err);
    }

    const message =
        isServerError && process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        message,
    });
};

export default errorHandler;

import rateLimit from 'express-rate-limit';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 1000;

const rateLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: MAX_REQUESTS,
    legacyHeaders: false,
    standardHeaders: true,
    handler: (req, res) => {
        const resetMs = req.rateLimit?.resetTime
            ? req.rateLimit.resetTime.getTime() - Date.now()
            : WINDOW_MS;
        const retryAfterSeconds = Math.max(1, Math.ceil(resetMs / 1000));

        res.status(429).json({
            success: false,
            statusCode: 429,
            data: {
                message: 'Too many requests, please try again later.',
                retryAfterSeconds,
            },
            txId: req.id || 'unknown',
        });
    },
});

export default rateLimiter;

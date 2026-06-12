import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
    windowMs: 15 *60 *1000,
    max: 100,
    message:  "Too many requests, please try again later.",
    legacyHeaders: true,
    secureHeaders: true,
    standardHeaders: true,
});

export default rateLimiter;
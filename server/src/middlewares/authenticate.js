import authUtils from '../vendors/jwt/auth.js';
import logger from '../vendors/logger/logger.js';

const authenticate = (req, res, next) => {
    const txId = req.id;
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.warn(`[${txId}] [Authenticate] Missing or malformed Authorization header`);
            return res.status(401).json({
                success: false,
                statusCode: 401,
                data: { message: 'Access token required' },
                txId,
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = authUtils.verifyAccessToken(token);

        req.user = decoded;
        logger.info(`[${txId}] [Authenticate] Token verified`, { userId: decoded.userId });
        next();
    } catch (error) {
        logger.error(`[${txId}] [Authenticate] Token verification failed`, {
            error: error.message,
        });
        return res.status(401).json({
            success: false,
            statusCode: 401,
            data: { message: 'Invalid or expired access token' },
            txId,
        });
    }
};

export default authenticate;

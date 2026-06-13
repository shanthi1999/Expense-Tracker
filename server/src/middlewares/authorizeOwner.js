import logger from '../vendors/logger/logger.js';

const authorizeOwner = (req, res, next) => {
    const txId = req.id;
    if (req.params.id !== req.user.userId) {
        logger.warn(`[${txId}] [AuthorizeOwner] Forbidden access attempt`, {
            requestedId: req.params.id,
            userId: req.user.userId,
        });
        return res.status(403).json({
            success: false,
            statusCode: 403,
            data: { message: 'You are not authorized to access this resource' },
            txId,
        });
    }
    next();
};

export default authorizeOwner;

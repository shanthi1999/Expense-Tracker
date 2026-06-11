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
            message: 'You are not authorized to access this resource',
        });
    }
    next();
};

export default authorizeOwner;

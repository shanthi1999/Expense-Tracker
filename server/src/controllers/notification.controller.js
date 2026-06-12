import notificationService from '../service/notification/notification.service.js';

const getNotifications = async (req, res, next) => {
    const txId = req.id;
    try {
        const result = await notificationService.getNotifications(
            req.validatedQuery ?? req.query,
            req.user.userId,
            txId
        );
        return res.status(200).json({
            success: true,
            message: 'Notifications fetched successfully',
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

const markAsRead = async (req, res, next) => {
    const txId = req.id;
    const { id } = req.params;
    try {
        const notification = await notificationService.markAsRead(id, req.user.userId, txId);
        return res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

const markAllAsRead = async (req, res, next) => {
    const txId = req.id;
    try {
        const result = await notificationService.markAllAsRead(req.user.userId, txId);
        return res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getNotifications,
    markAsRead,
    markAllAsRead,
};

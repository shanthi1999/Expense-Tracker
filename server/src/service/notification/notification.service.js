import notificationDbModelApi from '../../service_model/notification/notification.service.model.js';
import logger from '../../vendors/logger/logger.js';
import AppError from '../../utils/AppError.js';

const getNotifications = async (query, userId, txId) => {
    logger.info(`[${txId}] [NotificationService] [getNotifications] Fetching`, { query, userId });

    try {
        const { page = 1, limit = 20, isRead } = query;
        const filter = { userId };

        if (isRead !== undefined) {
            filter.isRead = isRead;
        }

        const skip = (Number(page) - 1) * Number(limit);
        const db = new notificationDbModelApi();
        const result = await db.getNotifications(
            filter,
            Number(limit),
            skip,
            { createdAt: -1 },
            txId
        );
        const unreadCount = await db.countUnread(userId, txId);

        return {
            ...result,
            unreadCount,
            page: Number(page),
            limit: Number(limit),
        };
    } catch (error) {
        logger.error(`[${txId}] [NotificationService] [getNotifications] Failed`, {
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to fetch notifications: ${error.message}`, 500);
    }
};

const createNotification = async (payload, txId) => {
    const db = new notificationDbModelApi();
    return db.createNotification(payload, txId);
};

const markAsRead = async (notificationId, userId, txId) => {
    logger.info(`[${txId}] [NotificationService] [markAsRead] Updating`, {
        notificationId,
        userId,
    });

    try {
        const db = new notificationDbModelApi();
        const updated = await db.markAsRead({ notificationId, userId }, txId);

        if (!updated) {
            throw new AppError(`Notification not found: ${notificationId}`, 404);
        }

        return updated;
    } catch (error) {
        logger.error(`[${txId}] [NotificationService] [markAsRead] Failed`, {
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to mark notification as read: ${error.message}`, 500);
    }
};

const markAllAsRead = async (userId, txId) => {
    logger.info(`[${txId}] [NotificationService] [markAllAsRead] Updating`, { userId });

    try {
        const db = new notificationDbModelApi();
        const count = await db.markAllAsRead(userId, txId);
        return { updated: count };
    } catch (error) {
        logger.error(`[${txId}] [NotificationService] [markAllAsRead] Failed`, {
            error: error.message,
        });
        if (error instanceof AppError) throw error;
        throw new AppError(`Failed to mark notifications as read: ${error.message}`, 500);
    }
};

export default {
    getNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
};

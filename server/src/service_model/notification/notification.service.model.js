import notificationModel from '../../models/notifications/notification.model.js';
import logger from '../../vendors/logger/logger.js';

class notificationDbModelApi {
    async getNotifications(filter, limit, skip, sortOption, txId) {
        logger.info(`[${txId}] [NotificationServiceModel] [getNotifications] Querying`, {
            filter,
            limit,
            skip,
        });
        try {
            const data = await notificationModel
                .find(filter)
                .limit(limit)
                .skip(skip)
                .sort(sortOption)
                .lean();
            const total = await notificationModel.countDocuments(filter);
            return { data, total };
        } catch (error) {
            logger.error(`[${txId}] [NotificationServiceModel] [getNotifications] Failed`, {
                error: error.message,
            });
            throw new Error(error);
        }
    }

    async countUnread(userId, txId) {
        try {
            return await notificationModel.countDocuments({ userId, isRead: false });
        } catch (error) {
            logger.error(`[${txId}] [NotificationServiceModel] [countUnread] Failed`, {
                error: error.message,
            });
            throw new Error(error);
        }
    }

    async createNotification(document, txId) {
        logger.info(`[${txId}] [NotificationServiceModel] [createNotification] Creating`, {
            document,
        });
        try {
            const record = new notificationModel(document);
            return await record.save();
        } catch (error) {
            logger.error(`[${txId}] [NotificationServiceModel] [createNotification] Failed`, {
                error: error.message,
            });
            throw new Error(error);
        }
    }

    async markAsRead(filter, txId) {
        logger.info(`[${txId}] [NotificationServiceModel] [markAsRead] Updating`, { filter });
        try {
            return await notificationModel.findOneAndUpdate(filter, { isRead: true }, { new: true });
        } catch (error) {
            logger.error(`[${txId}] [NotificationServiceModel] [markAsRead] Failed`, {
                error: error.message,
            });
            throw new Error(error);
        }
    }

    async markAllAsRead(userId, txId) {
        logger.info(`[${txId}] [NotificationServiceModel] [markAllAsRead] Updating`, { userId });
        try {
            const result = await notificationModel.updateMany(
                { userId, isRead: false },
                { isRead: true }
            );
            return result.modifiedCount;
        } catch (error) {
            logger.error(`[${txId}] [NotificationServiceModel] [markAllAsRead] Failed`, {
                error: error.message,
            });
            throw new Error(error);
        }
    }
}

export default notificationDbModelApi;

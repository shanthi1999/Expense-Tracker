import notificationService from '../services/notification/notification.service.js';
import apiResponseHelper from '../utils/apiResponseHelper.js';

const getNotifications = async (req, res, next) => {
    const txId = req.id;
    try {
        const result = await notificationService.getNotifications(
            req.validatedQuery ?? req.query,
            req.user.userId,
            txId
        );
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            result,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const markAsRead = async (req, res, next) => {
    const txId = req.id;
    const { id } = req.params;
    try {
        const notification = await notificationService.markAsRead(id, req.user.userId, txId);
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            notification,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

const markAllAsRead = async (req, res, next) => {
    const txId = req.id;
    try {
        const result = await notificationService.markAllAsRead(req.user.userId, txId);
        return apiResponseHelper.customResponseFormat(
            txId,
            res,
            result,
            apiResponseHelper.responseFlags.actionComplete
        );
    } catch (error) {
        next(error);
    }
};

export default {
    getNotifications,
    markAsRead,
    markAllAsRead,
};

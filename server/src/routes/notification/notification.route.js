import express from 'express';
import notificationController from '../../controllers/notification.controller.js';
import validate from '../../middlewares/validate.js';
import notificationValidator from '../../validators/notification.validator.js';

const notificationRouter = express.Router();

notificationRouter.get(
    '/',
    validate(notificationValidator.getNotifications, 'query'),
    notificationController.getNotifications
);
notificationRouter.patch(
    '/read-all',
    notificationController.markAllAsRead
);
notificationRouter.patch(
    '/:id/read',
    validate(notificationValidator.idParam, 'params'),
    notificationController.markAsRead
);

export default notificationRouter;

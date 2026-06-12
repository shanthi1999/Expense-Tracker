import Joi from 'joi';

const getNotifications = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    isRead: Joi.boolean().optional(),
});

const idParam = Joi.object({
    id: Joi.string().trim().required(),
});

export default {
    getNotifications,
    idParam,
};

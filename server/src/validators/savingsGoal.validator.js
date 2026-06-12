import Joi from 'joi';
import savingsGoalEnums from '../enums/savingsGoal.enums.js';
import commonEnums from '../enums/common.enums.js';

const SORT_FIELDS = Object.values(savingsGoalEnums.sortFields);
const SORT_ORDERS = Object.values(commonEnums.sortOrder);

const createSavingsGoal = Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    targetAmount: Joi.number().min(1).required(),
    savedAmount: Joi.number().min(0).optional(),
    deadline: Joi.date().greater('now').required().messages({
        'date.greater': 'deadline must be in the future',
    }),
    description: Joi.string().trim().max(500).optional(),
});

const updateSavingsGoal = Joi.object({
    title: Joi.string().trim().min(1).max(200).optional(),
    targetAmount: Joi.number().min(1).optional(),
    savedAmount: Joi.number().min(0).optional(),
    deadline: Joi.date().optional(),
    description: Joi.string().trim().max(500).optional().allow(''),
})
    .min(1)
    .messages({ 'object.min': 'At least one field must be provided for update' });

const contributeToGoal = Joi.object({
    amount: Joi.number().min(0.01).required(),
});

const getSavingsGoals = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    activeOnly: Joi.boolean().optional(),
    sortBy: Joi.string()
        .valid(...SORT_FIELDS)
        .optional(),
    order: Joi.string().valid(...SORT_ORDERS).optional(),
});

const idParam = Joi.object({
    id: Joi.string().trim().required(),
});

export default {
    createSavingsGoal,
    updateSavingsGoal,
    contributeToGoal,
    getSavingsGoals,
    idParam,
};

import Joi from 'joi';
import expenseEnums from '../enums/expense.enums.js';
import scheduledExpenseEnums from '../enums/scheduledExpense.enums.js';
import commonEnums from '../enums/common.enums.js';

const PAYMENT_METHODS = Object.values(expenseEnums.paymentMethods);
const FREQUENCIES = Object.values(scheduledExpenseEnums.frequency);
const SORT_FIELDS = Object.values(scheduledExpenseEnums.sortFields);
const SORT_ORDERS = Object.values(commonEnums.sortOrder);

const createScheduledExpense = Joi.object({
    title: Joi.string().trim().min(1).max(200).required().messages({
        'string.min': 'title cannot be empty',
        'any.required': 'title is required',
    }),
    amount: Joi.number().min(0).required().messages({
        'number.min': 'amount must be 0 or greater',
        'any.required': 'amount is required',
    }),
    categoryId: Joi.string().uuid().required().messages({
        'string.guid': 'categoryId must be a valid UUID',
        'any.required': 'categoryId is required',
    }),
    expenseTypeId: Joi.string().uuid().required().messages({
        'string.guid': 'expenseTypeId must be a valid UUID',
        'any.required': 'expenseTypeId is required',
    }),
    description: Joi.string().trim().max(500).optional(),
    paymentMethod: Joi.string()
        .valid(...PAYMENT_METHODS)
        .optional()
        .messages({
            'any.only': `paymentMethod must be one of ${PAYMENT_METHODS.join(', ')}`,
        }),
    frequency: Joi.string()
        .valid(...FREQUENCIES)
        .default(scheduledExpenseEnums.frequency.monthly),
    dayOfMonth: Joi.number().integer().min(1).max(31).required().messages({
        'number.min': 'dayOfMonth must be between 1 and 31',
        'number.max': 'dayOfMonth must be between 1 and 31',
        'any.required': 'dayOfMonth is required',
    }),
    startDate: Joi.date().required().messages({
        'date.base': 'startDate must be a valid date',
        'any.required': 'startDate is required',
    }),
    endDate: Joi.date().min(Joi.ref('startDate')).optional().messages({
        'date.min': 'endDate must be on or after startDate',
    }),
});

const updateScheduledExpense = Joi.object({
    title: Joi.string().trim().min(1).max(200).optional(),
    amount: Joi.number().min(0).optional(),
    categoryId: Joi.string().uuid().optional(),
    expenseTypeId: Joi.string().uuid().optional(),
    description: Joi.string().trim().max(500).optional(),
    paymentMethod: Joi.string()
        .valid(...PAYMENT_METHODS)
        .optional(),
    frequency: Joi.string()
        .valid(...FREQUENCIES)
        .optional(),
    dayOfMonth: Joi.number().integer().min(1).max(31).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional().allow(null),
    isActive: Joi.boolean().optional(),
})
    .min(1)
    .messages({
        'object.min': 'At least one field must be provided for update',
    });

const getScheduledExpenses = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    isActive: Joi.boolean().optional(),
    sortBy: Joi.string()
        .valid(...SORT_FIELDS)
        .optional(),
    order: Joi.string().valid(...SORT_ORDERS).optional(),
});

const idParam = Joi.object({
    id: Joi.string().trim().required(),
});

export default {
    createScheduledExpense,
    updateScheduledExpense,
    getScheduledExpenses,
    idParam,
};

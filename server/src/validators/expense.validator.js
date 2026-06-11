import Joi from 'joi';
import expenseEnums from '../enums/expense.enums.js';
import commonEnums from '../enums/common.enums.js';

const PAYMENT_METHODS = Object.values(expenseEnums.paymentMethods);
const EXPENSE_SORT_FIELDS = Object.values(expenseEnums.sortFields);
const SORT_ORDERS = Object.values(commonEnums.sortOrder);

const createExpense = Joi.object({
    title: Joi.string().trim().min(1).max(200).required().messages({
        'string.min': 'title cannot be empty',
        'string.max': 'title must be at most 200 characters',
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
    date: Joi.date().required().messages({
        'date.base': 'date must be a valid date',
        'any.required': 'date is required',
    }),
    description: Joi.string().trim().max(500).optional(),
    paymentMethod: Joi.string()
        .valid(...PAYMENT_METHODS)
        .optional()
        .messages({
            'any.only': `paymentMethod must be one of ${PAYMENT_METHODS.join(', ')}`,
        }),
});

const updateExpense = Joi.object({
    title: Joi.string().trim().min(1).max(200).optional(),
    amount: Joi.number().min(0).optional(),
    categoryId: Joi.string().uuid().optional().messages({
        'string.guid': 'categoryId must be a valid UUID',
    }),
    expenseTypeId: Joi.string().uuid().optional().messages({
        'string.guid': 'expenseTypeId must be a valid UUID',
    }),
    date: Joi.date().optional(),
    description: Joi.string().trim().max(500).optional(),
    paymentMethod: Joi.string()
        .valid(...PAYMENT_METHODS)
        .optional()
        .messages({
            'any.only': `paymentMethod must be one of ${PAYMENT_METHODS.join(', ')}`,
        }),
})
    .min(1)
    .messages({
        'object.min': 'At least one field must be provided for update',
    });

const getExpenses = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    categoryId: Joi.string().uuid().optional().messages({
        'string.guid': 'categoryId must be a valid UUID',
    }),
    expenseTypeId: Joi.string().uuid().optional().messages({
        'string.guid': 'expenseTypeId must be a valid UUID',
    }),
    sortBy: Joi.string()
        .valid(...EXPENSE_SORT_FIELDS)
        .optional()
        .messages({
            'any.only': `sortBy must be one of ${EXPENSE_SORT_FIELDS.join(', ')}`,
        }),
    order: Joi.string().valid(...SORT_ORDERS).optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().min(Joi.ref('dateFrom')).optional().messages({
        'date.min': 'dateTo must be greater than or equal to dateFrom',
    }),
});

const idParam = Joi.object({
    id: Joi.string().trim().required().messages({
        'any.required': 'id param is required',
    }),
});

const getAiSummary = Joi.object({
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().min(Joi.ref('dateFrom')).optional().messages({
        'date.min': 'dateTo must be greater than or equal to dateFrom',
    }),
});

const exportExpenses = Joi.object({
    format: Joi.string().valid('csv', 'xlsx', 'excel', 'pdf').required().messages({
        'any.only': 'format must be one of csv, xlsx, excel, pdf',
        'any.required': 'format is required',
    }),
    categoryId: Joi.string().uuid().optional().messages({
        'string.guid': 'categoryId must be a valid UUID',
    }),
    expenseTypeId: Joi.string().uuid().optional().messages({
        'string.guid': 'expenseTypeId must be a valid UUID',
    }),
    sortBy: Joi.string()
        .valid(...EXPENSE_SORT_FIELDS)
        .optional()
        .messages({
            'any.only': `sortBy must be one of ${EXPENSE_SORT_FIELDS.join(', ')}`,
        }),
    order: Joi.string().valid(...SORT_ORDERS).optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().min(Joi.ref('dateFrom')).optional().messages({
        'date.min': 'dateTo must be greater than or equal to dateFrom',
    }),
});

export default { createExpense, updateExpense, getExpenses, getAiSummary, exportExpenses, idParam };

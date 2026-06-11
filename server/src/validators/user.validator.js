import Joi from 'joi';
import userEnums from '../enums/user.enums.js';
import commonEnums from '../enums/common.enums.js';

const GENDERS = Object.values(userEnums.gender);
const USER_SORT_FIELDS = Object.values(userEnums.sortFields);
const SORT_ORDERS = Object.values(commonEnums.sortOrder);

const updateUser = Joi.object({
    firstName: Joi.string().trim().min(2).max(50).optional().messages({
        'string.min': 'firstName must be at least 2 characters',
        'string.max': 'firstName must be at most 50 characters',
    }),
    lastName: Joi.string().trim().max(50).optional(),
    dob: Joi.date().max('now').optional().messages({
        'date.max': 'Date of birth cannot be in the future',
    }),
    gender: Joi.string()
        .valid(...GENDERS)
        .optional()
        .messages({
            'any.only': `gender must be ${GENDERS.join(' or ')}`,
        }),
    monthlyIncome: Joi.number().min(0).optional().messages({
        'number.min': 'monthlyIncome must be 0 or greater',
    }),
    budget: Joi.number().min(0).optional().messages({
        'number.min': 'budget must be 0 or greater',
    }),
    currency: Joi.string().trim().max(10).optional(),
    profileImage: Joi.string().uri().optional().messages({
        'string.uri': 'profileImage must be a valid URL',
    }),
});

const getUsers = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    firstName: Joi.string().trim().optional(),
    email: Joi.string().trim().optional(),
    sortBy: Joi.string()
        .valid(...USER_SORT_FIELDS)
        .optional()
        .messages({
            'any.only': `sortBy must be one of ${USER_SORT_FIELDS.join(', ')}`,
        }),
    order: Joi.string()
        .valid(...SORT_ORDERS)
        .optional()
        .messages({
            'any.only': `order must be ${SORT_ORDERS.join(' or ')}`,
        }),
});

const idParam = Joi.object({
    id: Joi.string().trim().required().messages({
        'any.required': 'id param is required',
    }),
});

export default { updateUser, getUsers, idParam };

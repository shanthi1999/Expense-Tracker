import Joi from 'joi';
import commonEnums from '../enums/common.enums.js';

const ENTITY_SORT_FIELDS = Object.values(commonEnums.entitySortFields);
const SORT_ORDERS = Object.values(commonEnums.sortOrder);

const createCategory = Joi.object({
    title: Joi.string().trim().min(1).max(100).required().messages({
        'string.min': 'title cannot be empty',
        'string.max': 'title must be at most 100 characters',
        'any.required': 'title is required',
    }),
    description: Joi.string().trim().max(500).optional().messages({
        'string.max': 'description must be at most 500 characters',
    }),
    categoryColorCode: Joi.string().pattern(commonEnums.hexColorPattern).optional().messages({
        'string.pattern.base': 'categoryColorCode must be a valid hex color e.g. #abc or #aabbcc',
    }),
});

const updateCategory = Joi.object({
    title: Joi.string().trim().min(1).max(100).optional(),
    description: Joi.string().trim().max(500).optional(),
    categoryColorCode: Joi.string().pattern(commonEnums.hexColorPattern).optional().messages({
        'string.pattern.base': 'categoryColorCode must be a valid hex color e.g. #abc or #aabbcc',
    }),
})
    .min(1)
    .messages({
        'object.min': 'At least one field must be provided for update',
    });

const getCategories = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    title: Joi.string().trim().optional(),
    sortBy: Joi.string()
        .valid(...ENTITY_SORT_FIELDS)
        .optional()
        .messages({
            'any.only': `sortBy must be one of ${ENTITY_SORT_FIELDS.join(', ')}`,
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

export default { createCategory, updateCategory, getCategories, idParam };
